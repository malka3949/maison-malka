# Infrastructure Security Findings — Maison Malka — 2026-07-14

> Read-only audit of deployment/config security. No live cloud console settings were modified.
> Scope: repo config (`.env.example`, `.gitignore`, `next.config.ts`, middleware env usage).

## Summary

| Severity | Count |
|---|---|
| 🔴 critical | 0 |
| 🟡 risk | 4 |
| 🔵 nit | 1 |

Top 3 to fix first:
1. 🟡 `next.config.ts` — missing security headers (CSP/frame/nosniff/referrer/permissions)
2. 🟡 `.gitignore` — `.env.production` / `.env.development` not explicitly ignored
3. 🟡 Cloud console — verify Vercel Preview vs Production env separation + Supabase backup/RLS

---

## Network exposure / ports / proxy — PASS

- No Docker Compose publishing Postgres.
- App intended for Vercel edge hosting (HTTPS by default).

## TLS / HTTPS / security headers — WARN

- 🟡 `next.config.ts` — no explicit `headers()` for `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or CSP. Vercel provides TLS/HSTS at platform layer; app-layer headers still recommended. **Fix:** add Next.js `headers()` security baseline.

## Containers / images — PASS (N/A)

- No Dockerfile in MVP scope.

## Secrets in env & CI — WARN

- PASS: `.env.example` uses placeholders; `.env.local` gitignored; `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` documented as server-only.
- 🟡 `.gitignore` — ignores `.env` and `.env*.local` but not `.env.production` / `.env.development` without `.local` suffix. **Fix:** ignore those filenames explicitly.
- 🟡 No GitHub Actions CI for secret scanning / deploy checks (optional for MVP).
- 🔵 Local `.env.local` at audit time lacked `RESEND_*` keys — production email will skip until configured.

## Maison Malka stack focus

| Check | Result |
|---|---|
| Service role never `NEXT_PUBLIC_*` | PASS (code + example) |
| Resend server-only | PASS |
| Anon key public by design | PASS (documented) |
| Storage bucket name documented | PASS (`product-images`) |

## Coverage gaps & follow-ups

- Confirm live Vercel Production env vars set (DATABASE_URL, Supabase, ADMIN_EMAIL, Resend).
- Confirm Supabase PITR / daily backups in dashboard; document in README Ops.
- Confirm Resend domain verification for Production sender.
- RLS policies in Supabase console not audited from repo (Prisma-dominant access).

## Method

- Config review 2026-07-14; no secrets printed from local env files.
