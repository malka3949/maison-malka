# Security Audit Reports

This folder holds audit outputs from Cursor security skills and launch ops checklists.

| Skill / doc | Report file |
|---|---|
| `secure-code-review` | `SOFTWARE-SECURITY-FINDINGS.md` |
| `israel-privacy-compliance` | `PRIVACY-COMPLIANCE-AMENDMENT13.md` |
| `infra-security-review` | `INFRA-SECURITY-FINDINGS.md` |
| Production cutover | `PRODUCTION-LAUNCH.md` (operator checklist; env names match `.env.example`) |
| Real content fill | `CONTENT-CHECKLIST.md` (CMS, catalog, contact, trust) |

Source skills: `.cursor/skills/`.

**Launch order:** fill `CONTENT-CHECKLIST.md` → configure cloud per `PRODUCTION-LAUNCH.md` → smoke-test Production → go live.
