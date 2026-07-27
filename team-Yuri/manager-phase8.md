# Manager Phase 8

## Phase Identifier
PHASE=8

## Status
STATUS: READY_FOR_DEVELOPER

## Phase Goal

Implement manual marketing email campaigns for the administrator: optional marketing consent at checkout (separate from terms), audience limited to distinct past-order emails with active consent, admin compose-and-send via Resend (campaign module separate from `sendOrder*`), campaign history, and a working unsubscribe path. No online payments, loyalty, coupons, WhatsApp, CRM, or automated drips.

## Source References

- `team-Yuri/arch-phase8.md` (STATUS: READY_FOR_MANAGER)
- `team-Yuri/plan.md` Γאפ Phase 8 Marketing Email Campaigns (locked 1╫ס+2╫נ)
- `DOCS/phases/12-marketing-email-campaigns.md` Γאפ product Phase 12 mapping
- `DOCS/Maison-Malka-ERD.md` ┬º4c Γאפ MarketingConsent, EmailCampaign, CampaignSend
- `src/lib/notifications/{resend,templates,types}.ts` Γאפ reuse destination resolve / send primitive; do not extend `sendOrder*`
- `src/components/storefront/CheckoutForm.tsx`, `src/lib/actions/orders.ts`
- `src/app/admin/(protected)/layout.tsx` Γאפ navItems
- `.cursor/rules/20-testing.md`, `30-docs.md`, `40-project-structure.md`, `50-git-workflow.md`

## Architecture Summary

- **Type:** Schema + checkout consent + public unsubscribe + admin campaigns + Resend batch send
- **Git:** Branch `phase-8/marketing-email-campaigns` from latest `develop` (if Phase 7 not merged, stop and escalate Γאפ do not invent base)
- **Product map:** Team Yuri 8 Γזפ product doc Phase 12; do not rewrite `DOCS/phases/08-admin-orders.md`
- **Consent:** Optional checkout checkbox; persist `MarketingConsent` by normalized email; terms consent Γיá marketing
- **Audience:** Distinct `Order.customer_email` Γט⌐ `MarketingConsent.status = opted_in`
- **Delivery:** New `src/lib/campaigns/` module; may call shared low-level Resend send + `resolveEmailDestination`; never call `sendOrder*`
- **Unsubscribe:** Signed/token URL on every campaign email Γזע public locale page Γזע revoke consent
- **Content:** Subject + plain textarea body; escape when wrapping in HTML email chrome
- **History:** `EmailCampaign` + preferred `CampaignSend` per recipient
- **Acceptance:** Local `npm run dev` + unit tests; live Production Resend inbox **not** required

### Manager shape choices (within Architect intent)

| Topic | Choice |
|---|---|
| Branch | `phase-8/marketing-email-campaigns` from `develop` |
| Prisma models | All three: `MarketingConsent`, `EmailCampaign`, `CampaignSend` |
| Email normalize | Trim + lowercase before store/lookup |
| Checkout field | Optional `marketingOptIn` (checkbox); not required for order success |
| Consent upsert | On checkout when opt-in checked: upsert opted_in + `source=checkout` + `opted_in_at` |
| Unchecked checkout | Do not force opted_out (leave prior consent unchanged) |
| Unsubscribe token | HMAC-SHA256 over normalized email using server secret (reuse existing app secret / dedicated env if already patterned; document in `dev-phase8.md`); no login |
| Unsubscribe route | `/[locale]/unsubscribe?token=Γאª` |
| Admin routes | `/admin/campaigns` list+compose (single page OK) or list + compose section |
| Nav label | Hebrew: `╫º╫₧╫ñ╫ש╫ש╫á╫ש╫¥` |
| Confirm before send | Show recipient count; require explicit submit (no auto-send) |
| Batch size | Send sequentially or small batches (e.g. Γיñ10) with short delay if needed; document strategy for Resend free tier in `dev-phase8.md` |
| Empty audience | Block send with clear admin error |
| Resend unset | Skip/fail gracefully same pattern as transactional; record campaign status accordingly |
| Template | Brand HTML wrapper + escaped body paragraphs + unsubscribe link mandatory |
| Locale of campaign email | Hebrew-first chrome for MVP admin campaigns; body as admin typed (no auto-translate) |

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M0 | Git branch | `phase-8/marketing-email-campaigns` from `develop` | Name recorded in `dev-phase8.md` |
| M1 | Schema + marketing consent | Prisma models + migration; checkout optional opt-in persists consent | Opt-in creates/updates `MarketingConsent`; order still works without checkbox |
| M2 | Unsubscribe | Token issue/verify + public revoke page | Valid token Γזע opted_out; invalid Γזע safe error; opted-out excluded from audience |
| M3 | Admin campaigns UI | `/admin/campaigns` compose + history + nav | Admin sees recipient count, subject/body fields, past campaigns |
| M4 | Resend batch send | Campaign module sends to audience; history statuses | Campaign email delivered (or `RESEND_DEV_TO`); unsub link present; no `sendOrder*` usage |
| M5 | Gates + evidence | Lint, unit tests, docs touch-ups if needed, `dev-phase8.md` | PASS + `READY_FOR_MANAGER_REVIEW` |

## Detailed Development Plan

### M0 Γאפ Git
- Fetch/ensure `develop` current when remote exists
- Create and checkout `phase-8/marketing-email-campaigns`
- If Phase 7 work is not on `develop` and base is unclear Γזע **STOP and escalate** to user (do not invent merge)
- Record branch name in `dev-phase8.md`

### M1 Γאפ Schema + marketing consent
- Add Prisma models per ERD ┬º4c (`MarketingConsent`, `EmailCampaign`, `CampaignSend`) + migration
- Checkout UI: optional marketing checkbox + HE/EN message keys (distinct from terms)
- `createGuestOrder` (and any parallel checkout path): if marketing opt-in true, upsert consent for normalized `customer_email`
- Do **not** require marketing checkbox to place order
- Do **not** treat `terms_accepted_at` / `legal_consent_version` as marketing opt-in
- Unit tests: normalize helper; upsert opted_in; order without opt-in does not invent consent

### M2 Γאפ Unsubscribe
- Helpers: `createUnsubscribeToken(email)`, `verifyUnsubscribeToken(token)` Γזע email or null
- Public page under `[locale]/unsubscribe`: on valid token, set consent `opted_out` + `opted_out_at`; show confirmation
- Invalid/missing token Γזע safe non-enumerating error message
- Audience helper: only emails with `opted_in` **and** appearing as distinct `Order.customer_email`
- Unit tests: revoke flips status; audience excludes opted_out and never-consented

### M3 Γאפ Admin campaigns UI
- Protected route `/admin/campaigns` with `requireAdmin`
- Nav item in `(protected)/layout.tsx` (+ optional dashboard card)
- Compose: subject, body textarea, live/loaded recipient count, confirm send control
- History list: subject, sent_at, recipient_count, status
- Hebrew-first admin copy consistent with existing admin chrome
- No WYSIWYG / freeform HTML editor

### M4 Γאפ Resend batch send
- Implement `src/lib/campaigns/` (audience resolve, template build, send orchestration)
- May reuse `resolveEmailDestination` and low-level Resend HTTP send from notifications; **must not** call `sendOrderReceived` / `sendOrderApproved` / other order helpers
- Flow: validate non-empty audience Γזע create `EmailCampaign` (sending) Γזע create `CampaignSend` rows Γזע batch/sequential send Γזע update per-row + campaign status (`sent` / `partial` / `failed`)
- Every email includes unsubscribe URL with token for that recipient
- Escape admin body when embedding in HTML
- Respect `RESEND_DEV_TO` for all campaign mail in development
- Minimal logging (no full recipient list dumps)
- Unit tests: template contains unsub URL; audience gate; send skipped/handled when Resend unset; assert campaign module does not import/call `sendOrder*`

### M5 Γאפ Gates + evidence
- `npm run lint` PASS
- `npm test` PASS (new Phase 8 coverage as above)
- Sync product docs only if implementation details diverge from already-updated Phase 12 / ERD (prefer note in `dev-phase8.md` over drive-by doc churn)
- Fill `dev-phase8.md` with milestones, commands, functional evidence table
- Declare `READY_FOR_MANAGER_REVIEW` when complete

## Acceptance / Gating Criteria

- [ ] Branch `phase-8/marketing-email-campaigns` named in `dev-phase8.md`
- [ ] Prisma models + migration for MarketingConsent, EmailCampaign, CampaignSend
- [ ] Checkout optional marketing opt-in persists consent; order works without it
- [ ] Terms/legal consent is not used as marketing opt-in
- [ ] Audience = distinct past-order emails with active marketing consent only
- [ ] Unsubscribe token route revokes consent; invalid token safe
- [ ] `/admin/campaigns` compose + history + nav entry
- [ ] Confirm-before-send shows recipient count; empty audience blocked
- [ ] Campaign send via separate module; no `sendOrder*` coupling
- [ ] Campaign HTML includes unsubscribe link; body escaped
- [ ] `RESEND_DEV_TO` respected for campaigns
- [ ] Campaign history stores subject, time, recipient count, status
- [ ] `npm run lint` PASS; `npm test` PASS
- [ ] Functional evidence in `dev-phase8.md`
- [ ] No payments / loyalty / WhatsApp / drip automation / ESP dependency added

## Functional Testability Criteria

- Page/screen the user can open: checkout (marketing checkbox); `/admin/campaigns`; `/[locale]/unsubscribe?token=Γאª`
- User-visible behavior: admin sees consented recipient count; after send, history row; unsubscribe confirmation
- Command-line flow: `npm run lint`; `npm test`
- API endpoint / request: server actions for checkout opt-in persistence, campaign send, unsubscribe revoke (no public list API)
- Minimal end-to-end flow: opt-in at checkout Γזע admin send Γזע mail (or `RESEND_DEV_TO`) with unsub link Γזע unsubscribe Γזע recipient count drops / email excluded
- Expected observable result: only consented emails targeted; unsubscribe sticks; transactional order emails unchanged

## Required Developer Evidence

Document in `team-Yuri/dev-phase8.md`:

| Evidence | Required |
|---|---|
| Branch name | Yes |
| Milestones M0ΓאףM5 Completed Yes/No | Yes |
| Files changed table | Yes |
| `npm run lint` command + PASS | Yes |
| `npm test` command + PASS + notes on new tests | Yes |
| Functional manual/browser notes (checkout opt-in, admin send, unsubscribe) | Yes |
| Batch/Resend strategy note | Yes |
| Declaration `READY_FOR_MANAGER_REVIEW` | Yes |
| Scope compliance (no Growth extras) | Yes |

## Out of Scope

- Online card payments / payment gateway
- Loyalty, coupons, CRM, WhatsApp, SMS
- Automated marketing sequences (product Phase 11)
- External ESP (Mailchimp etc.) as required dependency
- Freeform WYSIWYG / untrusted HTML editor
- Segment builder beyond all consented past-order emails
- A/B testing, open/click analytics dashboards
- Rewriting product Phase 08 admin-orders doc
- Phase 4 Production / live Resend production inbox proof as phase gate
- Full privacy audit close-out beyond implementing ╫ף╫ש╫ץ╫ץ╫¿ consent + unsubscribe

## Risks / Open Questions

| Risk / Question | Impact | Mitigation |
|---|---|---|
| `develop` missing Phase 7 merge | Wrong base / conflicts | Stop and escalate before coding |
| Resend free-tier rate limits | Partial sends | Batch + `partial` status; document in evidence |
| Secret for HMAC missing locally | Unsubscribe broken in dev | Document required env; fail closed on missing secret |
| Accidental blast | Customer annoyance / compliance | Confirm UI with count; consented-only audience |
| Admin body with markup | XSS in email clients | Escape text; no raw HTML from admin |

## Manager Review
MANAGER_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(Not reviewed Γאפ awaiting Developer evidence in `dev-phase8.md`.)

### Required Corrections

None yet.
