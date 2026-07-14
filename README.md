# Maison Malka

Premium pastry e-commerce — **Phase 4** prepares Production on Vercel (security reviews, ops runbooks, live Resend) on top of Phases 1–3.

## Prerequisites

- Node.js 20+
- npm
- [Supabase](https://supabase.com) project (PostgreSQL, Auth, Storage)
- [Vercel](https://vercel.com) account (Production + Preview)
- [Resend](https://resend.com) account (transactional email)

## Supabase setup

1. Create a new Supabase project (prefer a dedicated **Production** project for live traffic).
2. **Database:** copy the connection string (URI) into `DATABASE_URL`.
3. **Auth:** enable Email provider; create an admin user with the same email as `ADMIN_EMAIL`.
4. **Storage:** create a public bucket named `product-images`.

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase values, ADMIN_EMAIL, and Resend keys
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

- Storefront (Hebrew default): [http://localhost:3000/he](http://localhost:3000/he)
- English: [http://localhost:3000/en](http://localhost:3000/en)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Admin orders: [http://localhost:3000/admin/orders](http://localhost:3000/admin/orders)

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma → Supabase PostgreSQL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client/server Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only uploads (never expose to client) |
| `ADMIN_EMAIL` | Email that receives `admin` role on login |
| `RESEND_API_KEY` | Server-only Resend API key (transactional email) |
| `RESEND_FROM_EMAIL` | Verified sender address for Resend (e.g. `Maison Malka <onboarding@resend.dev>`) |

### Production env checklist (Vercel Production)

Set **all** of the above in the Vercel project → Settings → Environment Variables → **Production**. Do not commit real values. Preview should use separate keys when possible.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Seed sample catalog data |

## Operations (Phase 4)

### Backups (Supabase)

1. In Supabase Dashboard → **Project Settings → Database / Backups**, confirm daily backups (or PITR on paid plans).
2. Before any Production `prisma migrate deploy`, note the time and ensure a recent backup / snapshot is available.
3. **Restore outline:** Dashboard → Backups → restore to a point-in-time or download backup per Supabase docs → update `DATABASE_URL` only if restoring to a replacement instance → redeploy Vercel.
4. Owner: business / technical admin responsible for Maison Malka Production.

### Monitoring / triage

1. Open [Vercel Dashboard](https://vercel.com) → Project → **Logs** (Production) for 5xx and function errors.
2. Check Resend Dashboard → **Emails** for delivery failures after order spikes.
3. On incident: capture failing URL, timestamp, and last deploy; pause ads/traffic if needed; restore from backup only if data corruption confirmed.
4. First response contact: site administrator (`ADMIN_EMAIL`).

### Security reports

Audit outputs (Phase 4):

- `DOCS/security/SOFTWARE-SECURITY-FINDINGS.md`
- `DOCS/security/INFRA-SECURITY-FINDINGS.md`
- `DOCS/security/PRIVACY-COMPLIANCE-AMENDMENT13.md`

## Phase 3 admin order flow

1. Customer places guest order (Phase 2 checkout) → `pending_approval`.
2. Admin opens `/admin/orders` → filters / opens detail.
3. Approve or reject → status updated; Resend sends email when configured.
4. Calendar at `/admin/orders/calendar` groups orders by requested fulfillment date.

Configure Resend: add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.local` and Vercel Production (see [Resend](https://resend.com)).

## Phase 2 customer flow

1. Browse `/he` → catalog → product.
2. Add to cart (options supported).
3. Checkout as guest (pickup/delivery, date ≥ 2 days, no Saturday).
4. Order saved as `pending_approval`; customer receives email when Resend is configured.

Locale switcher: HE (RTL) ↔ EN (LTR). Optional customer register/login prefills checkout.

## Scope

**In scope (Phase 4):** Production deploy readiness, security/privacy reports, backup & monitoring docs, live Resend, MVP E2E on Production URL.

**Out of scope:** Payment gateway, WhatsApp/SMS, loyalty / growth features (Phase 5).

## Vercel deployment

1. Import repository `malka3949/maison-malka` in Vercel.
2. Preferred Production branch: `main` (promote from `develop` only with explicit approval).
3. Set all environment variables from `.env.example` for **Production** (and Preview as needed).
4. Deploy — Production URL should serve `/he` and `/admin/login`.
5. After migrate changes: `npx prisma migrate deploy` against Production `DATABASE_URL` (with backup note).

## Project structure

```text
src/app/[locale]/   # Customer storefront (he|en)
src/app/admin/       # Admin routes
src/components/storefront/
src/messages/        # UI copy HE/EN
src/lib/             # Prisma, catalog, orders, pricing, notifications
prisma/              # Schema, migrations, seed
tests/               # Unit tests
team-Yuri/           # Team Yuri phase artifacts
DOCS/                # Product specifications + security reports
DOCS/security/       # Phase 4 audit findings
```

## Team Yuri

Governed development workflow artifacts live in `team-Yuri/`. Current phase: see `team-Yuri/PHASE.md`.
