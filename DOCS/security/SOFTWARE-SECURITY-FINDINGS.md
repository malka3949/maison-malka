# Software Security Findings — Maison Malka — 2026-07-22

> Initial audit was read-only. **Remediation status updated 2026-07-22** after Wave 1 fixes.

## Remediation status (Wave 1)

| ID | Severity | Status |
|---|---|---|
| SCR-001 / SCR-002 | critical | **Fixed** — `resolveSafeUploadPath` / `sanitizeStorageKeyFromSegments` |
| SCR-003 | high | **Fixed** — `Order.access_token`; confirm page prefers HttpOnly cookie `mm_order_access_*` (`?t=` optional deep link) |
| SCR-005 | high | **Fixed** — `revalidateAdminPaths` requires admin |
| SCR-006 | high | **Fixed** — qty cap 99 |
| SCR-007 | high | **Fixed** — register phone normalize |
| SCR-008 | high | **Fixed** — sync no longer overwrites role |
| SCR-009 | high | **Fixed** — Gemini key via header |
| SCR-010 | high | **Mitigated** — admin export + anonymize PII + consent snapshot |
| SCR-011 / SCR-012 | high | **Fixed** — magic-byte sniff on uploads |
| SCR-013 | high | **Mitigated** — in-memory rate limits (login/checkout/register) |
| SCR-014 | medium | **Fixed** — Resend log redaction |
| SCR-015 | medium | **Fixed** — generic upload errors |
| SCR-004 | medium | **Partial** — layout `requireAdmin`; middleware session-only (known) |
| Headers / `.env.production` gitignore | — | **Fixed** |

**Residual known issues:** MFA via Supabase dashboard (see `PRODUCTION-LAUNCH.md`); middleware role check optional hardening; prefer Redis rate limits in multi-instance Production.

---

> Original audit text below (historical). Verify pass: /security-review skipped (Cursor skill `secure-code-review`).

## Summary

| Severity | Count |
|---|---|
| 🔴 critical | 2 |
| 🟡 risk | 14 |
| 🔵 nit | 4 |

**Principles covered:** 11 / 11 code-auditable · **Domains:** authn/authz · input/files · data/secrets/sessions · errors/defaults

Top 3 to fix first:
1. 🔴 **SCR-001** `src/app/api/media/product-images/[...path]/route.ts:33` — path traversal via decode-after-filter reads arbitrary files (e.g. `.env.local`).
2. 🔴 **SCR-002** `src/app/api/media/site-media/[...path]/route.ts:27` — same traversal/LFI on the site-media proxy.
3. 🟡 **SCR-003** `src/app/[locale]/order/[id]/page.tsx:21` — unauthenticated order confirmation by id (IDOR).

---

## 1. Authentication — WARN

- 🟡 **SCR-004** `src/middleware.ts:58` — Admin route gate checks only `supabase.auth.getUser()` (session present), not `role === admin`. Non-admin sessions can enter `/admin/*` until the layout redirects. **Why:** `02-software-principles.md §1 Authentication` + `07-authorization-and-roles.md §Where the check must live`. **Fix:** In middleware, after `getUser`, require an admin role claim/DB check (or fail closed to login without bouncing authenticated customers into a `/admin` ↔ `/admin/login` loop).
- 🟡 **SCR-005** `src/lib/actions/auth.ts:44` — `revalidateAdminPaths` is an exported server action with no auth check; anyone can trigger Next.js cache revalidation for admin paths. **Why:** `02-software-principles.md §1`. **Fix:** Call `requireAdmin()` and return/throw if unauthorized; or remove the export if unused.

## 2. Authorization (IDOR / ownership) — FAIL

- 🟡 **SCR-003** `src/app/[locale]/order/[id]/page.tsx:21` — Order confirmation loads `prisma.order.findUnique({ where: { id } })` with no session, ownership, email proof, or signed token. Anyone who obtains a `cuid` (checkout URL, email, Referer, shared link) can read status, line items, totals, and payment method. PII fields are not selected today, which limits blast radius but does not remove the IDOR. **Why:** `07-authorization-and-roles.md §IDOR` (unguessable id ≠ authorized). **Fix:** Bind access with a high-entropy secret (e.g. `access_token` column + required query param), or HttpOnly cookie set only at checkout for that order id; reject bare id lookups.
- 🔵 **SCR-N1** `src/app/admin/(protected)/layout.tsx:24` — Admin UI pages rely on layout `requireAdmin()` (PASS for page shell). Server actions under `src/lib/actions/{products,categories,admin-orders,site-cms,product-translate}.ts` and upload API routes also call `requireAdmin()` (spot-checked). **Why:** `07-authorization-and-roles.md §RBAC`. **Fix:** n/a — keep requiring admin inside every mutating action (do not rely on layout alone for API/actions).

## 3. Input Validation (mass-assignment) — WARN

- 🟡 **SCR-006** `src/lib/actions/orders.ts:117` — Checkout accepts `quantity` with only `quantity < 1` rejection; no upper bound. Large quantities can inflate totals/storage and abuse email/admin workflows. **Why:** `08-input-validation-and-injection.md §Validation strategy`. **Fix:** Cap quantity per line and cart (e.g. 1–99) server-side.
- 🟡 **SCR-007** `src/lib/actions/orders.ts:247` — `registerCustomer` stores `phone` without `normalizeIsraeliMobile` (unlike guest checkout). Invalid or oversized phone strings persist in `CustomerProfile`. **Why:** `08-input-validation-and-injection.md §Validate at the boundary`. **Fix:** Reuse `normalizeIsraeliMobile` and reject on failure; enforce max lengths on name/email/notes.
- 🔵 **SCR-N2** `src/lib/actions/orders.ts:267` — Public register hardcodes `UserRole.customer` and blocks `ADMIN_EMAIL` signup (good mass-assignment defense for `role`). **Why:** `08-input-validation-and-injection.md §Mass assignment`. **Fix:** n/a.

## 4. Data Protection — WARN

- 🟡 **SCR-008** `src/lib/auth.ts:30` — `syncUserFromAuth` upserts `role` from `ADMIN_EMAIL` on every sync (`update: { email, role }`). Admin privilege is a single env-email match, overwritten on each login/checkout sync—fragile and elevates whoever can authenticate as that email (Auth-side email change / misconfig). **Why:** `09-secrets-management.md` / `07-authorization-and-roles.md §Privilege escalation`. **Fix:** Do not auto-promote on email alone; keep admin role DB-managed (or Supabase app_metadata), never demote/promote silently on unrelated syncs.
- 🟡 **SCR-009** `src/lib/ai/gemini-translate.ts:41` — `GEMINI_API_KEY` is sent as a query parameter on the Google Generative Language URL. Secrets in URLs land in access logs, proxies, and Referer. **Why:** `02-software-principles.md §8` + `09-secrets-management.md`. **Fix:** Pass the API key in an `x-goog-api-key` (or `Authorization`) header instead of the query string.

## 5. Privacy by design (Amendment 13) — WARN

- 🟡 **SCR-010** `src/lib/actions/orders.ts:182` — Guest checkout persists full PII (`customer_name`, `customer_phone`, `customer_email`, `delivery_address`, notes) with no coded retention, anonymization, or data-subject delete/export path in `src/`. **Why:** `02-software-principles.md §5 Privacy by design`. **Fix:** Document retention; add admin/customer erase or anonymize for completed orders; minimize fields where possible. (Also covered by privacy skill for legal depth.)

## 6. Sessions & tokens — PASS (with notes)

- Spot-check: Auth uses Supabase SSR cookies via `src/lib/supabase/server.ts` / middleware `getUser()` (not raw JWT parsing from client). No app-issued magic links with tokens in storefront URLs found. Order id in URL is an authorization gap (see §2), not a session-token leak.
- 🔵 **SCR-N3** `src/lib/actions/auth.ts:35` — Post-login `redirect(next)` allows any path starting with `/admin` (e.g. `/admin/../he/...`) without normalizing to a safe relative admin path. **Why:** `08-input-validation-and-injection.md §Open redirect`. **Fix:** Allowlist exact admin paths or resolve and require `pathname === '/admin' || pathname.startsWith('/admin/')` after `path.posix.normalize`.

## 7. Safe file handling — FAIL

- 🔴 **SCR-001** `src/app/api/media/product-images/[...path]/route.ts:33` — Segments are filtered for literal `..` **before** `decodeURIComponent`. Encoded traversal (`%2e%2e`) passes the filter, then decodes to `..`. `localUploadAbsolutePath` (`src/lib/local-product-images.ts:8`) joins those parts under `public/uploads/product-images` without verifying the resolved path stays inside the uploads root—confirmed escape to repo-root `.env.local`. Successful GETs return file bytes to the client (secrets: `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.). The same path is later used in `writeLocalProductImage`, enabling write-outside-root if upstream fetch succeeds. **Why:** `08-input-validation-and-injection.md §Path traversal` + `02-software-principles.md §7`. **Fix:** Decode/normalize first; reject any segment that is `.`/`..` or contains separators; `path.resolve` and require `resolved.startsWith(uploadsRoot + sep)`; never read/write outside that root.
- 🔴 **SCR-002** `src/app/api/media/site-media/[...path]/route.ts:27` — Identical decode-after-filter + unsandboxed `localSiteMediaAbsolutePath` join (`src/lib/local-site-media.ts:7`). **Why:** same as above. **Fix:** same confinement helper shared by both media routes.
- 🟡 **SCR-011** `src/app/api/admin/upload/route.ts:80` — Upload allowlists MIME via client-provided `raw.type` / filename extension (`isAllowedImageType`) with no magic-byte sniff of the buffer. Size cap and `sanitizeFilename` are present; admin-only. **Why:** `08-input-validation-and-injection.md §File uploads`. **Fix:** Sniff file signatures (jpeg/png/webp) on `buffer` before storage; ignore client Content-Type except as a hint.
- 🟡 **SCR-012** `src/app/api/admin/upload-site-media/route.ts:76` — Same client MIME trust pattern as product upload. **Why:** same. **Fix:** same magic-byte allowlist.

## 8. Secure communication — WARN

- 🟡 **SCR-013** `src/lib/actions/orders.ts:46` / `src/lib/actions/auth.ts:8` — No application-level rate limiting on guest checkout, customer/admin login, or register. Enables order/email spam and password spraying. **Why:** `11-secure-communication.md` / `02-software-principles.md §8` (rate limit). **Fix:** Rate-limit by IP (+ email) on auth and checkout (middleware, Upstash, or edge limiter); lock out after N failures.
- Out-of-code: TLS/CORS/webhook signature largely infra (see infra skill). Storefront→Resend uses HTTPS.

## 9. Logging & monitoring — WARN

- 🟡 **SCR-014** `src/lib/notifications/resend.ts:56` — When `RESEND_DEV_TO` is set, logs full intended customer email: `` RESEND_DEV_TO redirect: ${input.to} → ${dest.to} ``. **Why:** `10-logging-and-audit.md` / `02-software-principles.md §9` (never log full PII). **Fix:** Log hashed/redacted recipient (e.g. `j***@example.com`) or omit destination; keep only message id / status.
- Spot-check: Checkout/admin-order `console.error` lines log email *error codes*, not full order PII payloads (good). No password/token logging found in `src/`.
- Gap: No structured audit log for admin login, order approve/reject, or PII export/delete (sensitive actions under-logged).

## 10. Error handling (fail-closed) — WARN

- 🟡 **SCR-015** `src/app/api/admin/upload/route.ts:161` — Catch returns `err.message` to the client (and similar at `upload-site-media/route.ts:144`), potentially leaking Storage/bucket internals. **Why:** `03-error-handling.md` / `02-software-principles.md §10`. **Fix:** Log full error server-side; return a generic Hebrew error to the client.
- 🔵 **SCR-N4** `src/middleware.ts:33` — If Supabase env vars are missing, middleware skips auth enrichment and continues (`NextResponse.next`). Admin pages still fail closed via `requireAdmin` in layout (null → redirect). **Why:** fail-closed preferred at the edge. **Fix:** Prefer hard-fail or force login redirect when admin routes lack configured auth env.

## 11. Secure defaults — WARN

- 🟡 **SCR-016** `src/lib/utils.ts:10` — New users default to `customer` unless email equals `ADMIN_EMAIL` (minimal default is good); however env-based auto-admin is a powerful default coupling (see §4 / SCR-008). **Why:** `04-secure-defaults.md`. **Fix:** Bootstrap first admin via controlled seed/migration; subsequent admins only via explicit DB/admin tool.
- Prisma usage: no `$queryRaw` / `$executeRaw` / string-concat SQL found under `src/` (PASS for SQL injection via Prisma).

---

## Out-of-code (process/infra) notes

- `.env` / `.env*.local` are gitignored; only `.env.example` is tracked (good). Confirm production secrets are not in Vercel logs from the Gemini query-string usage.
- `npm audit` at audit time: **3** dependency issues (**2 high**, **1 moderate**, **0 critical**) — track via supply-chain / `npm audit` remediation (principle 12); not expanded as code defects here.
- Supabase Storage buckets created as `public: true` for product/site images — expected for CDN-style assets; ensure RLS/policies still block non-image abuse at the project level (infra skill).
- Operational admin access (who may receive `ADMIN_EMAIL`, Resend domain verification, DB backups) is process — not coded defects.

## Low-confidence / needs human review

- 🟡? Whether Supabase Auth email-change flows can rebind an account to `ADMIN_EMAIL` without app-side checks — depends on Auth settings (confirm email, disable change). Recheck in Supabase dashboard.
- 🟡? Next.js static file serving of `public/uploads/**` vs API proxy — traversal is proven on the API route; static URL encoding behavior was not separately fuzzed.
- ❔ Unauthenticated Server Action CSRF/origin posture for Next.js version in use — framework defaults assumed; confirm `experimental.serverActions.allowedOrigins` / deployment host allowlist for production.

## Coverage gaps & follow-ups

This report is **not exhaustive**. What was not covered:
- **Not scanned / out of scope:** Full dependency advisory triage beyond `npm audit` counts; infrastructure (Supabase RLS policies, Storage policies, network) → `infra-security-review`; Israeli privacy legal mapping → `israel-privacy-compliance`; runtime exploit confirmation in a live browser (LFI path math verified via `path.join`, not HTTP-executed against a running server in this pass).
- **Blind spots:** Email HTML rendering in third-party clients; mobile deep links; future payment webhooks (none in `src/` yet); Prisma migrations / SQL outside `src/`.
- **Unverified claims:** Exact production exposure of `.env.local` depends on deployment filesystem layout (Vercel serverless may not ship `.env.local` as a readable file—still critical wherever the app reads from disk cache under `process.cwd()`, and the same bug can read other sensitive files present on the host).

## Method

- Auditors (read-only): secure-code-review skill, domains authn/authz · input/files · data/secrets/sessions · errors/defaults.
- Baseline: `secure-code-review/references/02-software-principles.md` (+ `07`, `08` deep-dives as needed).
- Each 🔴 was spot-checked against actual code lines and path-join resolution before listing.
