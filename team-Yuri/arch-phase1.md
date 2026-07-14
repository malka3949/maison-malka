# Architecture Phase 1

## Phase Identifier
PHASE=1

## Status
STATUS: APPROVED

## Phase Goal

Create the technical foundation for Maison Malka: a deployable Next.js application with Supabase-backed database, admin authentication, and admin-managed catalog (categories, products, fixed bundles, images) — validated via a functionally testable admin flow.

## Source References

- `DOCS/Maison-Malka-PRD.md`
- `DOCS/Maison-Malka-Architecture-Plan.md`
- `DOCS/Maison-Malka-Technology-Stack-Decision.md`
- `DOCS/Maison-Malka-Development-Phases-Plan.md` — Phase 1
- `DOCS/Maison-Malka-ERD.md`
- `team-Yuri/plan.md`

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| Next.js App Router + TypeScript | Approved stack; SSR/SSG for future public site | Single repo modular monolith |
| Prisma ORM on Supabase PostgreSQL | Approved; typed schema, migrations | All DB access via Prisma |
| Supabase Auth for admin login | Managed auth; no custom auth | Admin users in auth + app `User` table |
| Supabase Storage for images | Approved; DB stores paths only | Upload flow in admin |
| Admin-only routes in Phase 1 | Foundation before customer UI | No public catalog yet |
| ERD entities Phase 1 subset | Incremental delivery | Category, Product, translations, images, options, BundleItem, User — not Order/Cart yet |
| `src/` application root | Project structure rules | `team-Yuri/` stays separate |
| Vercel preview deploy | Approved hosting | Env vars for Supabase in Vercel |
| Hebrew-first admin UI | Reduce Phase 1 scope | English admin labels Phase 2 optional |

## Constraints / Non-Negotiables

- No customer ordering, cart, or checkout
- No online payment or Resend email
- No hardcoded products or admin credentials
- TypeScript strict
- Schema must align with ERD entity names and relationships
- Admin routes require authenticated admin role
- Do not add top-level folders beyond: `src/`, `tests/`, `prisma/` (under root or src per Next convention)

## Technical Boundaries / Out of Scope

- Public homepage and customer catalog (Phase 2)
- Shopping cart and order entities implementation (Phase 2–3)
- i18n switcher on public site (Phase 2)
- Resend, order approval emails (Phase 3)
- RLS policies for customer data (minimal admin-only RLS in Phase 1)
- Security audit skills execution (Phase 4)
- Seasonal products, coupons, loyalty

## Dependencies and Interfaces

### External services
- Supabase: PostgreSQL, Auth, Storage (bucket: `product-images`)
- Vercel: hosting, environment variables

### Environment variables (documented in README, not committed)
- `DATABASE_URL` — Supabase connection string (Prisma)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server only, never `NEXT_PUBLIC_`

### Prisma models (Phase 1 minimum)

From ERD — implement in Phase 1:
- Category, CategoryTranslation
- Product, ProductTranslation, ProductImage
- ProductOption, ProductOptionValue
- BundleItem
- User (synced with Supabase Auth id; role enum)

Defer to Phase 2+:
- CustomerProfile, Order, OrderItem, OrderItemOption

### Application structure (approved)

```text
src/
  app/
    admin/          # protected admin routes
    api/            # if needed for uploads/auth callbacks
  components/
  lib/
    prisma.ts
    supabase/
  ...
prisma/
  schema.prisma
tests/
```

## Data / State Considerations

- `Product.product_type`: `standard` | `bundle`
- `BundleItem` links bundle Product → component Products with quantity
- Translations: `he` required, `en` required per PRD (admin forms capture both)
- `ProductImage.storage_path` references Supabase Storage object key
- Soft delete not required in MVP — hard delete or `is_active` on categories

## Security / Privacy Considerations

- Admin routes: middleware or layout guard checking Supabase session + `User.role === admin`
- Service role key server-side only
- No PII beyond admin email in Phase 1
- File upload: allowlist image types, size limit, sanitize filenames
- Prepare for RLS in Phase 2 when customer data exists

## Testing and Lint Expectations

- ESLint (Next.js default) — `npm run lint` must pass
- Unit tests: Prisma model helpers or auth guard utilities at minimum
- No E2E required in Phase 1 unless Manager specifies smoke test for admin login
- Developer documents all commands in `dev-phase1.md`

## Functional Testability

- **Page/screen the user can open:** `/admin/login` then `/admin/products` (or dashboard)
- **User-visible behavior:** Admin logs in, creates category (HE+EN), creates standard product with image, creates bundle with bundle items, toggles `is_available`
- **Command-line flow:** `npm run dev` → local admin works; `npx prisma migrate dev` succeeds
- **API endpoint / request:** Image upload returns storage path and persists `ProductImage`
- **Minimal end-to-end flow:** Login → create category → create product → upload image → refresh → data still present
- **Expected observable result:** Admin catalog manageable in dev/preview deployment URL

## Handoff Notes for Manager

- Break into milestones: (1) project init + Prisma, (2) Supabase Auth admin, (3) category CRUD, (4) product + image upload, (5) bundle items, (6) seed + deploy + README
- Acceptance criteria must require deployed preview URL evidence
- Developer needs Supabase + Vercel credentials from user or documented placeholder setup
- Do not scope customer-facing pages in Phase 1

## Architect Review
ARCHITECT_REVIEW_STATUS: APPROVED

### Review Notes

**Review date:** 2026-07-14  
**Reviewer:** Yuri (Software Architect)  
**Artifacts reviewed:** `arch-phase1.md`, `manager-phase1.md` (MANAGER_REVIEW_STATUS: APPROVED), `dev-phase1.md` (STATUS: COMPLETE)

#### Architecture alignment — PASS

| Check | Verdict | Notes |
|---|---|---|
| Stack | Pass | Next.js App Router, TypeScript, Prisma, Supabase Auth/DB/Storage |
| Phase 1 ERD subset | Pass | Catalog + User; Order/Cart deferred |
| Admin-only scope | Pass | No customer catalog/cart/checkout/Resend |
| Constraints | Pass | No secrets committed; admin guard; `src/` / `prisma/` / `tests/` structure |
| Functional testability | Pass | Local admin login + catalog management verified; seed data present |
| Manager gate | Pass | Re-review APPROVED after migrate/seed/E2E evidence |

#### Residuals accepted for Phase 1 close

| Item | Disposition |
|---|---|
| M11 Vercel preview URL | Accepted with orchestrator waiver documented in `dev-phase1.md`; recommended before production but not blocking Phase 1 architectural completion |
| Live browser image-upload demo | Code path + Storage design acceptable; follow-up optional in ops |
| Admin UI Direction A early | Cosmetic; aligns with future Phase 2 design intent |

#### Verdict

Phase 1 architecture intent is met. Do **not** update `PHASE.md` until orchestrator receives explicit G3 user approval.

### Required Corrections

(none)

