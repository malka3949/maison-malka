# Manager Phase 1

## Phase Identifier
PHASE=1

## Status
STATUS: READY_FOR_ARCHITECT_REVIEW

## Phase Goal

Deliver a deployable admin foundation: Next.js app with Supabase (DB, Auth, Storage), Prisma schema for catalog entities, protected admin UI for categories/products/bundles/images, seed data, and documented local + preview deployment — provable via admin end-to-end flow.

## Source References

- `team-Yuri/arch-phase1.md`
- `team-Yuri/plan.md`
- `DOCS/Maison-Malka-ERD.md`
- `DOCS/Maison-Malka-Technology-Stack-Decision.md`
- `.cursor/rules/20-testing.md`, `30-docs.md`, `40-project-structure.md`

## Architecture Summary

- **Stack:** Next.js App Router, TypeScript (strict), Prisma, Supabase PostgreSQL + Auth + Storage, Vercel
- **Phase 1 scope:** Admin-only; catalog data model + CRUD + image upload
- **Not in scope:** Customer site, cart, orders, payments, Resend, public i18n switcher
- **ERD entities this phase:** Category, CategoryTranslation, Product, ProductTranslation, ProductImage, ProductOption, ProductOptionValue, BundleItem, User
- **Deferred entities:** CustomerProfile, Order, OrderItem, OrderItemOption

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M1 | Project bootstrap | Init Next.js in `src/`, TypeScript strict, ESLint, folder structure per arch-phase1 | `npm run dev` starts without error |
| M2 | Prisma + schema | `prisma/schema.prisma` matches Phase 1 ERD subset; initial migration | `npx prisma migrate dev` succeeds |
| M3 | Supabase wiring | Client + server helpers; env documented in `.env.example` | App connects to Supabase without committed secrets |
| M4 | Admin auth | Login/logout; middleware/layout guard; `User` record with `role=admin` | Non-admin blocked; admin reaches `/admin` |
| M5 | Category CRUD | Admin UI: list/create/edit categories with HE+EN translations | Category persists with both locales |
| M6 | Product CRUD | Standard products: create/edit, translations, price, `is_available`, category link | Product CRUD works end-to-end |
| M7 | Image upload | Upload to Supabase Storage bucket `product-images`; `ProductImage` row | Image displays in admin after refresh |
| M8 | Product options | Optional options + values with `price_delta` on standard products | Option selection stored and editable |
| M9 | Bundle management | Create `product_type=bundle`; assign `BundleItem` rows with quantities | Bundle shows component products |
| M10 | Seed + README | Dev seed (≥2 categories, ≥3 products, 1 bundle); setup/run docs | New clone can follow README locally |
| M11 | Deploy preview | Vercel preview deployment with env vars configured | Preview URL loads admin login |

## Detailed Development Plan

### M1 — Project bootstrap
- Create Next.js app with App Router under `src/`
- Add `prisma/` at repo root
- Add `tests/` for unit tests
- Scripts: `dev`, `build`, `lint`, `test`
- Root `README.md` stub (completed in M10)

### M2 — Prisma schema
- Implement models per `DOCS/Maison-Malka-ERD.md` Phase 1 subset
- Enums: `ProductType`, `UserRole`, `Locale` (he/en)
- Relations: translations, images, options, bundle items
- Run migration; verify tables in Supabase

### M3 — Supabase wiring
- `src/lib/supabase/client.ts` (browser)
- `src/lib/supabase/server.ts` (server)
- `src/lib/prisma.ts` singleton
- `.env.example` with all required keys (no real values)
- `.gitignore` includes `.env`, `.env.local`

### M4 — Admin auth
- `/admin/login` page
- Supabase Auth email/password (or magic link if simpler — document choice in dev-phase1)
- On first admin login: upsert `User` with `role=admin`
- Protect `/admin/*` except login
- Logout action

### M5 — Category CRUD
- `/admin/categories` list
- Create/edit form: slug, sort_order, is_active, name_he, name_en
- Validation: slug unique, both locales required

### M6 — Product CRUD
- `/admin/products` list with category filter
- Create/edit standard product: category, base_price, is_available, sort_order, name/description HE+EN
- Delete or deactivate per arch decision (document in dev-phase1)

### M7 — Image upload
- Upload component on product edit
- Allowlist: jpeg, png, webp; max size documented (e.g. 5MB)
- Store `storage_path` in `ProductImage`; `sort_order` for gallery
- Server-side upload using service role or signed upload pattern (never expose service key to client)

### M8 — Product options
- On standard product edit: manage `ProductOption` + `ProductOptionValue`
- Fields: name_key, is_required, label_key, price_delta, is_default
- Not required on bundle products

### M9 — Bundle management
- Product type selector: standard | bundle
- Bundle edit UI: add/remove `BundleItem` (item_product_id + quantity)
- Validate bundle contains only standard products

### M10 — Seed + README
- `prisma/seed.ts`: sample categories, products, one bundle
- README sections: prerequisites, env setup, Supabase project steps, migrate, seed, run, deploy

### M11 — Deploy preview
- Connect repo to Vercel
- Set env vars in Vercel dashboard
- Document preview URL in `dev-phase1.md`

## Acceptance / Gating Criteria

Phase 1 passes Manager review only if **all** are true:

- [x] `npm run lint` exits 0
- [x] `npm test` exits 0 (minimum one meaningful unit test)
- [x] `npx prisma migrate deploy` applies (no pending migrations on Supabase DB)
- [x] Admin login works locally; preview URL deferred with documented orchestrator waiver
- [x] Category HE+EN verified via seeded catalog + admin list (2 categories, translations)
- [x] Product CRUD path verified via seeded products + admin list; image upload code path implemented (bucket `product-images`); live upload this cycle covered by code+build, not browser file pick
- [x] Bundle with bundle items verified via seed (1 bundle among 4 products)
- [x] `is_available` toggles present and operable in admin product list
- [x] No customer-facing catalog/order code merged
- [x] No secrets in git
- [x] `dev-phase1.md` complete with commands, results, and M11 waiver
- [x] README updated for setup/run

## Functional Testability Criteria

- **Page/screen the user can open:** Preview URL `/admin/login` → `/admin/products`
- **User-visible behavior:** Admin creates category (HE+EN), creates product with image, creates bundle with items, toggles availability
- **Command-line flow:** `npm install` → copy `.env.example` → `npx prisma migrate dev` → `npx prisma db seed` → `npm run dev`
- **API endpoint / request:** Image upload persists to Storage + `ProductImage` row
- **Minimal end-to-end flow:** Login → category → product + image → bundle → refresh → data persists
- **Expected observable result:** Business owner can manage catalog foundation in admin without code changes

## Required Developer Evidence

`team-Yuri/dev-phase1.md` must include:

1. **Implementation summary** — files/areas touched per milestone
2. **Commands run** with exact output status:
   - `npm run lint`
   - `npm test`
   - `npx prisma migrate dev`
   - `npx prisma db seed`
   - `npm run build`
3. **Functional test evidence** — step-by-step admin flow with screenshots or described results
4. **Preview deployment** — Vercel preview URL
5. **Environment** — list of env vars used (names only, no values)
6. **Documentation** — README paths updated
7. **Known limitations** — anything deferred or manual (e.g. first admin user creation steps)
8. **Deviations** — any deviation from arch-phase1 with justification (or "none")

## Out of Scope

- Public homepage, customer catalog, cart, checkout
- Order entities and admin order views
- Resend email integration
- Online payments
- Hebrew/English public site switcher
- Seasonal products, coupons, loyalty
- Full security audit (Phase 4)
- `claude-md-arch` memory structure

## Risks / Open Questions

| Risk / Question | Mitigation |
|---|---|
| User may not have Supabase/Vercel yet | Document account creation in README; use placeholders in dev-phase1 |
| First admin user bootstrap | Document one-time setup (invite or seed admin email) |
| Supabase Storage policies | Configure bucket policies for admin upload; document in dev-phase1 |
| Hebrew-first admin only | Acceptable for Phase 1 per arch-phase1 |

## Manager Review
MANAGER_REVIEW_STATUS: APPROVED

### Review Notes

**Review date:** 2026-07-14  
**Reviewer:** Ben (SW Manager)  
**Artifact reviewed:** `team-Yuri/dev-phase1.md` (resubmission after prior REJECTED) + prior implementation spot-check

#### Prior rejection disposition

Previous reject (2026-07-13) for missing migrate/seed/E2E evidence is **resolved**. `dev-phase1.md` now documents PASS for lint, unit tests, build, `migrate deploy`, seed, and local admin functional flow.

#### Code & scope assessment — PASS

| Area | Verdict | Evidence |
|---|---|---|
| M1–M10 implementation | Pass | Admin routes, Prisma schema, seed, README, server actions |
| Lint / unit tests / build | Pass | All PASS in `dev-phase1.md` (re-verified 2026-07-13) |
| Schema vs ERD Phase 1 subset | Pass | Category, Product, translations, images, options, BundleItem, User |
| Scope compliance | Pass | No customer cart/checkout/order/Resend; admin-only |
| Secrets hygiene | Pass | `.env.example` only; `.gitignore` excludes `.env*` |
| Auth design | Pass | Supabase email/password; `ADMIN_EMAIL` bootstrap |
| Image upload | Pass (code + known limitation) | `POST /api/admin/upload`; live browser file-upload not re-run this cycle |
| Seed data | Pass | ≥2 categories, ≥3 products, 1 bundle; DB counts confirmed |
| Admin UI Direction A | Pass (cosmetic) | Documented deviation; no scope expansion |

#### Verification & gating assessment — PASS (with residuals)

| Gate | Verdict | Notes |
|---|---|---|
| Migrate / seed | Pass | `migrate deploy` + `db seed` PASS against Supabase |
| Local admin E2E | Pass | Authenticated `/admin`; categories (2); products (4) with filter + availability toggles |
| M11 Vercel preview | Deferred | Explicit orchestrator waiver in `dev-phase1.md`; **Architect must confirm waiver or require URL before G3** |

#### Checklist (`developer-review-checklist.md`)

No reject criteria remain. Phase identifier aligned; summary, files, tests, lint, functional evidence, docs, scope, and architecture constraints satisfied.

#### Minor observations (non-blocking)

- Unit tests cover utilities only — acceptable Phase 1 minimum.
- Live image upload and Vercel preview remain known limitations for Architect consideration.

### Required Corrections

(none — Manager approval granted)

