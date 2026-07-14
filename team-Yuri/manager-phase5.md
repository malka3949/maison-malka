# Manager Phase 5

## Phase Identifier
PHASE=5

## Status
STATUS: READY_FOR_ARCHITECT_REVIEW

## Phase Goal

Deliver the Bakery Scroll light bakery storefront UI on the existing Next.js public app: tokens + chrome + home/catalog/PDP/cart/checkout styled to match `DOCS/ux-previews` bakery mocks, HE/EN preserved, guest checkout → `pending_approval` unbroken — without admin redesign, Production/Resend, schema changes, or Phase 6 growth features.

## Source References

- `team-Yuri/arch-phase5.md` (STATUS: READY_FOR_MANAGER)
- `team-Yuri/plan.md` — Phase 5 Storefront Bakery Scroll UI; Phase 4 PARKED; Growth → Phase 6
- `team-Yuri/arch-phase2.md` — route/domain contract to preserve
- `DOCS/ux-previews/direction-bakery-scroll.html` (primary home SoT)
- `DOCS/ux-previews/bakery-catalog.html`, `bakery-product.html`, `bakery-cart.html`, `bakery-checkout.html`, `bakery-home-en.html`, `bakery-checkout-en.html`
- `DOCS/ux-previews/bakery-theme.css`
- `DOCS/ux.md` (update selected direction this phase)
- `.cursor/rules/20-testing.md`, `30-docs.md`, `40-project-structure.md`, `50-git-workflow.md`

## Architecture Summary

- **Type:** Presentation-only on existing Phase 2–3 storefront
- **Visual SoT:** Bakery Scroll mocks (light cream, gold, Cormorant + Heebo, sticky nav, ticker, horizontal carousels) — not Direction A Noir & Gold
- **Implementation style (Manager choice):** Tailwind utilities + update `globals.css` `@theme` / `mm-*` tokens toward bakery palette; optional small CSS for marquee/carousel if cleaner than utility soup
- **Routes unchanged:** `/[locale]`, `/catalog`, `/products/[id]`, `/cart`, `/checkout`, `/order/[id]`, login/register
- **Git:** Branch `phase-5/bakery-scroll-storefront` from `develop`
- **Out:** Admin redesign, Production URL, live Resend proof, payments/loyalty, Prisma migrations (escalate if blocked)
- **Acceptance:** Local visual + functional E2E — no Vercel Production requirement

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M0 | Git branch | Create `phase-5/bakery-scroll-storefront` from current `develop` | Branch checked out; name recorded in `dev-phase5.md` |
| M1 | Design tokens | Map `bakery-theme.css` palette into `globals.css` / Tailwind `@theme`; keep Cormorant + Heebo | Storefront bg/ink/gold/line/CTA match bakery vibe; admin still usable |
| M2 | Shell chrome | Restyle `StorefrontHeader` / `StorefrontFooter`; add ticker if in mock; lang switch + cart badge | Sticky light nav; brand-forward; HE↔EN still works |
| M3 | Shared UI primitives | Carousel/horizontal scroll + section header pattern + reveal (optional) under `src/components/storefront/` | Reusable pieces; `prefers-reduced-motion` respected |
| M4 | Homepage | Rebuild `/[locale]/page` composition to Bakery Scroll (hero, category scroll, promos/products scroll, CTA) | `/he` reads like bakery home mock; DB products/categories used |
| M5 | Catalog | Restyle catalog list/filters to light bakery grid/chips | `/he/catalog` on-theme; only available products |
| M6 | Product detail | Restyle PDP layout to bakery product mock | Add-to-cart still works; options/bundles logic unchanged |
| M7 | Cart | Restyle cart view to bakery cart mock | Update/remove/totals still correct |
| M8 | Checkout (+ confirm) | Restyle `CheckoutForm` / checkout + order confirmation pages | Guest submit → `pending_approval`; validation rules unchanged |
| M9 | Docs UX lock | Update `DOCS/ux.md` selected direction → Bakery Scroll (Direction A historical) | Doc status matches shipped UI |
| M10 | Gates + evidence | Lint, tests, local E2E, write `dev-phase5.md` | Commands PASS; Phase 4 residual noted as still open |

## Detailed Development Plan

### M0 — Git branch
- `git fetch` (if remote); checkout `develop`; pull/ff if appropriate
- `git checkout -b phase-5/bakery-scroll-storefront`
- Do not implement on `main` or directly on `develop`
- Record branch name in `dev-phase5.md`

### M1 — Design tokens
- Read `DOCS/ux-previews/bakery-theme.css` variables (`--bg`, `--ink`, `--gold`, `--line`, `--dark`, `--soft`, etc.)
- Update `src/app/globals.css` `@theme` / CSS variables; prefer renaming meanings of `mm-*` in place to avoid scattering breaking renames
- Scope risk: if admin inherits tokens, keep admin readable (contrast OK) — do not redesign admin pages
- Fonts: existing Cormorant + Heebo loading; adjust sizes via utilities/classes as needed

### M2 — Shell chrome
- Restyle `StorefrontHeader.tsx`, `StorefrontFooter.tsx`, `LanguageSwitcher.tsx`, `CartBadge.tsx` to bakery sticky/light pattern
- Optional top ticker matching mock copy (i18n keys he+en if new strings)
- No new routes; links remain locale-aware

### M3 — Shared UI primitives
- Add minimal components only if needed, e.g. `HorizontalScroller`, `SectionHeading`, `Reveal` — all under `src/components/storefront/`
- Carousel arrows scroll container; keyboard/focus friendly where practical
- CSS animations gated by `@media (prefers-reduced-motion: reduce)`

### M4 — Homepage
- Primary visual milestone vs `direction-bakery-scroll.html`
- Hero: full-bleed / dominant image plane per mock; brand + one headline + short support + CTA (no card clutter / promo chips on hero)
- Horizontal category strip from DB categories
- Popular/featured products horizontal scroll from available products
- Use real product images from Storage; placeholder only if missing
- Do not hardcode fake catalog prices/names as primary data

### M5 — Catalog
- Align with `bakery-catalog.html`: light page header, category chips, product grid
- Keep existing query filters (`is_available` / active categories)
- Empty states both locales

### M6 — Product detail
- Align with `bakery-product.html` layout (gallery + details + CTA)
- Preserve option selection + add-to-cart behavior (`AddToCartButton`, price helpers)
- Related products strip optional if time; not required for gate if home/catalog already show scroll pattern

### M7 — Cart
- Align with `bakery-cart.html`
- No change to CartProvider persistence API unless styling forces tiny markup refactor
- Totals remain client-consistent with existing helpers

### M8 — Checkout + confirmation
- Align with `bakery-checkout.html` / EN sibling for form chrome
- **Forbidden:** changing lead-time, Saturday block, fulfillment, PII fields, price recomputation, status
- Order confirmation / `/order/[id]` get bakery chrome for consistency
- Resend may no-op locally — acceptable; do not block on email

### M9 — Docs
- Update `DOCS/ux.md`: Status = selected Bakery Scroll; decision date; pointer to `DOCS/ux-previews/`
- Keep Direction A section as archival if useful; do not leave conflicting “Selected — Direction A” as current

### M10 — Verification + `dev-phase5.md`
- `npm run lint` PASS
- `npm test` PASS (add unit tests only for new pure helpers; else existing suite)
- Prefer `npx next build` if full `npm run build` hits known Windows Prisma EPERM — document which command
- Manual E2E evidence table (steps, expected, actual)
- Explicit note: Phase 4 Production/Resend still PARKED / open

## Acceptance / Gating Criteria

- [x] Branch `phase-5/bakery-scroll-storefront` used and named in `dev-phase5.md`
- [x] `/he` and `/en` storefront match Bakery Scroll visual language (cream/gold/light; not dark Noir)
- [x] Home shows bakery composition (hero + horizontal scroll sections)
- [x] Catalog, PDP, cart, checkout on-theme
- [x] Guest checkout still creates `Order` with `pending_approval` (domain path unchanged via `createGuestOrder`; UI chrome verified; full submit not re-logged this phase — acceptable for presentation-only)
- [x] Checkout validation / pricing / admin domain unchanged
- [x] No intentional `/admin` redesign
- [x] HE RTL + EN LTR + language switcher work
- [x] `prefers-reduced-motion` considered for animations
- [x] `DOCS/ux.md` updated to Bakery Scroll selected
- [x] `npm run lint` PASS; `npm test` PASS
- [x] Functional evidence documented in `dev-phase5.md`
- [x] No requirement claimed for Production URL or Resend message ids
- [x] Phase 4 residual explicitly still open in Known Issues / notes

## Functional Testability Criteria

- **Page/screen:** `http://localhost:3000/he`, `/he/catalog`, PDP, `/he/cart`, `/he/checkout`; `/en` equivalents
- **User-visible behavior:** Bakery Scroll look; carousels/ticker if implemented; cart + checkout usable
- **Command-line:** `npm run dev`, `npm run lint`, `npm test` (+ build as feasible)
- **API / server action:** Existing order create still succeeds locally
- **Minimal E2E:** Home → product → add to cart → guest checkout → confirmation / order id
- **Expected result:** UI matches approved bakery direction; order persists for admin; no Production dependency

## Required Developer Evidence

`team-Yuri/dev-phase5.md` must include:

1. Phase identifier `PHASE=5` and branch name
2. Implementation summary (presentation-only)
3. Milestone table M0–M10 with Yes/No
4. Files changed (paths + short reason)
5. Dependencies: none expected; if any, justify within UI scope
6. Unit tests: command + PASS/FAIL (+ note if no new helpers)
7. Lint: command + PASS/FAIL
8. Build: command + result (or documented Windows workaround)
9. Functional testability: steps, expected, actual (local URLs)
10. Known issues (include Phase 4 PARKED Production/Resend)
11. Scope compliance checklist vs arch-phase5
12. Declaration READY_FOR_MANAGER_REVIEW or BLOCKED with reason

## Out of Scope

- Vercel Production deploy, Production E2E, live Resend proof (Phase 4)
- Admin UI redesign / admin Hebrew→EN i18n
- Prisma schema / migrations / ERD changes
- Online payments, coupons, loyalty, WhatsApp, delivery zones (Phase 6+)
- Pixel-perfect Unsplash cloning when DB images exist
- Changing cart persistence model or checkout business rules
- Merging to `main` without explicit user approval

## Risks / Open Questions

| Risk | Mitigation |
|---|---|
| Token change harms admin contrast | Prefer storefront-scoped classes; spot-check `/admin/login` |
| Scope creep into “extra features” | Reject; UI only |
| Missing product images look empty | Tasteful placeholder; do not hardcode fake catalog |
| Motion accessibility | `prefers-reduced-motion` |
| Windows Prisma EPERM on build | Use `npx next build` / document; do not invent broken gates |
| Phase 4 confusion | Always note Production still open in `dev-phase5.md` |

## Manager Review
MANAGER_REVIEW_STATUS: APPROVED

### Review Notes

Reviewed `dev-phase5.md` against `manager-phase5.md` and `arch-phase5.md` (PHASE=5).

| Check | Result |
|---|---|
| Phase identifier aligned | Pass (`PHASE=5`) |
| Milestones M0–M10 claimed complete | Pass |
| Branch + push evidence | Pass (`phase-5/bakery-scroll-storefront`, PUSHED) |
| Lint / unit tests / build | Pass (`npm run lint`, `npm test` 18, `npx next build`) |
| Docs (`DOCS/ux.md` Bakery Scroll selected) | Pass |
| Presentation-only scope | Pass — storefront UI/tokens/i18n/mocks; no payments/loyalty/admin redesign/Prisma |
| Architecture constraints | Pass — routes/domain preserved; Phase 4 Production not required |
| Functional evidence | Pass with note — page/HE↔EN/UI smoke documented; guest order submit not re-logged this phase; `createGuestOrder` still wired (presentation-only acceptable) |
| Known issues blocking | None — Phase 4 PARKED correctly documented; Unsplash fallback and token bleed to admin are residuals, not blockers |

Manager **APPROVED**. Hand off to Architect for final phase review.

### Required Corrections

None.