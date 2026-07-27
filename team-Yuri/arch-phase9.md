# Architecture Phase 9

## Phase Identifier
PHASE=9

## Status
STATUS: READY_FOR_MANAGER

## Phase Goal

Extend Phase 8 manual marketing campaigns with **optional promo image** (inline in email HTML) and/or **optional PDF attachment**, without changing consent/unsubscribe, without WYSIWYG, and without Growth features.

## Source References

- `team-Yuri/plan.md` — Phase 9 Campaign Media Attachments
- User decisions (2026-07-28): after Phase 8 close — image + PDF options; plain text remains
- `team-Yuri/arch-phase8.md` — campaigns baseline
- `src/lib/campaigns/*`, `src/lib/notifications/resend.ts`
- `src/app/api/admin/upload-site-media/route.ts`, `src/lib/site-media-url.ts`
- `.cursor/rules/20-testing.md`, `40-project-structure.md`, `50-git-workflow.md`

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| Additive to Phase 8 | User accepted text-first; media is upgrade | Branch `phase-9/campaign-media` from `develop` |
| Image inline in HTML | Better mobile preview than PDF-only | Absolute URL via `getAppBaseUrl` + site-media public/proxy path |
| PDF as Resend attachment | Designed flyer without HTML builder | Extend `sendTransactionalEmail` with optional `attachments` |
| Subject + body still required | Accessibility + clear message when images blocked | Media optional only |
| Store under `site-media` / `campaigns/` | Reuse existing bucket + proxy | No new top-level folder; path prefix `campaigns/` |
| Size limits | Protect Resend + storage | Images: existing image max; PDF ≤ 5MB; PDF mime `application/pdf` only |
| No WYSIWYG | Scope control | File inputs only |

## Constraints / Non-Negotiables

- Do not weaken marketing consent / unsubscribe
- Do not call `sendOrder*` from campaigns
- Do not invent top-level app folders
- Do not add payments/loyalty/WhatsApp
- Lint + unit tests PASS
- Functionally testable locally

## Technical Boundaries / Out of Scope

- Rich HTML editor / drag-drop designer
- Multiple attachments beyond one image + one PDF
- Open/click analytics
- External ESP
- Changing Phase 8 audience rules

## Dependencies and Interfaces

- Extend `EmailCampaign` with `image_storage_path`, `pdf_storage_path`, `pdf_filename` (nullable)
- Admin compose form: optional `image` + `pdf` file inputs
- Upload on send (server action) or dedicated admin upload — Manager may choose FormData on send
- `buildCampaignEmail` accepts optional absolute `imageUrl`
- `sendTransactionalEmail` accepts optional attachments `{ filename, contentBase64 }`
- Unit tests: image block present/absent; attachment array shaped when PDF provided

## Data / State Considerations

- Nullable media fields on existing `EmailCampaign`
- Failed upload → do not send campaign
- History may show whether media was attached (paths non-null)

## Security / Privacy Considerations

- Admin-only upload/send
- Sniff/validate mime (images via existing sniff; PDF by mime + `%PDF` magic)
- Escape body; do not allow admin HTML
- Do not log file bytes

## Testing and Lint Expectations

- `npm run lint` PASS; `npm test` PASS with Phase 9 coverage

## Functional Testability

- Admin attaches image and/or PDF and sends
- Email HTML includes `<img>` when image set
- Send path includes PDF attachment when set
- Unsubscribe link still present

## Handoff Notes for Manager

- Prefer milestones: schema → Resend attachments API → upload+form → template/send wiring → tests
- Document size limits in admin UI copy

## Architect Review
ARCHITECT_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(Not reviewed.)

### Required Corrections

None yet.
