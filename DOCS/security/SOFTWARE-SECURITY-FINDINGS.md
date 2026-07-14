# Software Security Findings — Maison Malka — 2026-07-14

> Read-only audit against software-security principles. Code remediations for Medium findings may follow in Phase 4 Developer work; this file records the audit snapshot.
> Scope: `src/`, `prisma/`, auth/checkout/admin order surfaces.

## Summary

| Severity | Count |
|---|---|
| 🔴 critical | 0 |
| 🟡 risk (Medium) | 5 |
| 🔵 nit | 1 |

**Domains:** authn/authz · input/files · data/secrets · sessions · errors/defaults

Top 3 to fix first:
1. 🟡 `src/app/[locale]/order/[id]/page.tsx:18` — unauthenticated order load by id (select only id / fail closed for PII)
2. 🟡 `src/lib/actions/orders.ts` — quantity / notes length upper bounds
3. 🟡 `src/middleware.ts` — admin path checks session but not `admin` role (layout still enforces)

---

## Authentication — PASS

- Admin login verifies app `User.role === admin` (`src/lib/actions/auth.ts`); non-admins signed out.
- Public register forces `customer` and blocks `ADMIN_EMAIL` signup (`src/lib/actions/orders.ts`).

## Authorization (IDOR / ownership) — WARN

- 🟡 `src/app/[locale]/order/[id]/page.tsx:18` — `findUnique({ where: { id } })` without ownership/token; page currently renders only `order.id` (PII not displayed) but loads full row → existence oracle + future risk if fields added. **Why:** authorization / fail-closed. **Fix:** `select: { id: true }` only, or require opaque confirmation token.
- Admin order mutations use `requireAdmin()` (`src/lib/actions/admin-orders.ts`) — PASS.
- Public customers cannot list admin order APIs — PASS.

## Input Validation — WARN

- 🟡 `src/lib/actions/orders.ts` — quantity checked `< 1` only; no upper bound. **Fix:** cap e.g. `quantity <= 50`.
- 🟡 `src/lib/actions/orders.ts` — `customer_notes` no max length. **Fix:** truncate/reject > e.g. 1000 chars.
- Guest checkout recomputes prices server-side from DB — PASS.
- Fulfillment date validation (lead time / Saturday) — PASS.

## Data / Secrets — PASS

- `.gitignore` covers `.env` and `.env*.local`; `.env.example` placeholders only.
- Only `NEXT_PUBLIC_SUPABASE_*` (anon URL/key) are public; service role and Resend server-only.
- No card/payment data stored.

## Sessions & tokens — PASS (with note)

- Supabase session cookies via `@supabase/ssr`.
- 🟡 `src/middleware.ts` — `/admin` (except login) requires session user but not admin role; `admin/(protected)/layout.tsx` and actions re-check. Defense-in-depth gap only.

## Safe file handling — WARN

- 🟡 `src/app/api/admin/upload/route.ts` — validates size + Content-Type allowlist; no magic-byte sniff. **Fix:** optional file-type library / magic check.

## Logging — PASS

- Error logs for Resend/notification failures; no intentional dump of full customer PII in verified paths.

## Error handling / secure defaults — PASS

- Status transitions fail closed via `assertTransition`.
- Illegal admin transitions rejected.

## Out-of-code notes

- Production Resend keys and Vercel Production env must be configured before live email E2E (ops, not code).
- Privacy Amendment 13 gaps → `PRIVACY-COMPLIANCE-AMENDMENT13.md`.

## Coverage gaps

- Full `npm audit` dependency tree not exhaustively signed off.
- Live Production headers/reachability not verified in this pass (see infra report + runtime smoke).
- Rate-limit on checkout deferred as known Medium residual if not implemented in Phase 4.

## Method

- Spot-check of Maison Malka focus areas on 2026-07-14.
- Each Critical would require line-level confirm; none raised to Critical.
