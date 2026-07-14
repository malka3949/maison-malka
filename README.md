# Maison Malka

Premium pastry e-commerce — **Phase 2** delivers the customer storefront (catalog, cart, guest checkout) on top of the Phase 1 admin foundation.

## Prerequisites

- Node.js 20+
- npm
- [Supabase](https://supabase.com) project (PostgreSQL, Auth, Storage)
- [Vercel](https://vercel.com) account (optional preview)

## Supabase setup

1. Create a new Supabase project.
2. **Database:** copy the connection string (URI) into `DATABASE_URL`.
3. **Auth:** enable Email provider; create an admin user with the same email as `ADMIN_EMAIL`.
4. **Storage:** create a public bucket named `product-images`.

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

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma → Supabase PostgreSQL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client/server Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only uploads (never expose to client) |
| `ADMIN_EMAIL` | Email that receives `admin` role on login |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Seed sample catalog data |

## Phase 2 customer flow

1. Browse `/he` → catalog → product.
2. Add to cart (options supported).
3. Checkout as guest (pickup/delivery, date ≥ 2 days, no Saturday).
4. Order saved as `pending_approval` (no online payment; no email yet).

Locale switcher: HE (RTL) ↔ EN (LTR). Optional customer register/login prefills checkout.

## Scope

**In scope:** Public storefront Direction A, i18n HE/EN, cart, guest checkout → Order persistence, optional customer auth.

**Out of scope:** Payment gateway, Resend emails, admin order approval UI (Phase 3).

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
