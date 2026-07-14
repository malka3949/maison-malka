---
name: infra-security-review
description: >
  Audits infrastructure configuration for deployment security: env vars, secrets,
  CI/CD, Vercel/Supabase settings references, TLS, and exposed services. Use
  before production (Phase 4) or when reviewing deployment setup. Read-only —
  writes only DOCS/security/INFRA-SECURITY-FINDINGS.md.
---

# infra-security-review (Cursor)

Audit **where the code runs** — deployment and config security. **Read-only** on config.

## Single source of truth (no duplicates)

| Item | Path |
|---|---|
| Lecturer archive | `תיקיית חומרים - לקלוד/security-skills/` — do not copy again |
| Baseline references | `references/` in this skill folder |
| **Report output** | `DOCS/security/INFRA-SECURITY-FINDINGS.md` only |

## When to use

- Phase 4 — Production Readiness
- Before first Vercel production deploy
- After adding CI, env vars, or Supabase/Vercel config
- User asks: "infra audit", "deployment security", "exposed secrets"

## Baseline (load on demand)

Load `references/01-infra-overview.md` first, then 02–05 by category.

## Workflow (Cursor-adapted)

1. **Scope:** repo root. Locate:
   - `.env*`, `.env.example`
   - `vercel.json`, Next.js config
   - GitHub Actions / CI workflows if present
   - `docker-compose*`, `Dockerfile*` if present
   - Supabase config references in docs/code
2. **Audit categories** (read-only):
   - `network-exposure` — published ports, public services
   - `tls-headers` — HTTPS, security headers (Vercel defaults + custom)
   - `container-hardening` — if Docker used
   - `secrets-config` — committed secrets, env handling, CI secrets
3. **Dedupe**; spot-check critical findings.
4. **Document coverage gaps** (cloud console settings, live reachability).
5. **Write report** to `DOCS/security/INFRA-SECURITY-FINDINGS.md` using
   `assets/infra-findings-template.md`.

## Maison Malka stack focus

- **Vercel** — env vars, preview vs production separation
- **Supabase** — RLS policies, service role key not in client
- **Resend** — API key in server env only
- No secrets in `NEXT_PUBLIC_*` except anon key (if used)
- `.gitignore` covers `.env.local`

## Rules

- Read-only on config. Anchor findings to file + directive.
- Config says *published*; live reachability needs manual verification.
- Committed secrets → recommend **rotate**, not just remove.

## Related skills

- Application code → `secure-code-review`
- Privacy law → `israel-privacy-compliance`
