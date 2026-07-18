# Manager Phase 7

## Phase Identifier
PHASE=7

## Status
STATUS: READY_FOR_DEVELOPER

## Phase Goal

Implement Pre-launch Trust & Legal (wave 1 / P0.1–P0.5): HE/EN legal pages with footer+checkout links; always-visible business contact fallbacks; mandatory checkout consent (client+server); Jerusalem delivery disclosure + arranged cost copy; keep bank_transfer with admin bank details and approved-order instructions. Phase 4 Production remains PARKED. No ע.מ./ח.פ. No Growth features.

## Source References

- `team-Yuri/arch-phase7.md` (STATUS: READY_FOR_MANAGER)
- `team-Yuri/plan.md` — Phase 7 Trust & Legal; Phase 4 PARKED; Growth → Phase 8
- User decisions: bank_transfer kept + instructions; no legal entity id; branch from develop after Phase 6 merge
- `src/components/storefront/CheckoutForm.tsx`, `StorefrontFooter.tsx`
- `src/lib/actions/orders.ts`, `src/lib/notifications/templates.ts`, `src/lib/site-content.ts`
- `src/app/admin/(protected)/settings/`
- `.cursor/rules/20-testing.md`, `30-docs.md`, `40-project-structure.md`, `50-git-workflow.md`

## Architecture Summary

- **Type:** Storefront legal/trust UX + SiteSettings extension + email template wiring
- **Git:** Branch `phase-7/pre-launch-trust-legal` from `develop`
- **Legal:** Three public routes per locale; plain-text content modules (messages or `src/content/legal`)
- **Consent:** Checkbox required; `createGuestOrder` rejects if missing
- **Delivery:** Affirmation + copy only (Jerusalem); cost = arranged
- **Bank:** SiteSettings key `bank_transfer_details` (allowlisted); shown on approved path when payment is bank_transfer
- **Contact:** Message fallbacks when CMS settings empty
- **Acceptance:** Local E2E — Production / Phase 4 **not** required

### Manager shape choices (within Architect intent)

| Topic | Choice |
|---|---|
| Legal routes | `/[locale]/privacy`, `/[locale]/terms`, `/[locale]/cancellation` |
| Legal body copy | `src/content/legal/{privacy,terms,cancellation}.{he,en}.ts` exporting string paragraphs/sections — render as React text nodes |
| Contact fallbacks | Extend `messages` with `fallbackPhone`, `fallbackPickupAddress`, `fallbackBusinessHours` (user-approved placeholder values OK if labeled as draft defaults) |
| Consent field | Form + server: `acceptedTerms === true` |
| Delivery affirmation | When fulfillment=delivery, require `deliveryAreaConfirmed === true` + show Jerusalem + arranged-cost copy |
| Bank settings key | `bank_transfer_details` only (plain text multiline) |
| Where bank shows | Approved customer email + order confirmation page note if `payment_method === bank_transfer` |
| Rejection email | May reuse contact fallbacks in footer of templates if touching templates anyway (optional, not full P1) |

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M0 | Git branch | Confirm on `phase-7/pre-launch-trust-legal` | Name in `dev-phase7.md` |
| M1 | Legal content + routes | HE/EN privacy, terms, cancellation pages | URLs render; RTL/LTR OK |
| M2 | Footer + checkout links | Links to three legal pages | Visible on `/he` and checkout |
| M3 | Contact fallbacks | Footer always shows phone/address/hours | Empty CMS still shows fallbacks |
| M4 | Consent gate | Checkbox + server reject | Cannot create order without accept |
| M5 | Delivery disclosure | Jerusalem + arranged cost + affirmation | Delivery path blocked without affirm |
| M6 | Bank details settings | Allowlist + admin settings field | Save/load `bank_transfer_details` |
| M7 | Bank instructions on approve | Email (+ confirmation note) for bank_transfer | Approved email contains details or contact fallback |
| M8 | Gates + evidence | Lint, tests, `dev-phase7.md` | PASS + READY_FOR_MANAGER_REVIEW |

## Detailed Development Plan

### M0 — Git
- Work only on `phase-7/pre-launch-trust-legal`
- Record branch in `dev-phase7.md`

### M1 — Legal pages
- Add content modules with draft business copy (Hebrew + English)
- Add three pages under `src/app/[locale]/…`
- Simple layout consistent with storefront (no admin redesign)

### M2 — Links
- Footer: Privacy, Terms, Cancellation
- Checkout: same three links near consent

### M3 — Contact fallbacks
- Helper: `resolveBusinessContact(settings, messages)` 
- Footer uses resolved values always

### M4 — Consent
- UI checkbox with links
- `createGuestOrder` input includes `acceptedTerms: boolean`; reject if false
- Unit test for reject path if extracted helper; else document manual + action guard

### M5 — Delivery
- Copy in messages for Jerusalem-only + cost arranged
- Require affirmation checkbox when delivery selected
- Server rejects delivery without affirmation

### M6 — Bank settings
- Add `bank_transfer_details` to `SITE_SETTINGS_KEYS`
- Admin settings form field
- ERD/README note if docs rules require

### M7 — Approve path
- `buildOrderApprovedEmail`: if bank_transfer, append instructions from settings or “contact shop” + phone fallback
- Order confirmation page: short next-steps when bank_transfer
- Do not print bank details on public homepage

### M8 — Verify
- `npm run lint`, `npm test`
- Manual table in `dev-phase7.md`
- Note Phase 4 still PARKED

## Acceptance / Gating Criteria

- [ ] Branch `phase-7/pre-launch-trust-legal` named in `dev-phase7.md`
- [ ] `/he` and `/en` legal pages for privacy, terms, cancellation
- [ ] Footer + checkout link to all three
- [ ] Footer always shows phone, address, hours (CMS or fallback)
- [ ] No ע.מ./ח.פ. UI added
- [ ] Checkout requires terms consent (UI + server)
- [ ] Delivery shows Jerusalem + arranged cost; affirmation required
- [ ] `bank_transfer` remains selectable
- [ ] Admin can save `bank_transfer_details`
- [ ] Approved bank_transfer order surfaces pay instructions (email and/or confirmation)
- [ ] `npm run lint` PASS; `npm test` PASS
- [ ] Functional evidence in `dev-phase7.md`
- [ ] Phase 4 Production not claimed complete

## Functional Testability Criteria

- **Page/screen:** legal routes; footer; checkout; admin settings; order confirmation
- **User-visible behavior:** consent/delivery gates; always-visible contact; bank instructions after approve when configured
- **Command-line:** `npm run dev`, `npm run lint`, `npm test`
- **Actions:** `createGuestOrder` consent/delivery guards; settings upsert
- **Minimal E2E:** Legal page → checkout with consent → delivery affirm → order → set bank details → approve → see instructions
- **Expected result:** Wave-1 trust/legal pack works locally

## Required Developer Evidence

`team-Yuri/dev-phase7.md` must include:

1. PHASE=7 and branch name
2. Implementation summary
3. Milestone table M0–M8 Yes/No
4. Files changed
5. Dependencies (none expected)
6. Unit tests command + result
7. Lint command + result
8. Functional evidence (steps/expected/actual)
9. Known issues (Phase 4 PARKED; legal copy is draft)
10. Scope checklist vs `arch-phase7.md`
11. `READY_FOR_MANAGER_REVIEW` or `BLOCKED`

## Out of Scope

- Phase 4 Production / live Resend proof / full Amendment-13 audit close
- P1: full order summary page redesign, cart option display, IL phone regex (unless tiny shared helper appears naturally — do not expand), completed status workflow, accessibility page as required deliverable
- Removing bank_transfer
- Online payments, loyalty, WhatsApp, delivery fee engine
- Legal page CMS / HTML editor
- ע.מ./ח.פ.

## Risks / Open Questions

| Risk | Mitigation |
|---|---|
| Legal copy accuracy | Mark as draft; owner replaces text later |
| Empty bank details | Fallback to contact phone in approved email |
| Consent only on client | Server reject mandatory |
| Scope creep into Phase 4 / P1 | Stick to M0–M8 |

## Manager Review
MANAGER_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(Awaiting Developer implementation + `dev-phase7.md`.)

### Required Corrections

None at planning time.
