---
name: israel-privacy-compliance
description: >
  Audits a system for compliance with Israel Privacy Protection Law Amendment 13,
  2017 Information Security Regulations, and 2025 AI guidance. Produces a Hebrew
  compliance report with law citations and gap analysis. Use before production
  when handling customer PII (name, phone, email, address, orders). Read-only —
  writes only DOCS/security/PRIVACY-COMPLIANCE-AMENDMENT13.md.
---

# israel-privacy-compliance (Cursor)

Audit Israeli privacy-law compliance. **Read-only** on code.

## Single source of truth (no duplicates)

| Item | Path |
|---|---|
| Lecturer archive | `תיקיית חומרים - לקלוד/security-skills/` — do not copy again |
| Legal baseline | `references/` in this skill folder |
| **Report output** | `DOCS/security/PRIVACY-COMPLIANCE-AMENDMENT13.md` only |

## When to use

- Phase 4 — before production launch
- Maison Malka stores: customer name, phone, email, delivery address, order history
- User asks: "תיקון 13", "פרטיות", "privacy compliance", "חוק הגנת הפרטיות"

## Baseline (load on demand)

Load `references/01-amendment-13-overview.md` first, then category files 02–08.

## Workflow (Cursor-adapted)

1. **Scope:** repo root. Map data fields from ERD/PRD (Customer, Order, User).
2. **Classify data** — load `02` + `03`; determine security level.
3. **Audit categories** (sequential or parallel read-only):
   - data-classification
   - consent-minimization
   - access-logging
   - encryption-network
   - data-subject-rights
   - ai-processing (mark N/A if no AI in product)
4. **Every finding needs a law citation** (סעיף/תקנה).
5. **Spot-check critical findings** against code.
6. **Write report** to `DOCS/security/PRIVACY-COMPLIANCE-AMENDMENT13.md` using
   `templates/compliance-report-template.md`.

## Maison Malka context

- Customer PII: name, phone, email, address on orders
- Optional registered accounts (Supabase Auth)
- Resend for transactional email — check data processing
- Vercel + Supabase — third-party processors
- No online card storage (manual payment — reduces PCI scope)
- Guest checkout + optional registration

## Rules

- Read-only on code. Only the report is written.
- Include disclaimer: technical analysis, not legal advice.
- Out-of-org items (signed DPA, infra) → context section, not code defects.
- Hard-delete vs soft-delete tension — flag per `references/06-data-subject-rights.md`.

## Related skills

- Code security → `secure-code-review`
- Infrastructure → `infra-security-review`
