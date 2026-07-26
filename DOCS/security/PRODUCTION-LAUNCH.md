# Production launch checklist — Maison Malka

Operational cutover for first public launch. **Code alone cannot finish this wave** — cloud accounts and real business details are required from the operator.

Last verified against codebase on `develop` (contact page + baseline CSP merged).

---

## 0. Current status (engineering)

| Area | Status |
|---|---|
| Storefront + admin + checkout | Ready |
| Contact page + in-site message form (Resend) | Ready |
| Order confirm access via HttpOnly cookie (`mm_order_access_*`) | Ready (`?t=` still accepted for deep links) |
| Security headers (incl. baseline CSP, HSTS, frame deny) | Ready in `next.config.ts` |
| Admin bootstrap hardened (first admin only via `ADMIN_EMAIL`) | Ready |
| Login/register + contact rate limits | Ready |
| Legal `draftNotice` emptied in code | Ready — counsel still owns final wording |
| Live Production URL / domain / Resend domain | **Operator** |
| Real CMS content (phone, address, products, media) | **Operator** — see `CONTENT-CHECKLIST.md` |

---

## 1. Prerequisites (operator)

Do these in order. Do not skip.

1. [ ] Decide Production branch (`develop` for first launch is fine; freeze it before go-live)
2. [ ] Create / use a **Supabase production** project (prefer separate from local/dev)
3. [ ] Create a **Vercel** project linked to this GitHub repo
4. [ ] Optional later: custom domain DNS → Vercel
5. [ ] Create a **Resend** account; for real delivery to customers you need a **verified sending domain**

---

## 2. Environment variables (Vercel → Production)

Names must match the app code and `.env.example` exactly:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase Postgres URI (Session / direct connection preferred for `prisma migrate deploy`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Production Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only; never expose to client |
| `ADMIN_EMAIL` | Yes | First admin bootstrap + new-order alerts |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical site origin, e.g. `https://your-domain.com` (no trailing slash) |
| `RESEND_API_KEY` | Yes for email | From Resend dashboard |
| `RESEND_FROM_EMAIL` | Yes for email | e.g. `Maison Malka <orders@your-domain.com>` on a verified domain |
| `RESEND_DEV_TO` | Dev only | **Must be unset / empty in Production** |
| `GEMINI_API_KEY` | Optional | Product name HE→EN assist |

Do **not** commit `.env.production` / `.env*.local`.

> Note: Prisma schema currently uses only `DATABASE_URL` (no `DIRECT_URL`). Use a connection string that allows migrations, or run migrate from a machine with a direct Supabase URI.

---

## 3. Database

```bash
# With production DATABASE_URL available securely (CI secret, local one-off, or Vercel env pull):
npx prisma migrate deploy
```

Confirm these migrations (and any later ones on the branch) are applied:

- `20260722020000_order_access_token`
- `20260722030000_consent_and_audit`

Then create the admin Auth user in Supabase (email = `ADMIN_EMAIL`) and log in once at `/admin/login` so the app user row syncs.

---

## 4. Supabase Auth / storage / privacy

- [ ] Enable **MFA (TOTP)** for admin users — Dashboard → Authentication → MFA
- [ ] Confirm email confirmation settings match expected UX
- [ ] Storage buckets `product-images` and `site-media`: public read for images; upload only via service role / admin API
- [ ] Optional: disable open Auth signup if you only want guest checkout + invite

---

## 5. Resend

- [ ] Domain verified (SPF / DKIM in Resend)
- [ ] `RESEND_FROM_EMAIL` uses that domain
- [ ] `RESEND_DEV_TO` removed from Vercel Production
- [ ] Test sends:
  - Order received (customer)
  - Admin new-order alert (`ADMIN_EMAIL`)
  - Contact form message (shop inbox = CMS `contact_email` or `ADMIN_EMAIL`)

Without a verified domain, Resend only delivers to the Resend account email — that is expected in local/dev, not for public launch.

---

## 6. Security headers / HTTPS

Already set globally in `next.config.ts`:

- `Content-Security-Policy` (baseline for Next + Supabase)
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`

- [ ] Confirm Vercel forces HTTPS for the custom domain

---

## 7. Smoke test (live Production)

1. Open `/he` and `/en` — home, catalog, product detail, **contact**
2. Add to cart → checkout with **test** PII → accept terms → submit
3. Confirmation page loads via **HttpOnly cookie** (no need for `?t=` in the URL). Opening the same order URL in a fresh browser/private window without cookie (and without `?t=`) must fail closed
4. Customer + admin emails arrive
5. Contact form: send a short message → shop inbox receives it
6. Admin: login → approve order → customer approval email
7. Admin: order detail → export PII JSON → (optional) anonymize only on a disposable test order
8. Upload one product image and one site media image; verify storefront URLs
9. Legal pages `/privacy`, `/terms`, `/cancellation` load in HE/EN

---

## 8. After go-live

- [ ] DB backup schedule in Supabase
- [ ] Keep `AccessAuditLog` rows ≥ 24 months (export/archive if needed)
- [ ] Counsel review of legal templates (wording ownership is legal, not engineering)
- [ ] Fill remaining items in `CONTENT-CHECKLIST.md`

---

## Known residuals (not blocking Wave 1 code)

- MFA enforcement is **Supabase dashboard** configuration, not app code
- Full counsel-approved legal copy
- Real CMS content and catalog (operator)
- Payment gateway / WhatsApp / loyalty — out of launch scope
