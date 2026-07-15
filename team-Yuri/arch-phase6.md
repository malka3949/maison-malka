# Architecture Phase 6

## Phase Identifier
PHASE=6

## Status
STATUS: READY_FOR_MANAGER

## Phase Goal

Deliver a **Site Content CMS** so the business administrator can edit homepage marketing copy, site chrome texts, dedicated marketing images, and business contact settings from `/admin` after cloud deploy — without developer code changes or redeploy — while preserving Phases 1–3 domain behavior and Phase 5 Bakery Scroll storefront presentation. Phase 4 Production remains parked. Business Growth (payments/loyalty) is deferred to Phase 7.

## Source References

- `team-Yuri/plan.md` — Phase 6: Site Content CMS; Phase 7 Business Growth; Phase 4 PARKED
- `team-Yuri/arch-phase1.md` — admin auth, catalog CRUD, product image upload patterns
- `team-Yuri/arch-phase2.md` — storefront routes, i18n, messages
- `team-Yuri/arch-phase5.md` — Bakery Scroll presentation; prior “no CMS” security note superseded for this phase’s plain-text CMS
- `src/messages/he.ts`, `src/messages/en.ts` — current hardcoded marketing strings (fallback SoT)
- `src/app/[locale]/page.tsx` — homepage hero/promo image sourcing
- `src/app/api/admin/upload/route.ts`, `src/components/admin/ImageUploadSection.tsx` — product upload patterns to extend
- `prisma/schema.prisma` — extend with SiteMedia / SiteContentBlock / SiteSettings
- `DOCS/Maison-Malka-ERD.md` — update with new entities this phase
- `.cursor/rules/40-project-structure.md`, `.cursor/rules/50-git-workflow.md`, `.cursor/rules/20-testing.md`

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| Keyed content blocks (allowlist), not page builder | Owner needs editable marketing without unbounded layout risk | Fixed keys only; Manager groups forms by section |
| Plain text only (no HTML/rich-text) | Avoid XSS; align with Phase 5 security posture | Store strings; render as React text nodes |
| Separate `site-media` Storage bucket | Isolate marketing assets from `product-images` | New bucket; extend upload API to support both |
| Three Prisma entities: SiteMedia, SiteContentBlock, SiteSettings | Clear CRM of media vs copy vs business facts | Migration + ERD update required |
| Storefront DB read + messages fallback | Zero breakage if CMS empty / partial | Missing keys fall back to `getMessages(locale)` values |
| Dedicated CMS hero/promo images when set | Today hero borrows product/Unsplash | Prefer SiteMedia slot; keep current fallback chain if unset |
| Admin routes `/admin/site`, `/admin/media`, `/admin/settings` | Match mental model of content / library / business | Nav entries in protected admin layout |
| Reuse `requireAdmin` + server actions | Same trust boundary as catalog admin | No public write endpoints |
| V1 surfaces locked: home + chrome + settings | User goal without Phase 7 sprawl | No About page, no full UI-string CMS |
| Phase 4 stays parked | User deferred Production | Local functional proof closes Phase 6 |
| Growth remains Phase 7 | Plan amendment | Payments/loyalty out of this phase |
| Git branch `phase-6/site-content-cms` from `develop` | Workflow rule | Developer records branch in `dev-phase6.md` |

## Constraints / Non-Negotiables

- Do not break guest checkout → `Order` `pending_approval`
- Do not break Bakery Scroll visual contract (tokens/layout); CMS feeds content into existing composition
- Do not add online payment, coupons, loyalty, WhatsApp, or delivery-zone features
- Do not require Production / Resend live proof to close this phase
- Do not invent top-level folders
- Do not accept or render untrusted HTML from CMS fields
- Content keys must be allowlisted server-side (reject unknown keys)
- File upload: validate MIME/size; delete Storage object when deleting SiteMedia row
- Preserve HE (RTL default) + EN (LTR)
- TypeScript strict; `npm run lint` and `npm test` must PASS
- Functionally testable on local `npm run dev`

## Technical Boundaries / Out of Scope

- Freeform page builder / drag-and-drop section reordering
- New public pages (About, blog, landing builders)
- Editing cart / checkout / auth / error UI strings in admin (remain in `src/messages/*`)
- Changing order validation, pricing, or approval workflow
- Phase 4: Vercel Production URL, live Resend message ids, merge-to-`main` production cutover
- Phase 7+: payments, loyalty, multi-region delivery, WhatsApp
- Admin visual redesign beyond new CMS pages and nav
- Migrating historical Unsplash mock URLs as required production assets

## Dependencies and Interfaces

### Builds on
- Phase 1 admin shell: `requireAdmin`, product upload patterns
- Phase 2–5 storefront: homepage, header, footer, messages, Bakery Scroll chrome
- Supabase Auth + Storage + Prisma

### New / extended surfaces (indicative — Manager may refine)
- `prisma/schema.prisma` + migration: `SiteMedia`, `SiteContentBlock`, `SiteSettings`
- `DOCS/Maison-Malka-ERD.md` (and related docs if required by project docs rules)
- Admin: `src/app/admin/(protected)/site/`, `media/`, `settings/` + layout nav
- Server actions / libs for site content & settings CRUD
- Upload API extended for `site-media` (path + bucket selection; admin-only)
- Storefront loaders: resolve CMS overrides for homepage + announcement/footer + business settings display
- Seed or migration defaults optional; empty CMS + messages fallback is acceptable

### Allowlisted content keys (locked for V1)

**Text blocks (per locale `he` | `en` unless noted):**
- `announcement`
- `hero.eyebrow`, `hero.title`, `hero.subtitle`, `hero.cta_primary`, `hero.cta_secondary`
- `ticker` (may be stored as newline- or delimiter-separated items; Manager defines storage format)
- `promo.catalog.label`, `promo.catalog.title`, `promo.catalog.body`, `promo.catalog.cta`
- `promo.gift.label`, `promo.gift.title`, `promo.gift.body`, `promo.gift.cta`
- `trust.delivery`, `trust.delivery_sub`, `trust.pickup`, `trust.pickup_sub`, `trust.handmade`, `trust.handmade_sub`, `trust.approval`, `trust.approval_sub`
- `final_cta.title`, `final_cta.body`, `final_cta.button`
- `footer.tagline`, `footer.hours_note`

**Image slots (reference SiteMedia.id):**
- `hero.image`
- `promo.catalog.image`
- `promo.gift.image`

**SiteSettings keys (locale-agnostic or bilingual fields — Manager chooses shape within Architect intent):**
- `pickup_address`
- `phone`
- `business_hours`
- `lead_time_note`

### External services
- Supabase PostgreSQL (new tables)
- Supabase Storage bucket `site-media` (public read for storefront URLs; write via service role / admin upload path only)
- No new vendors

## Data / State Considerations

### SiteMedia
- `id`, `storage_path`, `alt_he`, `alt_en`, `created_at`, `updated_at`
- Optional soft metadata only; no product_id

### SiteContentBlock
- Unique on `(key, locale)` for text values
- Image slot keys may use a locale-neutral row or a single shared locale convention — Manager picks one consistent approach; Architect requires: one SiteMedia reference per slot, HE/EN alt on media
- Value is plain string (or null → fallback)

### SiteSettings
- Key/value store or single-row settings entity — Manager may choose either if functionally equivalent
- Values plain text; used by footer/checkout display where applicable without inventing new checkout validation rules

### Fallback behavior
- If block missing/empty → use corresponding string from `src/messages/{locale}.ts`
- If image slot unset → keep Phase 5 behavior (product image / existing placeholder chain)

### Cart / orders
- Unchanged; no CMS coupling to order state

## Security / Privacy Considerations

- All CMS writes behind `requireAdmin`
- Reject unknown content keys
- No HTML sanitization path needed if HTML is never accepted — validate no raw HTML render (`dangerouslySetInnerHTML` banned for CMS values)
- Storage: only admin-authenticated upload/delete; public URLs for read like product images
- Business phone/address are public storefront facts — not customer PII; do not log customer data into SiteSettings
- Do not expose service-role keys to client

## Testing and Lint Expectations

- `npm run lint` PASS
- `npm test` PASS (add unit tests for key allowlist validation, fallback merge helper, and/or settings parse — Manager specifies; Architect requires at least one focused test covering allowlist or fallback)
- Document commands + results in `dev-phase6.md`
- Manual functional pass (required evidence): admin edit hero HE text; upload/assign hero image; public `/he` reflects both; delete/replace media; settings appear where wired; `/en` override or fallback works; catalog/checkout smoke unchanged

## Functional Testability

- **Page/screen the user can open:** `/admin/site`, `/admin/media`, `/admin/settings`, and public `/he` (and `/en`) home
- **User-visible behavior:** Changing CMS hero title + hero image updates public homepage without redeploy; empty CMS still shows prior message defaults
- **Command-line flow:** `npm run dev`; `npm run lint`; `npm test`; Prisma migrate
- **API endpoint / request:** Admin upload for `site-media`; server actions for content/settings CRUD
- **Minimal end-to-end flow:** Admin login → edit site content → upload media → assign to hero → open storefront home → observe update
- **Expected observable result:** Owner can operate marketing content post-deploy without developer; order/catalog paths still work

This phase is **not** infrastructure-only.

## Handoff Notes for Manager

1. Sequence milestones for `phase-6/site-content-cms`: schema/migration + ERD → Storage bucket/`site-media` upload → media admin → site content forms (HE/EN) → settings → storefront readers/fallback → lint/test/manual evidence.
2. Map each allowlisted key to the current message field / homepage usage; do not invent extra keys in V1.
3. Prefer reuse of existing admin form and upload UX patterns over a new design system.
4. Acceptance = local E2E CMS edit visible on storefront; Production explicitly **not** required.
5. Phase 4 residual remains open; Phase 7 Growth remains out of scope.
6. Update docs (ERD at minimum) to match schema.

## Architect Review
ARCHITECT_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(Phase design complete. Awaiting Manager detailed design + Developer implementation + evidence before Architect REVIEW-PHASE.)

### Required Corrections

None at design time.
