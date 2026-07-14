# Architecture Phase 4

## Phase Identifier
PHASE=4

## Status
STATUS: READY_FOR_MANAGER

## Phase Goal

Prepare Maison Malka for real customer use: production deployment on Vercel (Production URL serves full MVP), close operational gaps from Phases 1–3 (especially live Resend), document security and privacy review evidence, define backup and monitoring posture — without adding Phase 5 product features (payments, WhatsApp, loyalty).

## Source References

- `team-Yuri/plan.md` — Phase 4: Production Readiness
- `team-Yuri/arch-phase1.md`, `arch-phase2.md`, `arch-phase3.md` — ship as-is; harden, do not redesign
- `DOCS/Maison-Malka-Development-Phases-Plan.md` — Phase 4
- `DOCS/Maison-Malka-Architecture-Plan.md` — §§12–13 infrastructure & security
- `DOCS/Maison-Malka-Technology-Stack-Decision.md` — Vercel, Supabase, Resend
- `DOCS/security/README.md` — expected audit report locations
- `.cursor/rules/50-git-workflow.md` — `develop` integration; `main` for production release
- `.cursor/skills/secure-code-review`, `infra-security-review`, `israel-privacy-compliance` (run via Developer / user orchestration; Architect owns contract only)

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| Production app host = Vercel Production | Approved stack; Next.js native | Production project/env distinct from Preview; Production URL is acceptance surface |
| Production DB = existing Supabase project (or dedicated prod project if already separate) | Architecture Plan; avoid re-platforming | Document which Supabase project is production; no new DB provider |
| Release train: integrate on `develop`, promote to `main` for production | Git workflow rule | Phase 4 branch from `develop`; production cutover tied to merge/deploy from `main` (or explicit Vercel Production branch = `main`) |
| Security validation via existing skills + reports in `DOCS/security/` | plan.md mitigations; DOCS/security README | Must produce findings docs; Critical findings must be fixed or explicitly accepted with risk note in `dev-phase4.md` |
| Privacy: Amendment 13 light compliance pass | plan.md PII risk | Run `israel-privacy-compliance`; document residuals; not full legal certification |
| Backup strategy = document Supabase managed backups + restore runbook | Managed PG; phase completion requires backup process | No custom backup microservice in MVP; verify retention settings and write ops doc |
| Error monitoring = minimal viable observability | Phases plan “error monitoring” | At least one: Vercel Production logs + documented triage, **or** lightweight third-party (e.g. Sentry) if free tier and low effort; Manager picks one approach within this contract |
| Performance = targeted quick wins only | Avoid scope creep | No rewrite; fix only High-impact regressions found on Production/Lighthouse or Critical review findings |
| Close Phase 3 email residual | Architecture requires Resend for ops | Production env must have working `RESEND_API_KEY` + verified `RESEND_FROM_EMAIL`; live send proof required for Phase 4 close (no production waiver for email) |
| Functionally testable outcome = Production E2E | A7; plan Phase 4 | Guest browse → cart → checkout → admin approve/reject → email path verifiable on Production URL |

## Constraints / Non-Negotiables

- No online payment / payment-gateway integration (Phase 5+)
- No WhatsApp / SMS / marketing automation
- No Phase 5 growth features (loyalty, coupons, seasonal campaigns)
- Do not redesign storefront UI or invent new business domains
- Do not store payment card data
- Secrets only in Vercel/env stores — never commit tokens
- Admin remains role-gated; IDOR-sensitive order access stays admin-only
- Production cutover requires documented E2E on Production URL
- TypeScript / lint / tests remain green on release branch

## Technical Boundaries / Out of Scope

- New product features beyond readiness (order edit, customer portal expansion, multi-admin RBAC beyond existing `admin`)
- Custom backup infrastructure or multi-region DR
- Full SOC2 / penetration-test engagement (skill-based reviews only)
- CDN product change, rewriting auth provider, microservices split
- Merging to `main` without user approval (git rule)

## Dependencies and Interfaces

### Builds on Phases 1–3
- Admin catalog + auth
- Public storefront `[locale]` checkout → Order `pending_approval`
- Admin order list / detail / calendar + status transitions
- Notification module (`src/lib/notifications/`) + Resend hooks

### External services (production configuration)
- Vercel Production deployment of `main` (or Documented Production branch)
- Supabase Production: PostgreSQL, Auth, Storage (`product-images`)
- Resend Production sender (verified domain preferred; onboarding domain only if explicitly accepted for early soft-launch)

### Environment variables (Production — names only)
Must be set in Vercel Production (same names as `.env.example`):
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `ADMIN_EMAIL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

### Artifacts / docs this phase produces
- `DOCS/security/SOFTWARE-SECURITY-FINDINGS.md` (or equivalent from secure-code-review)
- `DOCS/security/INFRA-SECURITY-FINDINGS.md` (or equivalent from infra-security-review)
- `DOCS/security/PRIVACY-COMPLIANCE-AMENDMENT13.md` (or equivalent from israel-privacy-compliance)
- Ops runbook section in README (or `DOCS/ops/` only if Manager approves new folder — prefer README / existing `DOCS/` without new top-level folders): backup, restore outline, monitoring, incident first response
- `team-Yuri/dev-phase4.md` with Production URL, E2E evidence, email message ids

### Git
- Branch: `phase-4/production-readiness` from `develop`
- Milestone commits; push branch
- Promote to `main` only with explicit user approval (production release)

## Data / State Considerations

- Production data is live PII (orders: name, phone, email, address) — treat Supabase Production as sensitive
- Prefer not wiping Production for demos; use seed only on non-prod if needed
- Migrations: apply via controlled `prisma migrate deploy` against Production DB with documented backup point before migrate
- Storage bucket policies: public read for product images only; no public write

## Security / Privacy Considerations

- Run secure-code-review focusing on: checkout, admin order actions, auth/session, upload API, env exposure
- Run infra-security-review focusing on: Vercel env, Supabase Auth/Storage, secrets in client bundles, HTTPS/headers as available
- Run israel-privacy-compliance light pass: purpose limitation, PII inventory, retention notes, access (admin vs public)
- Fix Critical/High findings required for phase PASS unless user-accepted risk documented
- Resend: no client exposure of API key; emails only to order `customer_email`
- Confirm `SERVICE_ROLE` and DB URL never in `NEXT_PUBLIC_*`

## Testing and Lint Expectations

- `npm run lint` PASS
- `npm test` PASS (no regression; add tests only if Critical finding requires)
- `npm run build` PASS (or documented Windows EPERM workaround with `next build` + clean prisma generate if still relevant)
- Production E2E checklist documented in `dev-phase4.md`
- Security/privacy reports linked and summarized in `dev-phase4.md`

## Functional Testability

- **Page/screen the user can open:** Production URL `/he`, catalog, PDP, cart, checkout; `/admin/login`, `/admin/orders`
- **User-visible behavior:** Real guest order on Production → appears in admin → approve/reject → customer email received
- **Command-line flow:** migrate deploy (if needed) → production deploy → smoke URLs return 200
- **API endpoint / request:** Status update and order create still succeed under Production env
- **Minimal end-to-end flow:** Home → product → cart → checkout → admin approve → Resend message id recorded
- **Expected observable result:** Business can operate Maison Malka from Production URL with emails live and known risks documented

This phase is **not** infrastructure-only: Production URL E2E is mandatory.

## Handoff Notes for Manager

Suggested milestone order:

1. Git branch `phase-4/production-readiness` from `develop`
2. Production Vercel project wiring + all env vars (incl. Resend) + deploy from release path (`main` promotion plan)
3. Close Resend residual: live send proof on Production (or Production-linked Preview if Production not yet public — prefer Production)
4. Security skill runs → write reports under `DOCS/security/`
5. Privacy skill run → report under `DOCS/security/`
6. Backup/restore runbook + confirm Supabase backup settings
7. Monitoring choice + short ops section in README
8. Fix Critical/High findings within phase scope
9. Production E2E evidence + `dev-phase4.md`
10. Optional: user-approved merge `develop`/`phase-4` → `main` and Production deploy evidence

Acceptance must require:
- Working Production URL (or documented Production deployment URL)
- E2E order + admin approval path
- Live Resend proof (message ids)
- Security + privacy report artifacts present
- Backup process documented
- No Phase 5 feature creep

Git: base `develop`; do not work on `main` until release approve.

## Architect Review
ARCHITECT_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(pending — after Developer delivery and Manager approval)

### Required Corrections

(none — pre-review)
