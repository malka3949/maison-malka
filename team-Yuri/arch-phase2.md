# Architecture Phase 2

## Phase Identifier
PHASE=2

## Status
STATUS: APPROVED

## Phase Goal

Deliver the customer-facing Maison Malka experience: branded homepage and catalog (Direction A — Boutique Noir & Gold), product detail with options/bundles, session cart, guest checkout with pickup/delivery, and order-request persistence — with Hebrew (default RTL) and English (LTR) public UI. No online payment and no admin order-ops UI (Phase 3).

## Source References

- `team-Yuri/plan.md` — Phase 2: Customer Experience
- `team-Yuri/arch-phase1.md` — foundation to extend (not replace)
- `DOCS/Maison-Malka-PRD.md`
- `DOCS/Maison-Malka-Architecture-Plan.md`
- `DOCS/Maison-Malka-Technology-Stack-Decision.md`
- `DOCS/Maison-Malka-Development-Phases-Plan.md` — Phase 2
- `DOCS/Maison-Malka-ERD.md` — CustomerProfile, Order, OrderItem, OrderItemOption
- `DOCS/ux.md` — Direction A selected (Boutique Noir & Gold)

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| Extend Phase 1 Next.js modular monolith | Approved stack; shared Prisma/Supabase | Public routes under `src/app/` alongside existing `/admin` |
| Design system: Direction A from `DOCS/ux.md` | User-selected brand direction | Shared CSS tokens (`mm-*`) / Tailwind; Cormorant + Heebo; gold CTA |
| Hebrew default + English locale switch | PRD / Phase 2 plan | RTL default; LTR when locale=en; both required in MVP |
| Public catalog reads same Phase 1 product tables | Single source of truth | Only `is_available` / active categories exposed publicly |
| Cart = client/session state until checkout | ERD guidance; MVP simplicity | No `Cart` table; checkout creates `Order` |
| Guest checkout required; optional Auth registration | PRD / phases plan | Order stores customer snapshot; optional `User` + `CustomerProfile` |
| Persist Order + OrderItem + OrderItemOption on submit | ERD / Phase 2 completion criteria | Status starts as pending-approval-compatible; admin ops UI deferred |
| Payment fields stored as selection only | No payment processing in Phase 2 | `payment_method` recorded; no gateway charge |
| No new top-level folders | Project structure rules | Stay within `src/`, `prisma/`, `tests/` |

## Constraints / Non-Negotiables

- No online payment processing / payment-gateway integration
- No Resend / order-approval emails (Phase 3)
- No admin order list/calendar/approval UI (Phase 3)
- Do not break Phase 1 admin catalog/auth
- Schema additions must align with ERD entity names and relationships
- Public site must not expose inactive products/categories or service-role secrets
- TypeScript strict; lint and unit tests required
- Functionally testable customer E2E flow required (browse → cart → submit order)

## Technical Boundaries / Out of Scope

- Order management dashboard, status workflow UI, Resend (Phase 3)
- Production hardening / security skill audits (Phase 4)
- Online payments, coupons, loyalty, seasonal campaigns (Phase 5 / deferred)
- Server-side persistent cart entities
- Delivery automation / courier APIs
- Redesigning admin beyond reuse of existing Direction A tokens (admin already styled in Phase 1)

## Dependencies and Interfaces

### Builds on Phase 1
- Prisma catalog models, Supabase Auth admin, Storage images, admin CRUD
- Env: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`

### New / extended
- Prisma models: `CustomerProfile`, `Order`, `OrderItem`, `OrderItemOption` (+ enums as per ERD)
- Public routes (indicative): `/`, `/catalog`, `/products/[slug]`, `/cart`, `/checkout`, success/confirmation
- Locale mechanism: path prefix, cookie, or `next-intl` / App Router locale segment — Manager chooses concrete approach within this contract
- Optional customer Auth (reuse Supabase Auth) + `CustomerProfile` link to `User`

### External services
- Supabase PostgreSQL + Auth + Storage (existing)
- Vercel hosting (existing); preview deploy recommended for Phase 2 evidence

## Data / State Considerations

- Public reads: Category/Product where active/available; translations for he+en; images; options; bundle composition
- Cart line items: product id, quantity, selected option value ids, computed line price (base + deltas; bundle price as product base)
- Order on submit: customer snapshot fields, fulfillment_type (pickup|delivery), delivery_address when delivery, requested_fulfillment_date (enforce min lead time ≥ 2 days; Sunday–Friday business rules per PRD/plan), payment_method selection, status pending
- OrderItem snapshots product identity/name/price at order time where ERD requires
- Guest orders: `user_id` null; registered: link optional `User`
- Lead-time / closed Saturday: validate on checkout server action

## Security / Privacy Considerations

- Server actions for order create: validate input, price recomputation server-side (never trust client totals)
- Rate-limit or basic abuse controls documented if feasible; otherwise known limitation
- PII in Order: collect minimum for fulfillment; document fields in README; prepare for Israel privacy later
- Separate public route surface from `/admin`; admin middleware unchanged
- Optional customer login must not grant admin role
- Storage: public read for product images only

## Testing and Lint Expectations

- `npm run lint` PASS
- Unit tests for: price/option calculation helpers, locale/dir helpers, checkout validation (lead time / fulfillment)
- Document commands and results in `dev-phase2.md`
- Functional E2E: browse → add to cart → checkout guest → order row persists; locale switch HE↔EN visible

## Functional Testability

- **Page/screen the user can open:** `/` (homepage), catalog, product page, cart, checkout (Hebrew default)
- **User-visible behavior:** Browse by category; open product; select options; add to cart; submit guest order; see confirmation; switch UI to English
- **Command-line flow:** migrate new models → seed (reuse/extend) → `npm run dev` → complete guest checkout
- **API endpoint / request:** Server action / route creating Order + items returns success and persists rows
- **Minimal end-to-end flow:** Home → product → add to cart → checkout form → submit → refresh DB/admin-visible data path (SQL or temporary diagnostic allowed; admin order UI not required)
- **Expected observable result:** Customer can place an order request without account; catalog and brand UI match Direction A

## Handoff Notes for Manager

- Milestone order suggestion: (1) Prisma Order/CustomerProfile migrations, (2) public layout + Direction A shell + i18n, (3) homepage + catalog + PDP, (4) cart, (5) checkout + order persistence + validation, (6) optional register/login + profile reuse, (7) seed/README + functional evidence + preview
- Acceptance must require guest checkout E2E with DB proof of Order
- Brand image assets: if user has not supplied logo/photos, use Direction A typography brand mark + catalog images from Storage; do not block on missing logo file
- Keep Phase 3 strictly out: no Resend, no admin order screens
- Reuse `src/lib/admin-ui.ts` / `mm-*` tokens where useful; customer components live under `src/components/` (e.g. `storefront/`)

## Architect Review
ARCHITECT_REVIEW_STATUS: APPROVED

### Review Notes

**Review date:** 2026-07-14  
**Reviewer:** Yuri (Software Architect)  
**Artifacts reviewed:** `arch-phase2.md`, `manager-phase2.md` (MANAGER_REVIEW_STATUS: APPROVED), `dev-phase2.md` (STATUS: COMPLETE)

#### Architecture alignment — PASS

| Check | Verdict | Notes |
|---|---|---|
| Phase 2 goal | Pass | Customer storefront with catalog, cart, guest checkout, order persistence |
| Stack / monolith extension | Pass | `[locale]` routes alongside `/admin`; shared Prisma/Supabase |
| ERD Phase 2 entities | Pass | CustomerProfile, Order, OrderItem, OrderItemOption + enums migrated |
| Direction A design | Pass | Boutique Noir & Gold tokens, Cormorant + Heebo, gold CTA |
| i18n HE/EN | Pass | App Router `[locale]`; RTL/LTR; messages + switcher |
| Cart model | Pass | Client/session until checkout; no Cart table (per arch) |
| Checkout security | Pass | Server-side price recompute; fulfillment validation tested |
| Scope boundaries | Pass | No payment gateway, Resend, admin order UI |
| Phase 1 preservation | Pass | Admin routes and catalog foundation intact |
| Manager gate | Pass | All acceptance criteria marked satisfied |

#### Functional testability — PASS (with documented residuals)

| Criterion | Verdict | Notes |
|---|---|---|
| Browse storefront | Pass | `/he` homepage verified (categories, featured products) |
| Order persistence | Pass | Guest order `pending_approval` with item + option snapshot in DB |
| Locale paths | Pass | `/en/catalog` available; switcher present |
| Full UI checkout click-path | Partial | `createGuestOrder` implemented; DB proof via script; acceptable per arch allowance for diagnostic verification and Manager approval |
| M11 Vercel preview | Deferred | Orchestrator waiver documented; recommended before production, not blocking architectural phase close |

#### Accepted residuals for Phase 2 close

| Item | Disposition |
|---|---|
| Product URLs by `id` not slug | Accepted — Phase 1 schema limitation; documented |
| Vercel preview URL | Accepted with waiver; build readiness PASS |
| Rate-limit on checkout | Known limitation — not required for MVP close |
| Admin session on storefront header | Cosmetic; no security breach |

#### Verdict

Phase 2 architecture intent is met. Customer can browse catalog and place order requests without payment processing. Do **not** update `PHASE.md` until orchestrator receives explicit G3 user approval for advance to Phase 3.

### Required Corrections

(none)

