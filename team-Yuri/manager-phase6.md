# Manager Phase 6

## Phase Identifier
PHASE=6

## Status
STATUS: READY_FOR_DEVELOPER

## Phase Goal

Deliver a Site Content CMS so the admin can edit homepage marketing copy (HE/EN), chrome texts, dedicated site images, and business contact settings from `/admin` — visible on the public storefront without redeploy — while preserving Phases 1–3 domain behavior and Phase 5 Bakery Scroll presentation. Phase 4 Production remains PARKED. Phase 7 Growth stays out of scope.

## Source References

- `team-Yuri/arch-phase6.md` (STATUS: READY_FOR_MANAGER)
- `team-Yuri/plan.md` — Phase 6 Site Content CMS; Phase 4 PARKED; Growth → Phase 7
- `team-Yuri/arch-phase1.md` — `requireAdmin`, product upload patterns
- `team-Yuri/arch-phase2.md` — storefront i18n / messages
- `team-Yuri/arch-phase5.md` — Bakery Scroll presentation contract
- `src/messages/he.ts`, `src/messages/en.ts` — fallback SoT
- `src/app/[locale]/page.tsx`, `StorefrontHeader.tsx`, `StorefrontFooter.tsx`, `src/lib/home-media.ts`
- `src/app/api/admin/upload/route.ts`, `src/components/admin/ImageUploadSection.tsx`
- `src/app/api/media/product-images/` — NetFree-safe media proxy pattern to mirror for `site-media`
- `prisma/schema.prisma`, `DOCS/Maison-Malka-ERD.md`
- `.cursor/rules/20-testing.md`, `30-docs.md`, `40-project-structure.md`, `50-git-workflow.md`

## Architecture Summary

- **Type:** CMS data layer + admin UI + storefront readers with messages fallback
- **Entities:** `SiteMedia`, `SiteContentBlock` (keyed plain text / image refs), `SiteSettings` (key/value)
- **Storage:** Supabase bucket `site-media` (separate from `product-images`); public read; admin write only
- **Admin routes:** `/admin/site`, `/admin/media`, `/admin/settings` + nav links
- **Storefront:** merge CMS overrides onto `getMessages(locale)` + image slots over `HOME_MEDIA` / current fallbacks
- **Security:** `requireAdmin` on all writes; allowlisted keys only; no HTML / no `dangerouslySetInnerHTML` for CMS values
- **Git:** Branch `phase-6/site-content-cms` from `develop`
- **Acceptance:** Local E2E — Production / live Resend **not** required

### Manager shape choices (within Architect intent)

| Topic | Choice |
|---|---|
| Text blocks | `SiteContentBlock` unique `(key, locale)` where `locale` ∈ `{he, en}`; `value` plain string |
| Ticker | Single key `ticker` per locale; store items as **newline-separated** plain text; parse → `string[]` for `Ticker` |
| Image slots | Keys `hero.image`, `promo.catalog.image`, `promo.gift.image` stored as `SiteContentBlock` with **shared locale `he` only**; `value` = `SiteMedia.id`; alts live on `SiteMedia.alt_he` / `alt_en` |
| SiteSettings | Key/value table, unique `key`; keys: `pickup_address`, `phone`, `business_hours`, `lead_time_note` |
| Empty CMS | Missing/blank → messages / `HOME_MEDIA` fallbacks unchanged |
| Upload UX | Extend existing admin upload patterns; bucket param / path for `site-media`; optional local cache + `/api/media/site-media/...` like product images (NetFree) |

### Allowlisted key → messages field map (V1 — do not invent extras)

| CMS key | Messages field (approx) | Surface |
|---|---|---|
| `announcement` | `announcement` | Header announce bar |
| `hero.eyebrow` | `heroEyebrow` | Home hero |
| `hero.title` | `heroTitle` | Home hero |
| `hero.subtitle` | `heroSubtitle` | Home hero |
| `hero.cta_primary` | `heroCta` | Home hero |
| `hero.cta_secondary` | `heroSecondaryCta` | Home hero |
| `ticker` | `tickerItems` (joined/split newlines) | Home ticker |
| `promo.catalog.label` | `promoCatalogLabel` | Home promo frame |
| `promo.catalog.title` | `promoCatalogTitle` | Home promo frame |
| `promo.catalog.body` | `promoCatalogBody` | Home promo frame |
| `promo.catalog.cta` | `promoCatalogCta` | Home promo frame |
| `promo.gift.label` | `promoGiftLabel` | Home promo frame |
| `promo.gift.title` | `promoGiftTitle` | Home promo frame |
| `promo.gift.body` | `promoGiftBody` | Home promo frame |
| `promo.gift.cta` | `promoGiftCta` | Home promo frame |
| `trust.delivery` | `trustDelivery` | Home trust strip |
| `trust.delivery_sub` | `trustDeliverySub` | Home trust strip |
| `trust.pickup` | `trustPickup` | Home trust strip |
| `trust.pickup_sub` | `trustPickupSub` | Home trust strip |
| `trust.handmade` | `trustHandmade` | Home trust strip |
| `trust.handmade_sub` | `trustHandmadeSub` | Home trust strip |
| `trust.approval` | `trustApproval` | Home trust strip |
| `trust.approval_sub` | `trustApprovalSub` | Home trust strip |
| `final_cta.title` | `ctaFinalTitle` | Home final CTA |
| `final_cta.body` | `ctaFinalBody` | Home final CTA |
| `final_cta.button` | `ctaFinalButton` | Home final CTA |
| `footer.tagline` | `footerNote` (and/or `brandTagline` if footer uses it — wire to current footer copy) | Footer |
| `footer.hours_note` | `hoursLabel` | Footer / contact area |
| `hero.image` | — (→ `HOME_MEDIA.hero`) | Home hero media |
| `promo.catalog.image` | — (→ `HOME_MEDIA.promoCatalog`) | Home promo |
| `promo.gift.image` | — (→ `HOME_MEDIA.promoGift`) | Home promo |

**SiteSettings → display (no new checkout validation rules):**

| Settings key | Wire into |
|---|---|
| `pickup_address` | Footer and/or checkout helper text if a suitable existing surface exists; else footer contact block only |
| `phone` | Footer contact |
| `business_hours` | Footer / hours note area |
| `lead_time_note` | Marketing/footer note and/or checkout display copy if already showing lead-time messaging — **do not change** lead-time validation logic |

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M0 | Git branch | Create `phase-6/site-content-cms` from `develop` | Branch checked out; name in `dev-phase6.md` |
| M1 | Schema + ERD | Prisma models + migration; update `DOCS/Maison-Malka-ERD.md` | Migrate applies; ERD documents three entities |
| M2 | Allowlist + libs | Shared allowlist constants + upsert/read helpers + fallback merge | Unit tests cover allowlist reject + fallback merge |
| M3 | Storage + upload | `site-media` bucket; extend admin upload (+ optional local/`/api/media` mirror) | Admin can upload file; Storage path persisted on `SiteMedia` |
| M4 | Media admin | `/admin/media` list/upload/edit alts/delete (+ Storage delete) | CRUD works; deleting row removes Storage object |
| M5 | Site content admin | `/admin/site` HE/EN forms for text keys + image slot assign | Save persists; unknown keys rejected |
| M6 | Settings admin | `/admin/settings` for four settings keys | Save/load works |
| M7 | Admin nav | Links to site / media / settings in protected layout | Nav visible when logged in as admin |
| M8 | Storefront readers | Homepage + announce/footer (+ settings display) merge CMS over messages/`HOME_MEDIA` | Empty CMS = prior look; filled CMS overrides |
| M9 | Gates + evidence | Lint, tests, local E2E, `dev-phase6.md` | Commands PASS; Phase 4 residual noted |

## Detailed Development Plan

### M0 — Git branch
- From current `develop`: `git checkout -b phase-6/site-content-cms`
- Do not implement on `main` or directly on `develop`
- Record branch in `dev-phase6.md`

### M1 — Schema + ERD
Add Prisma models (names/fields per Architect; timestamps as existing conventions):

**SiteMedia**
- `id` (cuid), `storage_path`, `alt_he`, `alt_en`, `created_at`, `updated_at`

**SiteContentBlock**
- `id`, `key`, `locale` (`Locale` enum), `value` (String, nullable or empty = fallback)
- `@@unique([key, locale])`

**SiteSettings**
- `id`, `key` `@unique`, `value` String, timestamps

- Migration via Prisma; update `DOCS/Maison-Malka-ERD.md`
- Seed optional — empty CMS + fallback is acceptable

### M2 — Allowlist + libs
- Central module e.g. `src/lib/site-content.ts` (or split) exporting:
  - `SITE_TEXT_KEYS`, `SITE_IMAGE_SLOT_KEYS`, `SITE_SETTINGS_KEYS`
  - `assertAllowedTextKey` / image / settings (throw or Result)
  - `mergeMessagesWithCms(messages, blocksByKey)` / ticker split-join helpers
  - Image slot resolver: CMS SiteMedia URL → else `HOME_MEDIA`
- **Required unit tests:** allowlist rejection of unknown key; fallback when block missing/empty; ticker newline split

### M3 — Storage + upload
- Ensure bucket `site-media` (create-if-missing pattern like product upload)
- Extend `POST /api/admin/upload` (or dedicated route) to accept target bucket/`site` vs `product` — **admin-only**
- Persist `SiteMedia` row; MIME/size validation reuse existing helpers
- Prefer NetFree-safe public URLs: local `public/uploads/site-media/...` and/or `/api/media/site-media/[...path]` mirroring product-images (document choice in `dev-phase6.md`)

### M4 — `/admin/media`
- List SiteMedia; upload; edit `alt_he` / `alt_en`; delete
- On delete: remove Storage object (and local cache file if used) then DB row
- Reuse existing admin form/upload UX patterns — no admin visual redesign

### M5 — `/admin/site`
- Grouped forms (Manager UI grouping only): Announcement; Hero; Ticker; Promo catalog; Promo gift; Trust; Final CTA; Footer texts; Image slots
- Tabs or sections for **HE** and **EN** text fields
- Image slots: select existing SiteMedia (or upload-then-assign) for the three slots
- Server actions: upsert only allowlisted keys; strip/reject HTML attempts as plain text storage only (store as typed; render as text nodes)

### M6 — `/admin/settings`
- Form for `pickup_address`, `phone`, `business_hours`, `lead_time_note`
- Server actions behind `requireAdmin`

### M7 — Admin nav
- Extend `src/app/admin/(protected)/layout.tsx` `navItems` with Site / Media / Settings (Hebrew labels OK)

### M8 — Storefront wiring
- Load CMS once per request (or small lib) for locale
- Apply overrides on home page marketing strings + ticker
- Hero/promo images: CMS slot → else current `HOME_MEDIA` / Phase 5 chain
- Announcement bar + footer: CMS text + settings where mapped
- **Forbidden:** changing checkout validation, pricing, order status flow, cart domain
- HE RTL + EN LTR preserved

### M9 — Verification + `dev-phase6.md`
- `npm run lint` PASS
- `npm test` PASS (include new CMS unit tests)
- Build: `npx next build` if Windows Prisma EPERM on full `npm run build` — document
- Manual E2E table (required):
  1. Admin login → `/admin/site` change HE `hero.title` → `/he` shows new title
  2. Upload + assign `hero.image` → `/he` shows new hero image
  3. Clear/empty key → fallback to messages
  4. EN override or EN fallback works on `/en`
  5. Delete/replace media
  6. Settings visible on wired surface
  7. Catalog + guest checkout smoke still OK
- Note Phase 4 Production/Resend still PARKED

## Acceptance / Gating Criteria

- [ ] Branch `phase-6/site-content-cms` used and named in `dev-phase6.md`
- [ ] Prisma models + migration for SiteMedia / SiteContentBlock / SiteSettings
- [ ] ERD updated
- [ ] Allowlisted keys only; unknown keys rejected server-side
- [ ] Plain text only; no CMS HTML render path
- [ ] `/admin/media`, `/admin/site`, `/admin/settings` work behind `requireAdmin`
- [ ] `site-media` upload/delete works; Storage cleaned on delete
- [ ] Storefront HE/EN: CMS override + messages/`HOME_MEDIA` fallback
- [ ] Hero + promo image slots override when set
- [ ] Catalog/order domain paths unchanged (smoke)
- [ ] `npm run lint` PASS; `npm test` PASS with required CMS unit tests
- [ ] Functional evidence in `dev-phase6.md`
- [ ] No claim that Production URL or live Resend is required
- [ ] Phase 4 residual explicitly still open

## Functional Testability Criteria

- **Page/screen:** `/admin/site`, `/admin/media`, `/admin/settings`; public `/he` and `/en` home
- **User-visible behavior:** Edit hero text + image → public home updates without redeploy; empty CMS keeps prior defaults
- **Command-line:** `npm run dev`, `npm run lint`, `npm test`, Prisma migrate
- **API / actions:** Admin upload `site-media`; server actions for content/settings CRUD
- **Minimal E2E:** Admin login → edit site → upload/assign hero → open `/he` → observe update
- **Expected result:** Owner can operate marketing content locally; catalog/checkout still work

## Required Developer Evidence

`team-Yuri/dev-phase6.md` must include:

1. Phase identifier `PHASE=6` and branch name
2. Implementation summary
3. Milestone table M0–M9 with Yes/No
4. Files changed (paths + short reason)
5. Dependencies (if any — justify within CMS scope)
6. Unit tests: command + PASS/FAIL (allowlist / fallback / ticker)
7. Lint: command + PASS/FAIL
8. Build: command + result (or documented Windows workaround)
9. Functional testability: steps, expected, actual (local URLs)
10. Known issues (include Phase 4 PARKED)
11. Scope compliance checklist vs `arch-phase6.md`
12. Declaration `READY_FOR_MANAGER_REVIEW` or `BLOCKED` with reason

## Out of Scope

- Freeform page builder / drag-and-drop layouts
- New public pages (About, blog, etc.)
- Editing cart / checkout / auth / error UI strings in admin
- Changing order validation, pricing, or approval workflow
- Online payments, loyalty, coupons, WhatsApp, delivery zones (Phase 7)
- Completing Phase 4 Production / live Resend / merge-to-`main` cutover
- Admin visual redesign beyond new CMS pages and nav
- Inventing CMS keys beyond Architect allowlist

## Risks / Open Questions

| Risk | Mitigation |
|---|---|
| Scope creep into full i18n CMS | Stick to allowlist map only |
| HTML XSS | Plain text storage + React text nodes; ban `dangerouslySetInnerHTML` for CMS |
| Orphan Storage files | Delete Storage (and local cache) with SiteMedia row |
| Image slot locale confusion | Shared `he` row for image keys only — document in code comments |
| NetFree blocks Supabase URLs | Prefer same-origin uploads/proxy like product images |
| Settings unused if nowhere to show | Wire at least footer; do not invent checkout rule changes |
| Phase 4 confusion | Always note Production still open in `dev-phase6.md` |
| Windows Prisma EPERM on build | `npx next build` / document |

## Manager Review
MANAGER_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(Awaiting Developer implementation + `dev-phase6.md`.)

### Required Corrections

None at planning time.
