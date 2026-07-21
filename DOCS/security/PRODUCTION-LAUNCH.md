# Production launch checklist — Maison Malka

Operational cutover for first public launch. **Code alone cannot finish this wave** — cloud accounts and real business details are required from the operator.

## Prerequisites (operator)

- [ ] Vercel project linked to this repo (`develop` or `main` as agreed)
- [ ] Custom domain DNS pointed at Vercel
- [ ] Supabase **production** project (separate from local/dev if possible)
- [ ] Resend account with a **verified sending domain**
- [ ] Decision: which branch deploys to Production

## Environment variables (Vercel Production)

Set at least (see `.env.example` for names):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string (pooled OK for app) |
| `DIRECT_URL` | Direct URL if Prisma migrate needs it |
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; never expose to client |
| `ADMIN_EMAIL` | Bootstrap admin email (role still DB-managed after first sync) |
| `RESEND_API_KEY` | Production key |
| `RESEND_FROM` | Address on verified domain |
| `GEMINI_API_KEY` | Optional; product translate only |
| `NEXT_PUBLIC_SITE_URL` | Canonical `https://…` |

Do **not** commit `.env.production` / `.env*.local`.

## Database

```bash
# From a machine with production DATABASE_URL configured securely:
npx prisma migrate deploy
```

Confirm migrations applied:

- `20260722020000_order_access_token`
- `20260722030000_consent_and_audit`

## Supabase Auth / privacy controls

- [ ] Enable **MFA (TOTP)** for admin users (Amendment 13 / medium security) — Dashboard → Authentication → MFA
- [ ] Disable open signup if only guest checkout + invite is desired (optional)
- [ ] Confirm email confirmation settings match expected UX
- [ ] Storage buckets `product-images` and `site-media`: public read for images; upload only via service role / admin API

## Resend

- [ ] Domain verified (SPF/DKIM)
- [ ] Send a test “order received” and “admin new order” email
- [ ] Remove or unset `RESEND_DEV_TO` in Production

## Security headers / app

Already in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.

- [ ] Confirm Vercel forces HTTPS for the custom domain

## Smoke test (live Production)

1. Open `/he` and `/en` — home, catalog, product detail
2. Add to cart → checkout with **test** PII → accept terms → submit
3. Confirm redirect includes `?t=` access token; page loads without token should fail closed
4. Receive customer + admin emails
5. Admin: login → approve → customer approval email
6. Admin: order detail → export PII JSON → (optional) anonymize on a disposable test order
7. Upload one product image and one site media image; verify storefront URLs
8. HE/EN legal pages (`/privacy`, `/terms`, `/cancellation`) show draft notice until counsel clears it

## After go-live

- [ ] DB backup schedule in Supabase
- [ ] Keep `AccessAuditLog` rows ≥ 24 months (export/archive if needed)
- [ ] Counsel review of legal templates → then remove `draftNotice` only with explicit approval
- [ ] Push stabilized `develop` and open Production deploy

## Known residuals (not blocking code Wave 1)

- MFA enforcement is **Supabase dashboard** configuration, not app code
- Full counsel-approved legal copy
- Real CMS content (see `CONTENT-CHECKLIST.md`)
