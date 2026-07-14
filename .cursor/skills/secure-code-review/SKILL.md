---
name: secure-code-review
description: >
  Audits application code against 16 software-security principles (auth, IDOR,
  input validation, secrets, sessions, logging, error handling, secure defaults,
  supply chain) and produces a read-only Markdown report. Use before production
  (Phase 4), after major auth/order changes, or when the user asks for a security
  code audit. Read-only — writes only DOCS/security/SOFTWARE-SECURITY-FINDINGS.md.
---

# secure-code-review (Cursor)

Audit application code against software-security principles. **Read-only** on code.

## Single source of truth (no duplicates)

| Item | Path |
|---|---|
| Lecturer archive | `תיקיית חומרים - לקלוד/security-skills/` — do not copy again |
| Baseline references | `references/` in this skill folder |
| **Report output** | `DOCS/security/SOFTWARE-SECURITY-FINDINGS.md` only |

Do not write reports under `src/`, `team-Yuri/`, or multiple security folders.

## When to use

- Phase 4 — Production Readiness
- After implementing auth, orders, admin panel, or payments
- User asks: "security audit", "בדיקת אבטחה", "IDOR", "secure review"

## Baseline (load on demand)

Load `references/02-software-principles.md` first, then domain deep-dives as needed.
See original skill structure in `references/` (01–12).

## Workflow (Cursor-adapted)

1. **Scope:** repo root or path user gives. Detect stack (Next.js, Prisma, Supabase).
2. **Load** `references/02-software-principles.md`.
3. **Audit domains** (sequential or parallel Task subagents, read-only):
   - `authn-authz` — principles 1, 2 (IDOR, ownership)
   - `input-files` — principles 3, 7 (validation, uploads)
   - `data-secrets-sessions` — principles 4, 5, 6, 9
   - `errors-defaults` — principles 10, 11
   - `supply-chain` — principle 12 (`npm audit`, lockfiles)
4. **Dedupe** findings; sort by severity.
5. **Spot-check every critical finding** against actual code lines.
6. **Document coverage gaps** — what was not checked.
7. **Write report** to `DOCS/security/SOFTWARE-SECURITY-FINDINGS.md` using
   `assets/findings-template.md`.

## Maison Malka focus areas

Prioritize for this project:

- Admin routes protected (Supabase Auth + role)
- Order IDOR (customer cannot read others' orders)
- Guest checkout data handling
- PII in logs (name, phone, email, address)
- `.env` / secrets not committed
- Prisma queries — no raw unsafe SQL
- File upload validation (product images)

## Rules

- Read-only on audited code. Describe fixes in report — do not apply.
- Repo-relative `file:line` paths only.
- No false critical findings.
- Date at run time, not hard-coded.

## Related skills

- Infrastructure → `infra-security-review`
- Israeli privacy law → `israel-privacy-compliance`
