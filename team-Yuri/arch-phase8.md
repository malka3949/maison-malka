# Architecture Phase 8

## Phase Identifier
PHASE=8

## Status
STATUS: APPROVED

## Phase Goal

Deliver **manual marketing email campaigns** for the business administrator: optional marketing consent at checkout, admin compose-and-send of a promotional email to consented past customers via Resend, campaign history, and a working unsubscribe path Γאפ without online payments, loyalty, WhatsApp, or automated marketing drips.

## Source References

- `team-Yuri/plan.md` Γאפ Phase 8 Marketing Email Campaigns (locked 1╫ס+2╫נ)
- User decisions (2026-07-27): in-admin Resend campaigns; marketing opt-in + unsubscribe; not full Growth
- `team-Yuri/arch-phase3.md` Γאפ Resend transactional order emails
- `team-Yuri/arch-phase7.md` Γאפ checkout legal consent (terms Γיá marketing)
- `src/lib/notifications/{resend,templates,types}.ts`
- `src/components/storefront/CheckoutForm.tsx`, `src/lib/actions/orders.ts`
- `src/app/admin/(protected)/layout.tsx` Γאפ admin nav
- `DOCS/phases/12-marketing-email-campaigns.md` (product Phase 12)
- `DOCS/Maison-Malka-ERD.md`, `DOCS/Maison-Malka-Technology-Stack-Decision.md`
- `DOCS/security/PRIVACY-COMPLIANCE-AMENDMENT13.md` Γאפ secondary use / ╫ף╫ש╫ץ╫ץ╫¿ needs separate consent
- `.cursor/rules/40-project-structure.md`, `20-testing.md`, `50-git-workflow.md`

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| Team Yuri Phase 8 = campaigns only (not full Growth) | User locked scope; payments/loyalty deferred | Branch `phase-8/marketing-email-campaigns` from `develop` |
| Product doc = Phase 12 | Product Phase 08 already = admin orders | Do not rewrite `DOCS/phases/08-admin-orders.md` |
| In-app Resend for manual campaigns | Admin wants send-from-site; Resend already integrated | Amend prior Γא£transactional only / external ESP laterΓא¥ for **manual** campaigns; keep ESP option for scale |
| Separate campaign module | Avoid coupling promo sends to order lifecycle | New `src/lib/campaigns/` (or equivalent) beside notifications; do not extend `sendOrder*` |
| Audience = distinct `Order.customer_email` with active marketing consent | Past customers who ordered; privacy-safe | No send to emails without consent; normalize email for uniqueness |
| Optional checkout marketing checkbox | Terms consent is mandatory; marketing is secondary use | Not required to place order; server persists opt-in when checked |
| MarketingConsent entity (email-keyed) | Consent must survive across orders; support unsubscribe | Upsert on checkout opt-in; revoke on unsubscribe |
| Signed/token unsubscribe URL | Must work without login | Public locale route; HMAC or opaque token; one-click revoke |
| Plain subject + body (safe HTML or plaintext escaped) | No freeform HTML builder risk | Admin textarea; escape user content in template wrapper |
| Campaign + send history records | Admin needs audit of what was sent | EmailCampaign + per-recipient CampaignSend (or aggregate counts + status) |
| Batch send + RESEND_DEV_TO | Free-tier limits; safe local testing | Sequential/batched API calls; all campaign mail respects dev redirect |
| Hebrew-first admin UI | Matches existing admin | Campaign screens under `/admin/campaigns` + nav item |

## Constraints / Non-Negotiables

- Do not send marketing mail without active marketing consent
- Do not treat `terms_accepted_at` / legal consent as marketing opt-in
- Do not mix campaign send helpers with transactional `sendOrder*` APIs
- Do not invent top-level folders
- Do not add online payments, loyalty, coupons, WhatsApp, or drip automation
- Do not require Phase 4 Production / live inbox proof to close this phase
- TypeScript strict; `npm run lint` and `npm test` PASS
- Functionally testable on local `npm run dev`
- Minimal PII in logs (no full email dumps in application logs)

## Technical Boundaries / Out of Scope

- Online card payments / payment gateway
- Loyalty, coupons, CRM, WhatsApp, SMS
- Automated marketing sequences (welcome series, win-back) Γאפ remain product Phase 11
- External marketing ESP (Mailchimp etc.) as required dependency
- Freeform WYSIWYG / untrusted HTML from admin
- Segment builder beyond Γא£all consented past-order emailsΓא¥
- A/B testing, open/click analytics dashboards
- Changing product Phase 08 numbering or Trust & Legal scope
- Completing full privacy audit close-out (note gap closure for ╫ף╫ש╫ץ╫ץ╫¿ consent only)

## Dependencies and Interfaces

### Builds on
- Phase 2/7 checkout + messages + legal consent pattern
- Phase 3 Resend client (`sendTransactionalEmail` / destination resolve / templates style)
- Phase 1 admin auth + protected layout nav

### New / extended surfaces (indicative Γאפ Manager refines)
- Prisma models: `MarketingConsent`, `EmailCampaign`, optional `CampaignSend`
- Checkout: optional marketing opt-in checkbox + server persistence
- Admin: `/admin/campaigns` (list history), compose/send form; nav + dashboard link
- Campaign sender: resolve audience Γזע create campaign Γזע batch Resend Γזע update status
- Public: `/[locale]/unsubscribe?token=Γאª` (or path+token) revoke consent + confirmation page
- Messages HE/EN: marketing checkbox label, campaign email chrome, unsubscribe copy
- Unit tests: audience excludes revoked/never-opted; unsubscribe invalidates; template includes unsub link; send skipped when Resend unset (same pattern as transactional)

### External services
- Existing Resend Γאפ no new vendor required for this phase

## Data / State Considerations

### MarketingConsent (logical)
- Key: normalized email
- Fields (indicative): `email`, `status` (opted_in | opted_out), `source` (checkout | Γאª), `opted_in_at`, `opted_out_at`, `consent_version` optional
- One row per email; latest status wins

### EmailCampaign (logical)
- `subject`, `body`, `created_by` (admin user id if available), `status` (draft | sending | sent | failed | partial), `recipient_count`, `sent_at`, timestamps

### CampaignSend (logical, optional but preferred)
- Links campaign Γזע email; status per recipient; error note; supports partial failure reporting

### Audience query
- Distinct emails from `Order.customer_email` that have `MarketingConsent.status = opted_in`
- Exclude opted_out and never-consented

### Unsubscribe token
- Opaque or HMAC over email (+ expiry optional); must not be guessable; invalid token Γזע safe error page

## Security / Privacy Considerations

- Marketing is secondary use of contact data Γאפ separate explicit opt-in required (Amendment 13 / ╫ף╫ש╫ץ╫ץ╫¿)
- Unsubscribe must be reachable from every campaign email
- Admin-only compose/send; `requireAdmin()` on all campaign mutations
- Rate-limit or confirm-before-send with recipient count to prevent accidental blast
- Do not log full recipient lists at info level
- Campaign body is admin-authored Γאפ escape when embedding in HTML email wrapper
- Dev redirect (`RESEND_DEV_TO`) mandatory behavior for campaigns same as transactional

## Testing and Lint Expectations

- `npm run lint` PASS
- `npm test` PASS with new unit coverage for: consent gate on audience, unsubscribe revoke, template contains unsubscribe URL, campaign module does not call order helpers
- No requirement for live Resend production inbox to close the phase; local/dev redirect acceptable evidence

## Functional Testability

- Page/screen the user can open: `/admin/campaigns` (compose + history); checkout with marketing checkbox; `/[locale]/unsubscribeΓאª`
- User-visible behavior: admin sees recipient count for consented audience; after send, history row appears
- Minimal end-to-end flow: opt-in at checkout Γזע admin send campaign Γזע mail hits `RESEND_DEV_TO` (or configured inbox) with unsubscribe Γזע unsubscribe Γזע email excluded from next count
- Expected observable result: only consented emails are targeted; unsubscribe sticks

## Handoff Notes for Manager

- Prefer thin milestones: schema+consent Γזע unsubscribe Γזע admin compose/history Γזע send batches Γזע tests/docs
- Reuse Resend env vars; do not add a second email provider
- Keep admin Hebrew labels consistent with existing nav
- Document Resend rate/batch strategy for free tier
- Product docs already targeted for sync under Phase 12; Manager should not reopen Growth payments scope
- Git: branch `phase-8/marketing-email-campaigns` from latest `develop` (after Phase 7 merge if not yet merged Γאפ stop and escalate if base unclear)

## Architect Review
ARCHITECT_REVIEW_STATUS: APPROVED

### Review Notes

Architect Review of Phase 8 Marketing Email Campaigns (2026-07-28).

Upstream: `manager-phase8.md` MANAGER_REVIEW_STATUS: APPROVED; `dev-phase8.md` STATUS: COMPLETE / READY_FOR_MANAGER_REVIEW.

#### Architecture alignment — PASS

| Decision / constraint | Verdict | Evidence |
|---|---|---|
| Campaigns only (not Growth payments/loyalty) | Pass | Dev scope compliance; Manager approval |
| Separate campaign module vs `sendOrder*` | Pass | `src/lib/campaigns/`; uses `sendTransactionalEmail` only |
| Consented audience only | Pass | MarketingConsent + Order email intersection |
| Terms ≠ marketing opt-in | Pass | Optional checkout `marketingOptIn` |
| Unsubscribe token path | Pass | HMAC + `/[locale]/unsubscribe` |
| Plain text body (no WYSIWYG/PDF) | Pass | Admin textarea + escaped HTML wrapper |
| Branch from develop + pushed | Pass | `phase-8/marketing-email-campaigns` on origin |
| Product Phase 12 mapping | Pass | Docs updated; Phase 08 admin-orders untouched |
| Lint + unit tests | Pass | `npm run lint` / `npm test` — 79 tests, 6 Phase 8 |
| Live Resend production inbox | N/A | Explicitly out of phase gate |

#### Manager gate — PASS

Acceptance criteria all checked; residuals (inbox E2E) accepted correctly.

#### Developer evidence — PASS

Milestones M0–M5 complete; files, lint, tests, git SHAs (`218f47f`…`4e17016`), batch strategy, and declaration present.

#### Functional testability — PASS (accepted residual)

Checkout opt-in, admin campaigns UI, unsubscribe covered by unit/code-path evidence. Full interactive Resend inbox path optional — same residual pattern as prior email phases.

#### Accepted residuals for Phase 8 close

| Item | Disposition |
|---|---|
| Live Resend production / inbox E2E | Out of gate; smoke with `RESEND_DEV_TO` recommended before merge |
| PDF / rich media campaigns | Explicitly out of scope — future Architect amendment if requested |
| Unchecked marketing checkbox does not revoke prior consent | Per Manager shape; acceptable |

**Architect APPROVED.** Phase 8 complete architecturally. Do **not** update `PHASE.md` without explicit user instruction.

Next choices for user: merge `phase-8/marketing-email-campaigns` → `develop` (PR preferred); optional smoke of admin send + unsubscribe; or request Architect design for media/PDF campaign extension as a later phase.

### Required Corrections

None.
