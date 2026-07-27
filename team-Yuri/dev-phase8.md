# Developer Phase 8

## Phase Identifier
PHASE=8

## Status
STATUS: COMPLETE

## Source References

- `team-Yuri/arch-phase8.md` (STATUS: READY_FOR_MANAGER)
- `team-Yuri/manager-phase8.md` (STATUS: READY_FOR_DEVELOPER)
- `DOCS/phases/12-marketing-email-campaigns.md`
- `.cursor/rules/20-testing.md`, `30-docs.md`, `50-git-workflow.md`

## Implementation Summary

Implemented manual marketing email campaigns (M0–M5):

- Prisma models + migration: `MarketingConsent`, `EmailCampaign`, `CampaignSend`
- Optional checkout marketing opt-in (separate from terms); upsert consent on submit
- HMAC unsubscribe tokens + public `/[locale]/unsubscribe`
- Admin `/admin/campaigns` compose + history + nav/dashboard
- Campaign module `src/lib/campaigns/` uses `sendTransactionalEmail` only (no `sendOrder*`)
- Batch size 10 with short delay; respects `RESEND_DEV_TO`
- Unit tests in `tests/lib/phase8-campaigns.test.ts`

## Implemented Milestones

| Milestone | Completed: Yes/No | Notes |
|---|---:|---|
| M0 Git branch | Yes | `phase-8/marketing-email-campaigns` from `develop` |
| M1 Schema + consent | Yes | Migration applied; checkout checkbox |
| M2 Unsubscribe | Yes | Token + public page |
| M3 Admin UI | Yes | `/admin/campaigns` + nav |
| M4 Resend batch send | Yes | `sendMarketingCampaign` |
| M5 Gates + evidence | Yes | lint + test PASS; this file |

## Files Changed

| File | Change Summary | Reason |
|---|---|---|
| `prisma/schema.prisma` | Campaign/consent models | M1 |
| `prisma/migrations/20260727200000_phase8_marketing_campaigns/` | SQL migration | M1 |
| `src/lib/campaigns/*` | email, consent, templates, send | M1–M4 |
| `src/lib/actions/campaigns.ts` | Admin send + unsubscribe actions | M2–M4 |
| `src/lib/actions/orders.ts` | marketingOptIn upsert | M1 |
| `src/components/storefront/CheckoutForm.tsx` | Optional marketing checkbox | M1 |
| `src/app/[locale]/unsubscribe/page.tsx` | Public revoke | M2 |
| `src/app/admin/(protected)/campaigns/page.tsx` | Admin UI | M3 |
| `src/components/admin/CampaignComposeForm.tsx` | Compose form | M3 |
| `src/app/admin/(protected)/layout.tsx` | Nav item | M3 |
| `src/app/admin/(protected)/page.tsx` | Dashboard card | M3 |
| `src/messages/{he,en}.ts`, `src/lib/i18n.ts` | Copy keys | M1–M2 |
| `tests/lib/phase8-campaigns.test.ts` | Unit coverage | M5 |
| `.env.example` | `CAMPAIGN_UNSUBSCRIBE_SECRET` | M2 |
| `DOCS/phases/12-marketing-email-campaigns.md` + synced product docs | Product Phase 12 | Docs |
| `team-Yuri/{PHASE,plan,arch-phase8,manager-phase8}.md` | Phase governance | Planning carry-in |

## Dependencies Installed

| Dependency / Tool | Command Used | Reason |
|---|---|---|
| None | — | No new packages |

## Unit Tests

| Field | Value |
|---|---|
| Command | `npm test` |
| Result | PASS |
| Notes | 12 files / 79 tests (6 Phase 8: normalize, tokens, escape, unsub link, module separation) |

## Lint

| Field | Value |
|---|---|
| Command | `npm run lint` |
| Result | PASS |
| Notes | No ESLint warnings or errors |

## Functional Testability Evidence

| Field | Value |
|---|---|
| Method | Unit tests + code-path review; browser smoke partial (dev server restarted after prisma generate) |
| Steps | 1) Checkout has optional marketing checkbox. 2) Admin `/admin/campaigns` lists compose + history. 3) Unsubscribe token round-trip covered by unit tests. 4) Template always includes `/unsubscribe?token=`. |
| Expected Result | Consented-only audience; unsub works; campaign module separate from order mail |
| Actual Result | PASS (unit + lint); full Resend inbox E2E depends on local Resend env / `RESEND_DEV_TO` |
| Notes | Batch strategy: sequential send, yield every 10 recipients (200ms). Secret: `CAMPAIGN_UNSUBSCRIBE_SECRET` or fallback `SUPABASE_SERVICE_ROLE_KEY`. |

## Documentation Update Evidence

| Field | Value |
|---|---|
| Documentation Updated | YES |
| Files Updated | `DOCS/phases/12-marketing-email-campaigns.md`, phases README + product docs synced in planning; `.env.example` |
| Reason if Not Required | — |

## Git

| Field | Value |
|---|---|
| Branch | `phase-8/marketing-email-campaigns` |
| Base | `develop` (`b49f8ba`) |
| Push | PUSHED |
| Remote | `origin` (`https://github.com/malka3949/maison-malka`) |

### Commits

| SHA (short) | Message | Milestone |
|---|---|---|
| `218f47f` | `phase8: add marketing campaigns architecture and product docs` | M0 + docs |
| `951248a` | `phase8: implement marketing consent, campaigns admin, and Resend send` | M1–M5 |
| `f52cafb` | `phase8: record git evidence in developer report` | M5 evidence |

## Known Issues / Limitations

- Live Resend production inbox not required to close phase; use `RESEND_DEV_TO` locally.
- Campaign email chrome is Hebrew-first; body is admin-typed as-is.
- Leaving marketing checkbox unchecked does not revoke prior consent (per Manager plan).

## Scope Compliance

No online payments, loyalty, coupons, WhatsApp, CRM, drip automation, or external ESP dependency. Product Phase 08 admin-orders doc untouched.

## Developer Declaration

READY_FOR_MANAGER_REVIEW
