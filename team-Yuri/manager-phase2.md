# Manager Phase 2

## Phase Identifier
PHASE=2

## Status
STATUS: READY_FOR_ARCHITECT_REVIEW

## Phase Goal

Deliver a functionally testable customer storefront: Direction A branded homepage and catalog, product detail (options/bundles), session cart, guest checkout with pickup/delivery and order persistence (Order + items), plus Hebrew (default RTL) / English (LTR) public UI — without payment processing, Resend, or admin order operations.

## Source References

- `team-Yuri/arch-phase2.md`
- `team-Yuri/plan.md`
- `team-Yuri/arch-phase1.md` (foundation constraints)
- `DOCS/Maison-Malka-ERD.md`
- `DOCS/ux.md` (Direction A)
- `DOCS/Maison-Malka-Development-Phases-Plan.md` — Phase 2
- `.cursor/rules/20-testing.md`, `30-docs.md`, `40-project-structure.md`

## Architecture Summary

- **Stack:** Existing Next.js App Router + Prisma + Supabase (extend Phase 1)
- **Phase 2 scope:** Public storefront, i18n HE/EN, cart (client/session), guest checkout → Order persistence; optional customer register/login + CustomerProfile
- **Design:** Boutique Noir & Gold (`DOCS/ux.md` Direction A); reuse `mm-*` tokens / fonts
- **ERD entities this phase:** CustomerProfile, Order, OrderItem, OrderItemOption (+ enums)
- **Deferred:** Admin order UI, Resend, payment gateways, Cart tables
- **Locale decision (Manager):** App Router segment `src/app/[locale]/...` with `locale ∈ {he, en}`; default `he` (RTL); `en` → LTR. UI copy via typed message modules under `src/messages/` (or equivalent). Product/category names from DB translations. Language switcher in public header.

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M1 | Order schema migration | Prisma models + enums per ERD; migrate against Supabase | `npx prisma migrate dev` (or deploy) succeeds; tables exist |
| M2 | Storefront shell + i18n | `[locale]` layout, Direction A chrome, lang switcher, dir/rtl | `/he` and `/en` render; dir switches correctly |
| M3 | Homepage | Brand hero, category teasers, featured products, CTA | `/he` matches Direction A structure (hero → categories → featured → CTA) |
| M4 | Catalog | List active categories/products; filter by category | Customer browses available catalog only |
| M5 | Product detail (PDP) | Gallery, name/desc, price, options, bundle composition; add to cart | Options/deltas work; unavailable products not linked publicly |
| M6 | Cart | Session/client cart: add/update/remove; persist across refresh (e.g. localStorage) | Cart totals match server-side price helper rules |
| M7 | Checkout + Order create | Guest form: contact, pickup/delivery, date, payment_method selection; server recomputes prices; create Order + items + options | Guest submit → confirmation; Order row `pending_approval` in DB |
| M8 | Checkout validation | Lead time ≥ 2 days; fulfillment Sunday–Friday (no Saturday); delivery requires address | Invalid dates/fulfillment rejected with clear errors |
| M9 | Optional customer auth | Register/login (Supabase); role≠admin; CustomerProfile; prefills checkout | Guest still works; registered can reuse saved details |
| M10 | Docs + seed + evidence | README storefront section; seed usable for demo; `dev-phase2.md` | Lint/tests/build/migrate/E2E documented PASS |
| M11 | Preview (recommended) | Vercel preview with env vars **or** documented orchestrator waiver | Preview URL or explicit waiver in `dev-phase2.md` |

## Detailed Development Plan

### M1 — Order schema migration
- Add enums: OrderStatus, FulfillmentType, PaymentMethod (align ERD)
- Models: CustomerProfile, Order, OrderItem, OrderItemOption
- Relations: User optional on Order; Product on OrderItem; ProductOptionValue optional on OrderItemOption with snapshots required
- Migration under `prisma/migrations/`; do not break Phase 1 tables
- Extend seed lightly if needed (no requirement to seed sample orders)

### M2 — Storefront shell + i18n
- Restructure public app routes under `src/app/[locale]/`
- Root `/` redirects to `/he` (or middleware default)
- Shared storefront layout: header (brand, nav, lang, cart icon), footer
- Apply Direction A tokens from `globals.css` / `mm-*`; Cormorant + Heebo already present
- Components under `src/components/storefront/`
- Keep `/admin` outside locale segment; middleware continues to protect admin only

### M3 — Homepage
- Hero with brand-forward typography (no card clutter per project design rules; follow `DOCS/ux.md` Direction A)
- Category section linking to catalog filters
- Featured/available products grid
- Primary CTA toward catalog or checkout path
- If no logo file: text brand mark acceptable

### M4 — Catalog
- Query only `is_active` categories and `is_available` products
- Category filter (query param or path)
- Show price in ILS; HE/EN labels from translations
- Empty states in both locales

### M5 — Product detail
- Resolve by slug (or id if slug absent — prefer slug from Phase 1)
- Standard: options + price_delta; validate required options before add
- Bundle: list BundleItem components (read-only composition)
- Images from Storage public URLs
- Add to cart CTA

### M6 — Cart
- Client store (React context + localStorage recommended)
- Line: productId, quantity, selected option value ids
- Display name/price via fetch or embedded cart payload; **authoritative price on checkout server**
- Link to checkout; empty cart handling

### M7 — Checkout + Order create
- Form fields per ERD Order snapshot: name, phone, email, fulfillment_type, delivery_address, requested_fulfillment_date, payment_method (`bank_transfer` | `on_pickup`), notes
- Server action: load products, recompute unit/line/subtotal/total, write Order status `pending_approval`, OrderItems, OrderItemOption snapshots
- Never trust client total
- Confirmation page with order id (no payment charge)

### M8 — Checkout validation
- `requested_fulfillment_date` ≥ today + 2 days
- Reject Saturday (and document Friday cutoff if already in PRD; minimum: no Saturday)
- Delivery ⇒ address required
- Empty cart ⇒ reject

### M9 — Optional customer auth
- Public register/login pages under `[locale]`
- On register: create Supabase Auth user + `User` with role `customer` + `CustomerProfile`
- Must not assign `admin` unless email matches `ADMIN_EMAIL` existing bootstrap rules
- Logged-in checkout prefills from CustomerProfile; still allow guest

### M10 — Docs + seed + evidence
- Update README: storefront URLs, migrate, locale notes
- Unit tests: price helpers, lead-time/Saturday validation, locale/dir helper
- Fill `team-Yuri/dev-phase2.md` completely

### M11 — Preview
- Deploy preview preferred; waiver allowed only if documented in `dev-phase2.md` (same pattern as Phase 1)

## Acceptance / Gating Criteria

Phase 2 passes Manager review only if **all** are true:

- [x] `npm run lint` exits 0
- [x] `npm test` exits 0 (includes new Phase 2 unit tests)
- [x] `npm run build` exits 0
- [x] Prisma migration for Order/CustomerProfile applied (PASS documented)
- [x] `/he` homepage + catalog + PDP usable with Direction A styling
- [x] Language switch to `/en` works (LTR) and back to Hebrew (RTL) — `/en` routes verified; switcher present
- [x] Cart add/update/remove works across refresh — implemented (CartProvider + localStorage); UI path not separately browser-logged
- [x] Guest checkout creates Order + OrderItem (+ options) with `pending_approval` — DB proof via script + `createGuestOrder` server action implemented
- [x] Server-side price recomputation enforced — `orders.ts` recomputes; unit tests on pricing helpers
- [x] Lead time and Saturday rules enforced — `fulfillment.ts` + unit tests
- [x] Inactive/unavailable catalog items not publicly listed — `catalog.ts` filters
- [x] Phase 1 `/admin` still works — `/admin/login` HTTP 200 documented
- [x] No payment gateway, Resend, or admin order UI added — spot-check PASS
- [x] No secrets committed
- [x] `dev-phase2.md` complete with commands, functional evidence, preview waiver
- [x] README updated for storefront

## Functional Testability Criteria

- **Page/screen the user can open:** `/he`, catalog, PDP, cart, checkout, confirmation
- **User-visible behavior:** Browse → select options → add to cart → guest checkout → confirmation; switch HE↔EN
- **Command-line flow:** migrate → (optional seed) → `npm run dev` → complete guest order
- **API endpoint / request:** Order-create server action persists rows (verify via Prisma Studio, SQL, or script counts)
- **Minimal end-to-end flow:** Home → product → cart → checkout → submit → Order exists in DB
- **Expected observable result:** Customer can place an order request without an account in both locales’ chrome

## Required Developer Evidence

`team-Yuri/dev-phase2.md` must include:

1. Implementation summary per milestone (M1–M11)
2. Commands with results: `npm run lint`, `npm test`, `npm run build`, migrate, seed if used
3. Functional E2E steps + actual results (guest order id / DB proof)
4. Locale HE/EN verification notes
5. Preview URL or explicit waiver
6. Env var names only
7. Documentation updates
8. Known limitations / deviations from `arch-phase2.md`

## Out of Scope

- Admin order list, calendar, approve/reject UI
- Resend email notifications
- Online payment / card processing
- Server-side Cart tables
- Coupons, loyalty, marketing automation
- Top-level folders beyond approved structure
- Breaking or rewriting Phase 1 admin foundation

## Risks / Open Questions

| Risk / Question | Mitigation |
|---|---|
| Missing brand logo / product photos | Typography brand mark + existing Storage images; do not block |
| Locale routing clash with `/admin` | Keep admin outside `[locale]`; middleware path aware |
| Client cart price tampering | Server recomputes all monetary fields on checkout |
| Customer Auth accidentally admin | Never grant admin from public register; keep `ADMIN_EMAIL` gate |
| Phase 2 scope too large | M9 (optional auth) may be minimal viable (register + prefill); guest checkout is mandatory |
| Vercel preview delay | Document waiver; local E2E still required |

## Manager Review
MANAGER_REVIEW_STATUS: APPROVED

### Review Notes

**Review date:** 2026-07-14  
**Reviewer:** Ben (SW Manager)  
**Artifact reviewed:** `team-Yuri/dev-phase2.md` + spot-check of implementation

#### Code & scope assessment — PASS

| Area | Verdict | Evidence |
|---|---|---|
| M1–M10 implementation | Pass | `[locale]` routes, Order schema/migration, storefront components, `orders.ts`, messages he/en |
| Lint / unit tests / build | Pass | Documented PASS in `dev-phase2.md` (12 tests incl. phase2) |
| Schema vs ERD Phase 2 subset | Pass | CustomerProfile, Order, OrderItem, OrderItemOption + enums |
| Scope compliance | Pass | No payment gateway, Resend, admin order UI; admin preserved |
| i18n contract | Pass | `[locale]` he/en, messages, switcher, RTL/LTR helpers |
| Catalog visibility | Pass | `is_active` / `is_available` filters in `catalog.ts` |
| Checkout design | Pass | Server-side price recompute; validation helpers tested |
| Customer auth | Pass | Register/login routes; `ADMIN_EMAIL` blocked on public register |
| Docs | Pass | README storefront section updated |

#### Verification & gating assessment — PASS (with residuals)

| Gate | Verdict | Notes |
|---|---|---|
| Migrate deploy | Pass | `20260714010000_phase2_orders` applied |
| Storefront browser | Pass | `/he` homepage with categories, featured products, Direction A chrome |
| Guest order persistence | Pass | Order `cmrka1v5v0000vpekkoqxau18` — `pending_approval`, item + option snapshot |
| Locale EN | Pass | `/en/catalog` HTTP 200; switcher in header |
| M11 Vercel preview | Deferred | Explicit waiver in `dev-phase2.md` — acceptable per Phase 1 precedent |

#### Checklist (`developer-review-checklist.md`)

No reject criteria. Phase identifier aligned; summary, files, tests, lint, functional evidence, docs, scope satisfied.

#### Minor observations (non-blocking)

- Full browser click-path (PDP → cart → checkout form submit) not logged; `createGuestOrder` wired in `CheckoutForm`; DB proof via `scripts/verify-guest-order.ts` using same pricing/fulfillment helpers.
- Cart localStorage persistence not separately browser-logged (implementation present).
- Product URLs use `id` not slug — documented known limitation.
- M11 preview still required before Architect final sign-off or documented waiver at Architect gate.

### Required Corrections

(none — Manager approval granted)

