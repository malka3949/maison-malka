# Infrastructure Security Findings — Maison Malka — 2026-07-22

> Initial audit was read-only. **Remediation status updated 2026-07-22**.

## Remediation status (Wave 1)

| Finding | Status |
|---|---|
| Global security headers (HSTS, XFO, Referrer-Policy, Permissions-Policy, nosniff) | **Fixed** in `next.config.ts` |
| `.env.production` / `.env.development` gitignore | **Fixed** |
| CSP | **Residual** — optional follow-up (Supabase/Auth/Storage allowlist) |
| Production env separation / Resend domain | **Operator** — see `PRODUCTION-LAUNCH.md` |

---

> Original audit text below (historical).

## Summary

| Severity | Count |
|---|---|
| 🔴 critical | 0 |
| 🟡 risk | 5 |
| 🔵 nit | 3 |

Top 3 to fix first:
1. 🟡 `next.config.ts: headers()` — no global CSP / HSTS / X-Frame-Options / Referrer-Policy / Permissions-Policy
2. 🟡 `.gitignore` — `.env.production` / `.env.development` not ignored (only `.env` and `.env*.local`)
3. 🟡 `README.md: Vercel deployment` — no preview-vs-production env separation or `RESEND_DEV_TO` / HTTPS `NEXT_PUBLIC_APP_URL` production warnings

---

## Network exposure / ports / proxy — PASS (with notes)

- No `docker-compose*`, `Dockerfile*`, or host `ports:` publishing. No in-repo reverse-proxy config. Edge is expected to be **Vercel** (managed); data plane is **Supabase** (managed). No `PORT_MAP.md` in repo.
- 🔵 `next.config.ts: rewrites fallback /uploads/* → /api/media/*` — public same-origin media proxy for intended public Storage objects (`product-images`, `site-media`). Path segments filter `..` / `\0`. **Why:** `02-network-and-ports.md §front-proxy`. **Fix:** none required for public catalog images; keep buckets public-read only for non-sensitive assets (confirm in Supabase console).
- 🔵 `src/middleware.ts` — `/admin` requires a Supabase session; `src/app/admin/(protected)/layout.tsx` + `/api/admin/*` use `requireAdmin()` (role check). Admin surface is published on the same public host (normal for Vercel). **Why:** `02-network-and-ports.md §front-proxy`. **Fix:** none for infra; deeper authz belongs to `secure-code-review`.
- No evidence of metrics/actuator/debug ports or DB ports published by this repo.

## TLS / HTTPS / security headers — WARN

- `vercel.json` **absent**. Platform default for Vercel is HTTPS termination + HTTP→HTTPS; not re-declared in-repo. **Live** HSTS/ciphers need `runtime-verify` against the deployed URL.
- 🟡 `next.config.ts: headers()` — security headers applied only to `/uploads/product-images/:path*` and `/uploads/site-media/:path*` (`X-Content-Type-Options: nosniff` + Cache-Control). **Missing globally:** `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` / `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`. **Why:** `03-tls-and-headers.md §security-headers` / `§HSTS`. **Fix:** add a site-wide `headers()` block in `next.config.ts` (or Vercel project headers) with CSP tailored to Supabase Auth/Storage + self, HSTS (`max-age` ≥ 15552000), `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, deny framing, and a restrictive `Permissions-Policy`.
- 🔵 `next.config.ts: images.remotePatterns` — allows `https://*.supabase.co` public Storage paths only. Reasonable for Next Image; not a TLS finding.

## Containers / images / compose — PASS (N/A)

- No `Dockerfile*`, `docker-compose*`, or `.dockerignore` in scope. Container hardening checks do not apply. Deploy model: Vercel serverless/Node + managed Supabase.

## Secrets in env & CI — WARN

- ✅ Tracked env template only: `.env.example` (placeholders: `your-anon-key`, `your-service-role-key`, `re_your_resend_api_key`). No live JWT/`eyJ…` / long Resend secrets in the example.
- ✅ `.gitignore` ignores `.env` and `.env*.local`; `git status` shows `.env.local` as ignored. `*.pem` ignored. `.vercel` ignored. `.cursor/mcp.json` ignored.
- 🟡 `.gitignore` — does **not** ignore `.env.production`, `.env.development`, `.env.staging` (verified: `git check-ignore` exit 1). Accidental commit of production secrets is possible. **Why:** `05-secrets-and-ci.md §committed-env`. **Fix:** add `.env.*` with `!.env.example` (or explicit `.env.production` / `.env.development` rules).
- 🟡 No `.github/workflows` (no CI). No secret-scanning step (gitleaks/trufflehog) and no deploy pipeline controls. **Why:** `05-secrets-and-ci.md §CI`. **Fix:** add a minimal CI workflow with secret scanning on PRs before production; keep deploy secrets only in Vercel/GitHub Actions secrets.
- 🟡 `README.md` § Vercel deployment (lines 95–99) — “Set all environment variables from `.env.example`” with no guidance on: Production vs Preview env scoping; unset `RESEND_DEV_TO` in production; set `NEXT_PUBLIC_APP_URL` to the HTTPS production origin (example defaults to `http://localhost:3000`); never prefix service/Resend/Gemini/DB secrets with `NEXT_PUBLIC_`. **Why:** `05-secrets-and-ci.md` + skill Maison Malka focus (preview vs production). **Fix:** expand README deploy checklist; in Vercel, scope secrets to Production and use separate Preview values where needed.
- ✅ `NEXT_PUBLIC_*` usage limited to `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` — appropriate public surface. `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `GEMINI_API_KEY`, `DATABASE_URL` are server-only.
- ✅ Service-role clients: `src/lib/supabase/admin.ts` used from server actions / `src/app/api/admin/*` only (with `requireAdmin`). Browser client (`src/lib/supabase/client.ts`) uses anon key only. No `"use client"` under `src/lib/supabase/`.
- 🔵 `src/lib/supabase/service.ts` — duplicate unused `createServiceClient` (same service-role pattern as `admin.ts`). Dead code increases foot-gun risk if later imported from a client boundary. **Why:** `05-secrets-and-ci.md` (secret surface hygiene). **Fix:** remove or consolidate into one server-only module.
- Local `.env.local` exists and is gitignored (not audited for value contents in this report). If those values were ever committed historically, **rotate** Supabase service role, DB password, Resend, and Gemini keys.

---

## Low-confidence / needs human review

- 🟡? Vercel project console — Preview deployments may inherit Production secrets if not scoped; cannot confirm from repo alone.
- 🟡? Supabase dashboard — RLS enabled on all tables; Storage bucket policies match “public read / service-role write”; DB not exposed beyond Supabase pooler. Out of repo config.
- 🟡? Live response headers (HSTS from Vercel edge, CSP absence) — confirm with `runtime-verify` / `curl -I` on production URL.
- ❔ Whether any secret ever landed in git history — full history scan not completed in this pass; recommend gitleaks on the remote.

## Coverage gaps & follow-ups

This report audits **config only**. Not covered here:
- **App-code** vulns → `secure-code-review` / `SOFTWARE-SECURITY-FINDINGS.md`.
- **Coding-agent config** → `agent-hardening-review`.
- **Live reachability** (ports/headers actually exposed) → `runtime-verify`.
- **Cloud IAM / Vercel team access / Supabase org roles / firewall** → infra-ops, out of scope.
- Blind spots: Vercel dashboard env scopes; Supabase Auth email templates / redirect allowlists; Resend domain verification state; no `vercel.json` or CI YAML to inspect.

## Method

- Auditor (read-only): infra-security-review, by category. Baseline: `.cursor/skills/infra-security-review/references/`.
- Inspected: `.env.example`, `.gitignore`, `next.config.ts`, `README.md` (deploy), `src/middleware.ts`, `src/lib/supabase/{client,server,admin,service}.ts`, admin upload API routes, media proxy routes, absence of `vercel.json` / `.github/workflows` / Docker.
- Cross-checked published ports against a port-map file: **none present**.
- Confirmed `.env` / `.env.local` ignore rules via `git check-ignore`; confirmed `.env.production` / `.env.development` **not** ignored.
