# Manager Phase 4

## Phase Identifier
PHASE=4

## Status
STATUS: READY_FOR_DEVELOPER

## Phase Goal

Deliver production readiness for Maison Malka: Vercel Production URL serving the full MVP E2E (storefront → guest order → admin approve/reject → live Resend emails), security and privacy review reports under `DOCS/security/`, documented Supabase backup/restore ops, and minimal error monitoring — without Phase 5 product features.

## Source References

- `team-Yuri/arch-phase4.md`
- `team-Yuri/plan.md` — Phase 4
- `team-Yuri/arch-phase3.md` (Resend residual / no production waiver for email)
- `DOCS/Maison-Malka-Development-Phases-Plan.md` — Phase 4
- `DOCS/Maison-Malka-Architecture-Plan.md` — §§12–13
- `DOCS/Maison-Malka-Technology-Stack-Decision.md`
- `DOCS/security/README.md`
- `.cursor/rules/20-testing.md`, `30-docs.md`, `40-project-structure.md`, `50-git-workflow.md`
- Skills: `secure-code-review`, `infra-security-review`, `israel-privacy-compliance`

## Architecture Summary

- **Stack:** Same Next.js + Prisma + Supabase + Resend monolith; Phase 4 is harden + deploy, not redesign
- **Production host:** Vercel Production; acceptance surface = Production URL
- **DB:** Documented Supabase project as production; `prisma migrate deploy` only with pre-migrate backup note
- **Git:** Branch `phase-4/production-readiness` from `develop`; promote to `main` only with **explicit user approval**
- **Monitoring (Manager choice):** **Vercel Production logs + short triage section in README** (default). Sentry optional only if free-tier wiring is faster than documenting logs — do not block on Sentry
- **Security/privacy:** Skill runs → reports in `DOCS/security/` with names from README (or equivalent filenames documented in `dev-phase4.md`)
- **Out:** payments, WhatsApp, loyalty, custom backup service, full pen-test engagement

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M0 | Git branch | `phase-4/production-readiness` from `develop` | Branch pushed; recorded in `dev-phase4.md` |
| M1 | Production env inventory | Confirm Supabase project used for prod; list required Vercel Production env var **names** (no secrets in git) | Table in README or `dev-phase4.md` |
| M2 | Vercel Production deploy | Wire Production to release path (`main` preferred); deploy Production | HTTPS Production URL returns 200 for `/he` and `/admin/login` |
| M3 | Resend live on Production | Set `RESEND_API_KEY` + `RESEND_FROM_EMAIL` on Production; verify sender | Message ids for received + approved (or rejected) recorded |
| M4 | Secure-code-review | Run skill; write `DOCS/security/SOFTWARE-SECURITY-FINDINGS.md` | File exists; Critical/High listed with fix or accepted risk |
| M5 | Infra-security-review | Run skill; write `DOCS/security/INFRA-SECURITY-FINDINGS.md` | File exists; env/secrets/storage findings addressed |
| M6 | Privacy compliance | Run `israel-privacy-compliance`; write `DOCS/security/PRIVACY-COMPLIANCE-AMENDMENT13.md` | File exists; residuals documented |
| M7 | Fix Critical/High | Remediate or user-accepted risk notes in `dev-phase4.md` | No open Critical without acceptance |
| M8 | Backup / restore runbook | Document Supabase backup settings + restore outline in README Ops section | Steps a human can follow |
| M9 | Monitoring ops | Document Vercel logs triage + first-response in README | Ops section complete |
| M10 | Production E2E | Guest order → admin approve → email on Production | Order id + status + message ids in `dev-phase4.md` |
| M11 | Regression gates | `npm run lint`, `npm test`, build PASS on phase branch | Commands/results in `dev-phase4.md` |
| M12 | Release note (optional gate) | User-approved merge to `main` + Production redeploy if needed | Only if user says merge; otherwise document “pending user merge” |

## Detailed Development Plan

### M0 — Git branch
- `git fetch && git checkout develop && git pull --ff-only origin develop`
- `git checkout -b phase-4/production-readiness`
- Commit: `phase-4: start production readiness branch`

### M1 — Production env inventory
- Identify which Supabase project is Production (may be same as current `.env.local` if single project — document honestly)
- Document Vercel Production env checklist (names from arch-phase4)
- Confirm no secrets committed

### M2 — Vercel Production deploy
- Ensure Vercel project exists; Production environment configured
- Preferred: Production deploys from `main`. If Production currently tracks another branch, document and align with user toward `main`
- Until user approves merge to `main`, Developer may: (a) deploy Production after user merge, or (b) use a temporary Production deploy from phase branch **only if** Vercel allows and URL is explicitly labeled Production in evidence — prefer (a)
- Smoke: `/he`, `/en/catalog`, `/admin/login` HTTP 200

### M3 — Resend live
- Configure Production Resend vars
- Prefer verified domain; if using `onboarding@resend.dev`, state soft-launch limitation in `dev-phase4.md`
- Trigger received + approved (or rejected) emails on Production; capture message ids from Resend dashboard or API response logs
- **No waiver for Phase 4 COMPLETE** without live proof

### M4–M6 — Security & privacy skills
- Orchestrate / run skills per project (`secure-code-review`, `infra-security-review`, `israel-privacy-compliance`)
- Write findings under `DOCS/security/` matching README filenames
- Focus areas per arch-phase4 (checkout, admin orders, upload, auth, env, storage, PII inventory)

### M7 — Remediation
- Fix Critical/High within phase scope (authz, secret exposure, unsafe public access)
- Medium/Low may remain as documented debt
- User-accepted risks require explicit note naming finding + reason

### M8 — Backup runbook
- README section **Operations**: Supabase backup retention (as configured in dashboard), how to restore, who owns the process
- Rule: take backup note / snapshot awareness before any Production migrate

### M9 — Monitoring
- Default: how to open Vercel Production logs; what to check on 5xx; who to notify (business admin)
- Do **not** require Sentry unless already easy

### M10 — Production E2E
- On Production URL: browse → add to cart → guest checkout → admin login → approve
- Record: Production URL, order id, status transitions, Resend message ids
- Prefer not destroying Production catalog; use real test customer email you control

### M11 — Gates
- `npm run lint`, `npm test`, build on phase branch
- Push `phase-4/production-readiness`

### M12 — Merge to main (user gate only)
- Print ask for user: merge phase branch → `develop` → `main` then Production deploy
- Do not merge `main` without explicit approval

## Acceptance / Gating Criteria

Phase 4 passes Manager review only if **all** are true:

- [ ] Git branch `phase-4/production-readiness` from `develop`; commits + push documented
- [ ] Production URL documented and reachable (`/he`, `/admin/login`)
- [ ] Production env vars configured (names listed; secrets not in git)
- [ ] Live Resend proof: at least **received** + (**approved** or **rejected**) message ids
- [ ] `DOCS/security/SOFTWARE-SECURITY-FINDINGS.md` (or equivalent, path recorded)
- [ ] `DOCS/security/INFRA-SECURITY-FINDINGS.md` (or equivalent, path recorded)
- [ ] `DOCS/security/PRIVACY-COMPLIANCE-AMENDMENT13.md` (or equivalent, path recorded)
- [ ] No open Critical findings without documented acceptance
- [ ] Backup/restore runbook in README Ops
- [ ] Monitoring/triage documented in README Ops
- [ ] Production E2E: guest order → admin approve/reject path PASS
- [ ] `npm run lint` PASS
- [ ] `npm test` PASS
- [ ] Build PASS (or documented acceptable workaround)
- [ ] `dev-phase4.md` complete
- [ ] No Phase 5 features / payment gateway / WhatsApp added
- [ ] Merge to `main` either done with user approval **or** explicitly pending (non-blocking only if Production URL already serves E2E)

## Functional Testability Criteria

- **Page/screen:** Production `/he`, catalog, PDP, cart, checkout; `/admin/login`, `/admin/orders`, `/admin/orders/[id]`
- **User-visible behavior:** Customer places order on Production; admin processes it; customer gets email
- **Command-line:** migrate deploy (if needed) with backup note; Production deploy; smoke curls
- **API / server actions:** Order create + `updateOrderStatus` succeed under Production env
- **Minimal E2E:** Home → product → cart → checkout → admin approve → Resend message id
- **Expected result:** Maison Malka operable from Production URL with risks documented

## Test Plan

### Automated / local branch

| ID | Area | Command | Pass |
|---|---|---|---|
| T1 | Lint | `npm run lint` | Exit 0 |
| T2 | Unit tests | `npm test` | Exit 0 |
| T3 | Build | `npm run build` or documented `npx next build` | Exit 0 |

### Production smoke

| ID | Steps | Expected |
|---|---|---|
| S1 | Open Production `/he` | 200, Direction A homepage |
| S2 | `/en/catalog` | 200, LTR |
| S3 | `/admin/login` | 200 |
| S4 | Guest checkout on Production | Order `pending_approval` |
| S5 | Admin list shows order | Order visible |
| S6 | Approve (or reject) | Status updated in DB/UI |
| S7 | Resend dashboard / logs | Message ids for received + status email |
| S8 | Security reports present | Three files under `DOCS/security/` |
| S9 | README Ops | Backup + monitoring sections readable |

## Required Developer Evidence

`team-Yuri/dev-phase4.md` must include:

1. **Git:** branch, base `develop`, commits, push status
2. **Production URL** (exact)
3. Env inventory (names only) + which Supabase project
4. Milestone results M0–M12
5. Commands: lint, test, build
6. E2E steps + order id + before/after status
7. Resend message ids (received + approved/rejected)
8. Paths to three security/privacy reports + Critical/High disposition
9. Backup + monitoring documentation locations
10. Known limitations / accepted risks
11. Merge-to-`main` status (done / pending user)

## Out of Scope

- Online payment / card processing
- WhatsApp, SMS, marketing email campaigns
- Loyalty, coupons, seasonal products, delivery automation
- Custom multi-region backup / DR platform
- Full SOC2 or external penetration test
- Redesigning storefront or new admin domains
- Merging to `main` without user approval

## Risks / Open Questions

| Risk / Question | Mitigation |
|---|---|
| Single Supabase project for “dev + prod” | Document risk; prefer separate projects later; do not wipe DB |
| Resend domain unverified | Soft-launch on Resend default domain; state limitation |
| User delays merge to `main` | Allow Production E2E if Production already deployed; else block COMPLETE until deploy+E2E |
| Skills produce Critical flood | Prioritize authz/secrets; time-box Medium+ as debt |
| Windows `prisma generate` EPERM | Stop next/dev locks; use documented build path |
| Live PII during E2E | Use tester-owned email/phone only |

## Manager Review
MANAGER_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(pending — after Developer delivery)

### Required Corrections

(none — pre-review)
