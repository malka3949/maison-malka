# Team Yuri Architecture Plan

## Document Status
STATUS: APPROVED

## Project Objective

Build Maison Malka — a premium boutique pastry e-commerce platform for Jerusalem (MVP). Digital brand presence, categorized product catalog with fixed bundles, guest checkout with optional registration, manual order approval, and admin operations. Hebrew + English from MVP.

## Users and Primary Use Cases

### Customer (private)
- Browse brand and catalog by category
- View products and bundles
- Add to cart and submit order request (Phase 2+)
- Optional account for saved details (Phase 2+)

### Business administrator
- Secure admin login
- Manage categories, products, bundles, images, availability (Phase 1 foundation)
- Review and approve orders (Phase 3+)
- Edit site marketing content, media, and business settings without developer redeploy (Phase 6+)
- Send manual promotional emails to consented past customers (Phase 8 / product Phase 12)

## Facts

- Approved stack: Next.js + TypeScript, Modular Monolith, Prisma, Supabase (PostgreSQL, Auth, Storage), Vercel, Resend
- Payment MVP: bank transfer / on pickup only — no online card processing
- Order approval: manual — mandatory before order is final
- Guest checkout + optional customer registration
- Catalog: categories + products + fixed bundles; no seasonal products in MVP
- Admin orders view: list + calendar (Phase 3)
- ERD defined: `DOCS/Maison-Malka-ERD.md`
- Product specs: `DOCS/Maison-Malka-PRD.md`, Architecture, Technology Stack, Development Phases Plan

## Assumptions

- Single business administrator for MVP; data model supports future multi-admin
- Product images supplied by business; stored in Supabase Storage (`product-images`)
- Site/marketing images (Phase 6+) stored in Supabase Storage (`site-media`) and managed via admin CMS
- Manual inventory via `is_available` flag — no automated stock

- Jerusalem service area only for MVP
- Orders: Sunday–Friday fulfillment; minimum 2 days lead time (enforced in Phase 2+)

## Constraints

- Modular monolith — no microservices in MVP
- No hardcoded business data (products, prices, orders in DB)
- Marketing/site content and business contact settings become DB-driven in Phase 6 (fallback to message defaults allowed)
- Admin users via Supabase Auth — not hardcoded
- Team Yuri artifacts separate from application source
- Do not invent top-level folders without Architect approval
- AI must not change approved architecture without explicit approval

## Architectural Principles

1. **MVP simple** — avoid unnecessary complexity
2. **Data separate from code** — catalog, orders, and (from Phase 6) site marketing content in database
3. **Prepare for growth** — multi-admin, payments, delivery zones later
4. **Functionally testable phases** — each phase delivers observable outcome
5. **Plan → Perform → Verify** — no big-bang, no skipped verification

## Recommended High-Level Architecture

```text
Customer / Admin
       |
Next.js Web Application (Vercel)
       |
Next.js Application Layer (API routes / server actions)
       |
+----------+----------+----------+
|          |          |          |
Prisma   Supabase   Supabase   Resend
(PG)     Auth       Storage    (email, Phase 3+)
```

## Non-Functional Requirements

- Mobile-responsive premium UI
- Hebrew (default) + English (i18n)
- Secure admin access (role-based)
- Environment separation (dev / production)
- Fast image loading via CDN/storage URLs
- RTL support for Hebrew

## Risks and Mitigations

| Risk | Impact | Mitigation | Owner / Artifact |
|---|---|---|---|
| Scope creep in Phase 1 | Delayed MVP | Strict phase boundaries in arch-phase docs | Architect |
| IDOR on orders/admin | Data leak | Server-side authz; security review Phase 4 | Developer + secure-code-review |
| PII handling (Israeli law) | Compliance gap | Privacy audit before production | israel-privacy-compliance |
| Supabase/Vercel misconfiguration | Exposed secrets | infra-security-review Phase 4 | Developer |
| Order overload | Production limits | Manual capacity; future daily caps | Product (post-MVP) |

## Phased Delivery Plan

Team Yuri phases align with `DOCS/Maison-Malka-Development-Phases-Plan.md`:

| TY Phase | Name | Primary deliverable |
|---|---|---|
| 1 | System Foundation | Admin + DB + catalog model + dev deploy |
| 2 | Customer Experience | Public site, catalog, cart, order submit |
| 3 | Order Operations | Admin orders, approval, Resend emails |
| 4 | Production Readiness | Security, backup, performance, prod deploy (PARKED — incomplete) |
| 5 | Storefront Bakery Scroll UI | Apply approved light bakery design to public Next.js storefront |
| 6 | Site Content CMS | Admin-editable homepage/chrome texts, site media library, business settings |
| 7 | Pre-launch Trust & Legal | Legal pages, contact disclosures, checkout consent, delivery disclosure, bank-transfer instructions |
| 8 | Marketing Email Campaigns | Admin manual promo campaigns via Resend + marketing consent/unsubscribe (product doc Phase 12); payments/loyalty remain deferred |
| 9 | Campaign Media Attachments | Optional promo image in email body + optional PDF attachment on campaigns; keep Phase 8 consent/unsubscribe |)

## Phase 1: System Foundation

### Goal

Establish technical foundation: Next.js app, Supabase, Prisma schema, admin auth, product/category/bundle/image model, dev deployment.

### Scope

- Initialize Next.js + TypeScript project under `src/`
- Prisma schema from ERD (foundation entities for catalog + admin)
- Supabase project: PostgreSQL, Auth, Storage bucket for product images
- Admin authentication and protected admin routes
- Admin UI skeleton: login, category CRUD, product CRUD, image upload, bundle items
- Seed data for dev (sample categories/products)
- Vercel dev/preview deployment
- README with setup and run instructions

### Architectural Direction

- App Router Next.js, server actions or API routes for admin mutations
- Prisma as sole DB access layer
- Supabase Auth for admin; `User.role = admin` in application DB
- Images: upload to Supabase Storage; `ProductImage.storage_path` in DB

### Non-Negotiable Constraints

- TypeScript strict mode
- No customer ordering flow in Phase 1
- No payment integration
- Schema aligned with `DOCS/Maison-Malka-ERD.md`

### Out of Scope

- Public customer catalog pages (Phase 2)
- Cart, checkout, orders (Phase 2–3)
- Resend integration (Phase 3)
- i18n public UI (Phase 2; admin may use Hebrew-first)

### Dependencies

- Supabase account and project
- Vercel account linked to repo
- Node.js LTS locally

### Verification Expectations

- Prisma migrate applies cleanly
- Admin login works
- CRUD categories and products via admin
- Image upload stores file and DB reference
- `npm run lint` and `npm test` pass (once configured)
- Dev deployment URL loads admin login

### Functional Testability

Admin opens deployed dev URL → logs in → creates category → creates product with image → marks availability → sees data persisted after refresh.

### Handoff Notes for Phase Design

See `team-Yuri/arch-phase1.md`.

## Phase 2: Customer Experience

### Goal
Public brand site, catalog, cart, guest checkout form, order submission (no payment processing).

### Functional Testability
Customer browses catalog, adds to cart, submits order request without account.

## Phase 3: Order Operations

### Goal
Admin order management (list + calendar), approval workflow, Resend notifications.

### Functional Testability
Admin approves/rejects order; customer receives email.

## Phase 4: Production Readiness

### Goal
Production deploy, security audits, backup, monitoring.

### Functional Testability
Production URL serves MVP flow end-to-end.

### Status (plan note)
**PARKED / incomplete** by explicit user decision (2026-07): more storefront work before Production. Artifacts `arch-phase4.md` / `manager-phase4.md` / `dev-phase4.md` remain; resume after Phase 5 (or later) when user is ready for Vercel Production + live Resend. Do not treat Phase 4 as APPROVED-complete.

## Phase 5: Storefront Bakery Scroll UI

### Goal
Replace the Phase 2 Direction A (Noir & Gold) public storefront look with the user-approved **Bakery Scroll** light bakery design, using `DOCS/ux-previews/direction-bakery-scroll.html` and sibling bakery pages as the visual/source-of-truth mock — without changing order/business domain logic.

### Scope
- Design tokens + typography aligned to `bakery-theme.css` (light cream surface, gold accents, Cormorant + Heebo)
- Public pages: home, catalog, product detail, cart, checkout (+ order confirmation if present)
- HE/EN + RTL/LTR preserved
- Horizontal category/product carousels, ticker, subtle motion (respect `prefers-reduced-motion`)
- Sync `DOCS/ux.md` to record Bakery Scroll as selected storefront direction

### Out of Scope
- Admin UI redesign
- Production deploy / Resend live proof (Phase 4 residual)
- Online payments, loyalty, coupons, WhatsApp, delivery zones (Phase 7+)
- Prisma schema / ERD changes unless a blocking bug is found (then stop and escalate)

### Functional Testability
User opens `localhost` `/he` (and `/en`): storefront matches Bakery Scroll composition; browse → cart → guest checkout still creates `pending_approval` order.

### Handoff Notes for Phase Design
See `team-Yuri/arch-phase5.md`.

## Phase 6: Site Content CMS

### Goal
Give the business administrator a Site Content CMS so marketing texts, dedicated site images, and business contact settings can be edited from `/admin` after cloud deploy — without developer code changes or redeploy.

### Scope
- Prisma models: `SiteMedia`, `SiteContentBlock` (keyed plain-text blocks, HE/EN), `SiteSettings` (business contact / hours / lead-time note)
- Supabase Storage bucket `site-media` (separate from `product-images`)
- Admin routes: `/admin/site`, `/admin/media`, `/admin/settings` + nav links
- Storefront reads CMS blocks/settings with fallback to existing `src/messages/{he,en}.ts` defaults
- Dedicated hero (and promo slot) images from CMS when set; otherwise retain current fallbacks
- Plain text only — no freeform HTML / page builder

### V1 editable surfaces (locked)
- Homepage marketing: hero title/subtitle/CTAs, ticker, trust strip, final CTA, promo frame copy
- Site chrome: announcement bar, footer tagline / hours note
- Business settings: pickup address, phone, hours, lead-time note (as used in marketing / checkout display)
- Media library: upload, replace, delete site images; assign to content slots

### Architectural Direction
- Modular monolith continues; Prisma sole DB layer; admin mutations via server actions / existing upload API pattern extended for `site-media`
- Fixed content keys (allowlist) — not arbitrary page trees
- Reuse `requireAdmin` for all write paths
- Update ERD/docs to document new entities

### Non-Negotiable Constraints
- No rich-text HTML injection (React text nodes only)
- Do not break catalog/order flows or Bakery Scroll presentation contract
- Phase 4 Production remains PARKED (not required to close Phase 6)
- TypeScript strict; lint + unit tests PASS
- Functionally testable on local `npm run dev`

### Out of Scope
- Freeform page builder / drag-and-drop layouts
- New About (or other) marketing pages
- Editing all UI chrome strings (cart/checkout/auth/errors) — remain in message files until a later phase
- Online payments, loyalty, coupons, WhatsApp, delivery zones (Phase 7)
- Completing Phase 4 Production / live Resend proof
- Admin visual redesign beyond new CMS pages and nav entries

### Functional Testability
Admin opens `/admin/site`, changes Hebrew hero title and replaces hero image → refreshes public `/he` home and sees the new copy and image without redeploy.

### Handoff Notes for Phase Design
See `team-Yuri/arch-phase6.md`.

## Phase 7: Pre-launch Trust & Legal

### Goal
Make the public storefront safer for real customers before go-live: HE/EN legal pages, always-visible business contact info, mandatory checkout consent, Jerusalem delivery disclosure, and bank-transfer payment instructions after approval.

### Scope (wave 1 — locked)
- Public legal pages: privacy, terms/sale, cancellation/refund (food) — HE + EN
- Footer + checkout links to legal pages
- Always-visible phone, pickup address, hours (CMS with hard message fallbacks; **no** ע.מ./ח.פ.)
- Checkout: required privacy+terms consent (client + server)
- Delivery: Jerusalem service-area disclosure + cost “arranged / בתיאום” (no geo fee engine)
- Keep `bank_transfer`; admin-editable bank details (SiteSettings); show instructions on approved email / confirmation when that method is used

### Out of Scope
- Phase 4 Production / live Resend proof / full security+privacy audit close-out
- P1 pack (rich order confirmation, cart option labels, phone validation, completed workflow, accessibility page) — later phase unless trivial contact reuse in email templates
- Online card payments, loyalty, WhatsApp, delivery-zone product (Growth)
- CMS editing of full legal page HTML

### Functional Testability
User opens legal pages from footer; checkout blocks without consent; delivery shows Jerusalem + arranged cost; admin saves bank details; approve bank_transfer order → customer sees pay instructions.

### Handoff Notes for Phase Design
See `team-Yuri/arch-phase7.md`.

## Phase 8: Marketing Email Campaigns

### Goal
Give the business administrator an in-admin way to send a **manual promotional email** to past customers who opted in to marketing, with unsubscribe — without online payments, loyalty, or full marketing automation.

Maps to product doc: `DOCS/phases/12-marketing-email-campaigns.md` (does **not** overwrite product Phase 08 admin-orders).

### Scope
- Optional marketing opt-in at checkout (separate from required terms consent); persist consent in DB
- Audience = distinct emails from past orders **with active marketing consent only**
- Admin UI: compose subject + plain/safe body; preview recipient count; send campaign via Resend
- Campaign module separate from transactional `sendOrder*` helpers
- Signed/token unsubscribe link → public page → revoke consent
- Basic campaign history (subject, time, recipient count, status)
- Batch sending + respect Resend limits; `RESEND_DEV_TO` in development

### Out of Scope
- Online card payments, loyalty, coupons, WhatsApp, CRM
- Automated drip / triggered marketing sequences (remain in product Phase 11)
- Freeform HTML page builder / rich WYSIWYG for campaigns
- External ESP (Mailchimp etc.) — optional later if volume outgrows Resend
- Phase 4 Production cutover / live Resend production proof as phase gate

### Architectural Direction
- New logical entities: MarketingConsent, EmailCampaign, CampaignSend (see ERD)
- Delivery via existing Resend provider; campaign path must not mix with order notification helpers
- Legal terms consent ≠ marketing consent

### Functional Testability
Admin opens campaigns screen, sends a campaign to consented test address; recipient receives email with working unsubscribe; unsubscribed email is excluded from next audience.

### Handoff Notes for Phase Design
See `team-Yuri/arch-phase8.md`.

### Deferred Growth (later phase)
Online payments, loyalty, delivery-zone expansion, WhatsApp — remain TBD after Phase 8 campaigns.

## Phase 9: Campaign Media Attachments

### Goal
Extend Phase 8 admin campaigns so the administrator can optionally attach a **promo image** (shown in the email) and/or a **PDF** (as email attachment), while keeping plain-text body, consent, and unsubscribe unchanged.

### Scope
- Optional image upload (jpeg/png/webp) embedded in campaign HTML via absolute public media URL
- Optional PDF upload attached via Resend `attachments`
- Subject + body remain required; media is additive
- Store paths on `EmailCampaign`; reuse `site-media` under `campaigns/` prefix
- Keep campaign module separate from `sendOrder*`; extend shared Resend send to support attachments
- Unit tests for template image block + attachment payload shaping

### Out of Scope
- WYSIWYG / HTML designer
- Multiple images, galleries, A/B
- External ESP, payments, loyalty, WhatsApp
- Changing consent/unsubscribe model

### Functional Testability
Admin attaches image and/or PDF, sends campaign; email HTML contains image when provided; Resend payload includes PDF attachment when provided; unsubscribe still present.

### Handoff Notes for Phase Design
See `team-Yuri/arch-phase9.md`.

## Open Questions

| Question | Why It Matters | Required Decision |
|---|---|---|
| Supabase/Vercel project names | Env setup | Developer during Phase 1 |
| Admin UI language in Phase 1 | Scope | Hebrew-first admin acceptable for Phase 1 |
| Brand assets (logo, fonts) | Homepage Phase 2 | User to supply before Phase 2 |
| Hero / promo imagery for Bakery Scroll | Visual fidelity vs Unsplash placeholders | Use product images from Supabase where available; placeholders OK until business assets / Phase 6 CMS |
| Exact allowlisted CMS keys | Manager sequencing | Architect locks key set in `arch-phase6.md`; Manager may group UI forms only |

---

## Addendum — Admin product image UX (post Phase 1)

Additive operational notes only. Does **not** advance `PHASE.md`, replace Phase 1–6 goals, or change ERD.

Current product-image behavior (browser cutout + live background preview + same-origin media proxy for NetFree-safe display) is specified in:

`DOCS/features/admin-product-images.md`

Phase 1 still owns: Storage bucket `product-images`, `ProductImage.storage_path`, authenticated upload. Display URLs for storefront/admin now go through `/api/media/product-images/...` rather than raw `*.supabase.co` links in the browser.
