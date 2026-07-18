# Architecture Phase 7

## Phase Identifier
PHASE=7

## Status
STATUS: READY_FOR_MANAGER

## Phase Goal

Deliver a **Pre-launch Trust & Legal** pack so the storefront is commercially safer for real customers: public HE/EN legal pages, always-visible business contact disclosures, mandatory checkout consent, Jerusalem delivery disclosure, and bank-transfer payment instructions after order approval — without online card payments, without Phase 4 Production cutover, and without Business Growth features.

## Source References

- `team-Yuri/plan.md` — Phase 7 Pre-launch Trust & Legal; Phase 4 PARKED; Growth → Phase 8
- User decisions (2026-07-18): keep bank transfer + instructions; no ע.מ./ח.פ. display; new Team Yuri phase
- Prior audit / fix list: P0.1–P0.5 (wave 1 only)
- `team-Yuri/arch-phase2.md` — checkout, messages, fulfillment
- `team-Yuri/arch-phase3.md` — Resend / approval emails
- `team-Yuri/arch-phase6.md` — SiteSettings CMS + footer settings
- `src/components/storefront/CheckoutForm.tsx`, `StorefrontFooter.tsx`
- `src/lib/actions/orders.ts`, `src/lib/notifications/templates.ts`
- `src/messages/he.ts`, `src/messages/en.ts`
- `DOCS/Maison-Malka-PRD.md` — Jerusalem MVP service area
- `.cursor/rules/40-project-structure.md`, `20-testing.md`, `50-git-workflow.md`

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| New phase (not Phase 6 extension) | Phase 6 CMS already APPROVED | Branch `phase-7/pre-launch-trust-legal` from `develop` |
| Wave 1 scope = P0.1–P0.5 only | User-ordered first loop | P0.6 Phase 4 and P1+ deferred |
| Legal pages as static localized content | Need public URLs + footer/checkout links; not a page builder | Routes under `src/app/[locale]/…`; copy in messages or `src/content/legal` modules — plain React text |
| No ע.מ./ח.פ. field | User confirmed none for now | Do not add legal-id settings key |
| Contact always visible | CMS may be empty | Hard fallbacks in `src/messages/{he,en}.ts` when SiteSettings blank |
| Checkout consent checkbox | Legal/trust gate | Client + **server** validation before `createGuestOrder` |
| Delivery = disclosure, not geo-engine | PRD Jerusalem-only; no zone product | Required affirmation + clear copy; cost = “בתיאום” / arranged (no fee calculator) |
| Keep `bank_transfer` payment method | User chose keep + instructions | Do not remove UI option |
| Bank details via SiteSettings + message templates | Fits Phase 6 settings model; avoid secrets in git | New allowlisted settings key(s) for account details; HE/EN wrapper copy in messages/emails |
| Inject bank instructions on **approved** customer email + confirmation/next-steps when payment is bank_transfer | Customer needs to know how to pay after approval | `sendOrderApproved` / order confirmation page read settings + locale |
| Phase 4 remains PARKED | Explicit prior plan | No Vercel Production / live Resend proof required to close Phase 7 |
| Growth remains later phase | plan amendment | Payments gateway / loyalty / WhatsApp out |

## Constraints / Non-Negotiables

- Do not break guest checkout → `pending_approval`
- Do not add online card payment / payment gateway
- Do not require Production deploy to close this phase
- Do not invent top-level folders
- Do not render untrusted HTML from CMS or legal copy (React text / safe markdown-to-nodes if used — prefer plain paragraphs)
- Do not add ע.מ./ח.פ. UI
- TypeScript strict; `npm run lint` and `npm test` PASS
- Functionally testable on local `npm run dev`
- HE RTL + EN LTR preserved

## Technical Boundaries / Out of Scope

- Phase 4: Vercel Production URL, live Resend proof, security/privacy audit completion (P0.6)
- P1 pack: rich order confirmation line items, cart option labels, IL phone validation, completed status workflow, accessibility page, rejection-email contact polish (unless trivial reuse of contact fallbacks while touching templates — Manager may include **only** contact fallbacks already required by P0.2 inside rejection/approval templates; not full P1.1–P1.6)
- P2: option i18n schema, checkout rate-limit, marketing copy rewrite, allergens, typography churn
- Freeform CMS for legal pages
- Automated address geocoding / delivery fee engine
- Business Growth (online payments, loyalty, WhatsApp)

## Dependencies and Interfaces

### Builds on
- Phase 2 checkout + messages
- Phase 3 Resend templates + approve flow
- Phase 6 SiteSettings + footer wiring

### New / extended surfaces (indicative — Manager refines)
- Routes: `/[locale]/privacy`, `/[locale]/terms`, `/[locale]/cancellation` (names may be adjusted; three distinct legal surfaces required)
- Footer + checkout links to those routes
- Checkout: required consent checkbox; delivery Jerusalem affirmation when fulfillment=delivery; copy for delivery cost “arranged”
- Messages: legal link labels, consent label, delivery disclosure, bank instruction chrome, contact fallbacks
- SiteSettings allowlist: at least one key for bank account details (e.g. `bank_transfer_details`) — plain text
- Admin `/admin/settings`: edit bank details
- `sendOrderApproved` (+ optional order success page note): show bank instructions when `payment_method === bank_transfer`
- Unit tests: consent rejection; settings allowlist if extended; template includes bank block when details present

### External services
- Existing Resend / Supabase — no new vendors

## Data / State Considerations

- Order model unchanged except existing fields (`payment_method`, `locale`, etc.)
- SiteSettings: new allowlisted key(s) for bank details; empty → approved email uses “contact shop” fallback without inventing IBAN
- Consent: not persisted as separate table in MVP — validated at submit time only (Manager may note future audit log as out of scope)
- Legal copy versioning: code/content modules; CMS edit of legal pages out of scope

## Security / Privacy Considerations

- Consent must be enforced server-side
- Bank details are sensitive business data — admin-only write; public display only on confirmation/email for the ordering customer after approval (not on public homepage)
- No new PII fields beyond existing order snapshot
- Plain text only for settings and legal content

## Testing and Lint Expectations

- `npm run lint` PASS
- `npm test` PASS with new/updated unit tests for consent gate and/or bank settings allowlist / template branch
- Document commands + results in `dev-phase7.md`
- Manual: legal pages HE/EN; footer links; checkout blocked without consent; delivery notice; approve bank-transfer order → email/page shows instructions when details configured

## Functional Testability

- **Page/screen:** `/he/privacy`, `/he/terms`, `/he/cancellation` (+ `/en/...`); `/he` footer; `/he/checkout`; `/admin/settings`
- **User-visible behavior:** Links work; checkout requires consent; delivery shows Jerusalem + arranged cost copy; footer always shows phone/address/hours; after admin approves a bank_transfer order, customer-facing approved email includes bank instructions (or explicit contact fallback if unset)
- **Command-line:** `npm run dev`, `npm run lint`, `npm test`
- **API / actions:** `createGuestOrder` rejects missing consent; settings upsert for bank key
- **Minimal E2E:** Open privacy → checkout with consent + delivery affirmation → place order → admin sets bank details if needed → approve → inspect approved email/HTML or logged template content
- **Expected result:** Storefront meets wave-1 trust/legal bar for local demo toward real customers (still not Phase 4 production)

This phase is **not** infrastructure-only.

## Handoff Notes for Manager

1. Branch: `phase-7/pre-launch-trust-legal` from current `develop` (Phase 6 already merged).
2. Sequence: legal routes + messages → footer/checkout links → contact fallbacks → consent (client+server) → delivery disclosure → bank settings + approved-email/confirmation wiring → lint/test/evidence.
3. Draft legal copy may be clearly marked as business-approved draft; do not claim attorney certification in UI.
4. User decisions locked: keep bank_transfer; no legal entity id; Phase 4 out.
5. Acceptance = local functional proof of P0.1–P0.5; Production not required.
6. Ask user approval of this architecture before Developer implementation if any scope conflict appears.

## Architect Review
ARCHITECT_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(Phase design complete. Awaiting Manager detailed design + Developer implementation + evidence before Architect REVIEW-PHASE.)

### Required Corrections

None at design time.
