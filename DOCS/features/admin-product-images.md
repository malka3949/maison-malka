# Admin Product Images — Feature Spec

**Status:** Implemented in code (outside a dedicated Team Yuri phase bump)  
**Related planning:** [phases/07-admin-products.md](../phases/07-admin-products.md) (upload scope)  
**Does not change:** ERD entity shape (`ProductImage.storage_path`), checkout, catalog filtering, or Team Yuri `PHASE.md`

---

## Purpose

Admin can attach product photos for the storefront catalog and PDP, with optional browser-side background removal and background color choice before save. Storefront and admin display images via a same-origin proxy so filtered environments (e.g. NetFree) that block `*.supabase.co` still show photos.

---

## End-to-end flow

```text
1. Admin opens product edit → ImageUploadSection
2. Pick file (JPEG / PNG / WebP, max 15MB)
3. Browser runs @imgly/background-removal (ONNX) once → cutout PNG
4. Live preview: cutout on chosen background (solid / gradient / pattern / custom photo / HEX / transparent)
5. Save → compose final PNG (Canvas 2D, free) → POST /api/admin/upload
6. Server ensures bucket product-images, stores object, creates ProductImage row
7. Catalog / PDP / admin thumbs use /api/media/product-images/... (same-origin)
8. Proxy fetches Supabase Storage server-side and streams bytes to the browser
```

---

## User-visible behavior (admin)

| Step | Behavior |
|---|---|
| Pick image | No upload yet; UI says editing happens first |
| First AI cutout | May take ~30–60s (model download); later runs faster |
| Background | **Solids:** white, cream, beige, sand, stone, light gray, charcoal, black, transparent, custom HEX. **Gradients:** cream, warm, butter, soft studio, soft dusk, soft green, soft spotlight, studio halo. **Patterns/effects:** linen, dots, paper, mesh, light wood, soft marble, soft stripes, studio vignette. **Custom:** upload your own background photo (cover-fit). All free Canvas 2D / local files — no paid API |
| Free transform / polish | **Scale** 40–160%, **pan** X/Y, **padding**, **rotation** ±180° (+90° buttons), **flip X**, **studio shadow**, **brightness / contrast / saturation**, export canvas **800 / 1200 / 1600** square. Live preview uses the same Canvas path as save |
| Live preview | Instant Canvas composite of selected background + edit controls under the cutout |
| Save | Uploads composed PNG/JPEG with background + transforms baked in |
| Cancel | Clears editor; does not delete already-saved product images |

New products: create flow redirects to edit with upload available (`?created=1`).

**Background implementation:** `src/lib/admin-product-bg.ts` (presets + `paintBackground` + `paintProductComposite` + `composeCutoutOnBackground`).

**Not included:** AI-generated scene backgrounds (would need paid or blocked remote APIs).

---

## Related: homepage promo frames

Homepage hero + “catalog / gifts” squares use **fixed** paths in `src/lib/home-media.ts` (`/placeholders/...`), not the newest catalog product. Product upload no longer changes those frames.
---

## APIs

### `POST /api/admin/upload`

- Auth: admin only (`requireAdmin`)
- Form fields: `product_id`, `file`
- Ensures public bucket `product-images` if missing
- Validates MIME + size (`MAX_IMAGE_SIZE_MB` in `src/lib/utils.ts`)
- Writes Storage key `{productId}/{timestamp}-{safeName}`
- Persists `ProductImage` (`storage_path`, `sort_order`, `alt_text`)
- Response `public_url` is the **proxy** path, not a raw Supabase URL

### `GET /api/media/product-images/[...path]`

- Public read proxy for storefront and admin thumbnails
- Sanitizes path segments (no `..`)
- Fetches `{SUPABASE_URL}/storage/v1/object/public/product-images/{path}`
- Returns image bytes with cache headers
- Browser never needs direct access to `*.supabase.co` for display

---

## URL resolution

`getProductImagePublicUrl` / `getProductImageProxyUrl` in `src/lib/storefront.ts`:

| Stored / input | Browser URL |
|---|---|
| Storage object key with local cache | `/uploads/product-images/...` (preferred — NetFree-friendly static) |
| Storage object key without local file | `/api/media/product-images/...` (proxy + disk cache on first hit) |
| Full Supabase public URL for this bucket | Rewritten to local/proxy |
| Site path (e.g. `/placeholders/cake.jpg`) | Left as-is |
| Other absolute `http(s)` URLs | Left as-is |

Uploaded files are also written to `public/uploads/product-images/` (gitignored).  
Backfill: `npx tsx scripts/sync-product-images-local.ts`

**Why some images still look “blocked” under NetFree:** domain blocking of `supabase.co` is solved by same-origin URLs. Remaining cases are usually (1) NetFree **content** filter on a specific photo, or (2) server fetch of that Storage object returning a block page — the media route now rejects non-image upstream responses and prefers local files.

---

## Key files

| File | Role |
|---|---|
| `src/components/admin/ImageUploadSection.tsx` | Pick → AI cutout → live BG → save |
| `src/lib/admin-product-bg.ts` | Free solid/gradient/pattern backgrounds (Canvas) |
| `src/app/api/admin/upload/route.ts` | Authenticated upload + bucket ensure |
| `src/app/api/media/product-images/[...path]/route.ts` | Same-origin image proxy |
| `src/lib/storefront.ts` | Public URL → proxy mapping |
| `src/lib/utils.ts` | Allowed types + 15MB limit |
| `next.config.ts` | Webpack aliases for onnx / imgly browser build |

---

## Dependencies

| Package | Why |
|---|---|
| `@imgly/background-removal` | Free in-browser background removal |
| `onnxruntime-web` | Runtime for the cutout model |

First client use downloads model assets; if a filter blocks the CDN, cutout fails until assets are allowlisted or self-hosted (`publicPath` option not configured yet).

---

## Constraints and known limitations

- AI edit runs **in the browser** (no paid Gemini/OpenAI image-edit API).
- Cutout quality depends on product photo contrast against background.
- Proxy adds a hop through Next.js; suitable for catalog; heavy CDN offload can come later if needed.
- Server must still reach Supabase Storage (upload already required this).
- Historical Team Yuri Phase 1 artifacts describe “raw Supabase public URL” display; this doc is the current source of truth for display URL behavior.
- Does not implement Phase 6 `site-media` CMS uploads.

---

## Functional check

```text
→ Admin login → edit product → pick photo → wait for cutout
→ Change background presets / HEX → preview updates immediately
→ Save → thumbnail appears in admin gallery
→ Open /he/catalog (or PDP) → product image visible without opening supabase.co in the browser
→ DevTools Network: image request is /api/media/product-images/...
```

---

## Out of scope (still)

- Editing backgrounds of images already saved (re-upload required)
- Batch cutout for all catalog products
- Self-hosted IMG.LY model assets
- Customer-facing upload
