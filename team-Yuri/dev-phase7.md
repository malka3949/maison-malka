# Developer Phase 7

## Phase Identifier
PHASE=7

## Status
STATUS: COMPLETE

## Source References

- `team-Yuri/arch-phase7.md`
- `team-Yuri/manager-phase7.md` (STATUS: READY_FOR_DEVELOPER)
- `DOCS/phases/09-i18n-and-mvp-launch.md` (Trust & Legal folded into product launch phase)
- `.cursor/rules/20-testing.md`, `30-docs.md`, `50-git-workflow.md`

## Implementation Summary

Implemented Trust & Legal wave 1 (P0.1–P0.5 / M0–M8):

- HE/EN legal pages: privacy, terms, cancellation (`src/content/legal` + `/[locale]/…` routes)
- Footer + checkout links to all three; always-visible contact via `resolveBusinessContact`
- Checkout consent + Jerusalem delivery disclosure/affirmation (UI + `createGuestOrder` via `checkoutTrustGateError`)
- SiteSettings allowlist + admin field `bank_transfer_details`
- Approved-order email includes bank instructions (or phone fallback); confirmation page note for bank_transfer
- Product docs synced (no Phase 12); ERD/README updated
- Unit tests in `tests/lib/phase7-trust-legal.test.ts`

No ע.מ./ח.פ. UI. Phase 4 Production remains PARKED. Legal copy marked as draft.

## Implemented Milestones

| Milestone | Completed: Yes/No | Notes |
|---|---:|---|
| M0 Git branch | Yes | `phase-7/pre-launch-trust-legal` |
| M1 Legal content + routes | Yes | `/he|/en` privacy, terms, cancellation |
| M2 Footer + checkout links | Yes | Three links each |
| M3 Contact fallbacks | Yes | `resolveBusinessContact`; footer always shows phone/address/hours |
| M4 Consent gate | Yes | Checkbox + server `accepted_terms` |
| M5 Delivery disclosure | Yes | Jerusalem + arranged cost + affirmation + server `delivery_area` |
| M6 Bank settings | Yes | `bank_transfer_details` allowlist + admin textarea |
| M7 Bank on approve | Yes | Email + confirmation next-steps note |
| M8 Gates + evidence | Yes | lint + test PASS; this file |

## Files Changed

| File | Change Summary | Reason |
|---|---|---|
| `src/content/legal/*` | Draft HE/EN legal documents | M1 |
| `src/app/[locale]/{privacy,terms,cancellation}/page.tsx` | Public legal routes | M1 |
| `src/components/storefront/LegalDocumentView.tsx` | Shared legal renderer | M1 |
| `src/components/storefront/StorefrontFooter.tsx` | Contact resolve + legal links | M2–M3 |
| `src/components/storefront/CheckoutForm.tsx` | Consent, delivery gates, legal links | M2, M4–M5 |
| `src/lib/checkout-gates.ts` | Pure trust gate helper | M4–M5 |
| `src/lib/actions/orders.ts` | Server trust gates | M4–M5 |
| `src/lib/site-content.ts` | `bank_transfer_details` + `resolveBusinessContact` | M3, M6 |
| `src/components/admin/SiteSettingsAdmin.tsx` | Bank details field | M6 |
| `src/lib/notifications/{types,templates,resend}.ts` | Bank block on approve email | M7 |
| `src/app/[locale]/order/[id]/page.tsx` | Bank next-steps note | M7 |
| `src/lib/i18n.ts`, `src/messages/{he,en}.ts` | New copy keys | M2–M5, M7 |
| `tests/lib/phase7-trust-legal.test.ts` | Unit coverage | M8 |
| `DOCS/phases/*`, `DOCS/Maison-Malka-*.md`, `README.md` | Product docs sync | Docs + M8 |

## Dependencies Installed

| Dependency / Tool | Command Used | Reason |
|---|---|---|
| None | — | No new packages |

## Unit Tests

| Field | Value |
|---|---|
| Command | `npm test` |
| Result | PASS |
| Notes | 5 files / 38 tests (includes 9 Phase 7) |

## Lint

| Field | Value |
|---|---|
| Command | `npm run lint` |
| Result | PASS |
| Notes | No ESLint warnings or errors |

## Functional Testability Evidence

| Field | Value |
|---|---|
| Method | Page + End-to-end spot check |
| Steps | 1) Open `/he/privacy` — heading + draft notice + footer legal links + always-visible contact. 2) Unit tests cover consent/delivery gates, settings allowlist, approved email bank block. 3) Checkout UI includes required terms checkbox and delivery affirmation when delivery selected. |
| Expected Result | Legal pages render; trust gates enforced in helper/server; bank instructions in approved email when configured |
| Actual Result | PASS |
| Notes | Browser: `/he/privacy` rendered with footer contact (CMS values present). Full checkout→approve email path depends on local cart/admin/Resend; covered by unit tests for gates + email HTML. Phase 4 Production not exercised. |

## Documentation Update Evidence

| Field | Value |
|---|---|
| Documentation Updated | YES |
| Files Updated | `DOCS/phases/09-i18n-and-mvp-launch.md`, `DOCS/phases/README.md`, `DOCS/Maison-Malka-Development-Phases-Plan.md`, `DOCS/Maison-Malka-ERD.md`, `README.md` |
| Reason if Not Required | — |

## Git

| Field | Value |
|---|---|
| Branch | `phase-7/pre-launch-trust-legal` |
| Base | `develop` |
| Push | PUSHED (after this commit) |
| Remote | `origin` |

### Commits

| SHA (short) | Message | Milestone |
|---|---|---|
| f4044eb | `phase7: add Trust and Legal architecture and manager plan` | Arch/Manager (prior) |
| (this) | `phase7: implement Trust and Legal pre-launch pack` | M1–M8 |

## Known Issues / Limitations

- Legal copy is **draft** — owner must replace before public launch.
- Phase 4 Production (hosting/security/backup audit) remains **PARKED**.
- Empty `bank_transfer_details` → approved email falls back to contact phone.
- P1 items (rich confirmation redesign, IL phone regex, accessibility page, etc.) out of scope.

## Scope Compliance

Matches `arch-phase7.md` / `manager-phase7.md` wave 1 only. No Growth features. No ע.מ./ח.פ. No removal of `bank_transfer`.

## Developer Declaration

READY_FOR_MANAGER_REVIEW
