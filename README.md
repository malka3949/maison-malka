# Maison Malka

Premium pastry e-commerce — **Phase 3** adds admin order operations (list, calendar, approve/reject) and Resend transactional emails on top of the Phase 2 storefront.

## Prerequisites

- Node.js 20+
- npm
- [Supabase](https://supabase.com) project (PostgreSQL, Auth, Storage)
- [Vercel](https://vercel.com) account (optional preview)

## Supabase setup

1. Create a new Supabase project.
2. **Database:** copy the connection string (URI) into `DATABASE_URL`.
3. **Auth:** enable Email provider; create an admin user with the same email as `ADMIN_EMAIL`.
4. **Storage:** create public buckets `product-images` and `site-media` (app can also create them on first admin upload). Product images: `/api/media/product-images/...`. Site CMS images: `/uploads/site-media/...` (fallback proxy `/api/media/site-media/...`). Product image admin flow: [DOCS/features/admin-product-images.md](DOCS/features/admin-product-images.md).

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase values and ADMIN_EMAIL
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

- Storefront (Hebrew default): [http://localhost:3000/he](http://localhost:3000/he)
- English: [http://localhost:3000/en](http://localhost:3000/en)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Admin orders: [http://localhost:3000/admin/orders](http://localhost:3000/admin/orders)
- Site CMS: [http://localhost:3000/admin/site](http://localhost:3000/admin/site) · [media](http://localhost:3000/admin/media) · [settings](http://localhost:3000/admin/settings)
- Legal (HE): [privacy](http://localhost:3000/he/privacy) · [terms](http://localhost:3000/he/terms) · [cancellation](http://localhost:3000/he/cancellation)

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma → Supabase PostgreSQL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client/server Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only uploads (never expose to client) |
| `ADMIN_EMAIL` | Admin login role + **new-order email alerts** (with Resend) |
| `NEXT_PUBLIC_APP_URL` | Site origin for links in emails (e.g. `http://localhost:3000`) |
| `RESEND_API_KEY` | Server-only Resend API key (transactional email) |
| `RESEND_FROM_EMAIL` | Verified sender address for Resend (e.g. `Maison Malka <onboarding@resend.dev>`) |
| `RESEND_DEV_TO` | Optional: redirect **all** emails to this inbox (for free tier / no domain). Shows original recipient in subject. Remove when domain is verified. |
| `GEMINI_API_KEY` | Optional, server-only. Free Google AI Studio key for product name HE→EN when the local bakery dictionary misses. Leave empty for dictionary-only. |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Seed sample catalog data |

## Phase 3 admin order flow

1. Customer places guest order (Phase 2 checkout) → `pending_approval`.
2. When Resend is configured: customer gets “order received” email; **`ADMIN_EMAIL` gets a new-order alert**.
3. Admin opens `/admin/orders` → filters / opens detail.
4. Approve or reject → status updated; Resend sends email when configured.
5. Calendar at `/admin/orders/calendar` groups orders by requested fulfillment date.

Configure Resend: add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.local` (see [Resend](https://resend.com)).

## Phase 2 customer flow

1. Browse `/he` → catalog → product.
2. Add to cart (options supported).
3. Checkout as guest (pickup/delivery, date ≥ 2 days, no Saturday).
4. Order saved as `pending_approval`; customer + admin (`ADMIN_EMAIL`) receive emails when Resend is configured.
5. Checkout requires terms consent; delivery requires Jerusalem-area affirmation. Bank transfer stays available — payment instructions come from admin **settings** (`bank_transfer_details`) in the approved-order email.

Locale switcher: HE (RTL) ↔ EN (LTR). Optional customer register/login prefills checkout.

## Trust & Legal (pre-launch)

- Public legal pages under `/[locale]/privacy|terms|cancellation` (draft copy — replace before public launch).
- Footer always shows phone / pickup address / hours (CMS settings or message fallbacks).
- Admin settings: save multiline `bank_transfer_details` for approved bank-transfer orders.

## Scope

**In scope:** Admin order list/calendar/detail, approve/reject workflow, Resend transactional emails (received/approved/rejected + admin new-order alert).

**Out of scope:** Payment gateway, WhatsApp/SMS, production hardening (Phase 4).

## Vercel deployment

1. Import this repository in Vercel.
2. Set all environment variables from `.env.example`.
3. Deploy — preview should serve `/he` and `/admin/login`.

## Project structure

```text
src/app/[locale]/   # Customer storefront (he|en)
src/app/admin/       # Admin routes
src/components/storefront/
src/messages/        # UI copy HE/EN
src/lib/             # Prisma, catalog, orders, pricing
prisma/              # Schema, migrations, seed
tests/               # Unit tests
team-Yuri/           # Team Yuri phase artifacts
DOCS/                # Product specifications
```

## Team Yuri

Governed development workflow artifacts live in `team-Yuri/`. Current phase: see `team-Yuri/PHASE.md`.
