# Manager Phase 9

## Phase Identifier
PHASE=9

## Status
STATUS: READY_FOR_DEVELOPER

## Phase Goal

Add optional campaign promo image (inline) and optional PDF attachment to Phase 8 admin campaigns. Keep subject+body required, consent/unsubscribe unchanged.

## Source References

- `team-Yuri/arch-phase9.md` (STATUS: READY_FOR_MANAGER)
- `team-Yuri/arch-phase8.md`, `dev-phase8.md`
- `.cursor/rules/20-testing.md`, `50-git-workflow.md`

## Architecture Summary

- Branch: `phase-9/campaign-media` from `develop`
- Schema: nullable `image_storage_path`, `pdf_storage_path`, `pdf_filename` on `EmailCampaign`
- Upload on send via FormData into `site-media` under `campaigns/{cuid}/`
- Image → absolute URL in HTML; PDF → Resend attachment
- Limits: image = existing max; PDF ≤ 5MB, `application/pdf` + `%PDF` magic

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M0 | Git branch | `phase-9/campaign-media` | Named in `dev-phase9.md` |
| M1 | Schema | Media fields + migration | Prisma models updated |
| M2 | Resend attachments | `sendTransactionalEmail` supports attachments | Unit/helper covers payload |
| M3 | Upload + admin form | Optional image/PDF inputs + server upload | Files stored; errors surfaced |
| M4 | Template + send wiring | Image in HTML; PDF attached; unsub remains | Tests + code path |
| M5 | Gates | Lint, tests, `dev-phase9.md` | PASS + READY_FOR_MANAGER_REVIEW |

## Acceptance / Gating Criteria

- [ ] Branch recorded
- [ ] Optional image and PDF work independently and together
- [ ] Subject+body still required
- [ ] Unsubscribe still in every email
- [ ] No `sendOrder*` coupling
- [ ] Size/mime validation
- [ ] `npm run lint` + `npm test` PASS
- [ ] Evidence in `dev-phase9.md`

## Functional Testability Criteria

- Admin form shows file inputs; send with image → HTML img; send with PDF → attachment; unsub link present

## Required Developer Evidence

Branch, milestones, lint, tests, functional notes, READY_FOR_MANAGER_REVIEW

## Out of Scope

WYSIWYG, multi-file galleries, ESP, payments, loyalty, WhatsApp, consent model changes

## Manager Review
MANAGER_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(Awaiting Developer.)

### Required Corrections

None yet.
