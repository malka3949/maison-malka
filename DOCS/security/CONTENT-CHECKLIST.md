# Content checklist — Maison Malka (pre-launch)

Fill real business content in Admin before opening to the public. Engineering fixes bugs that appear during fill-in; you own the copy and media.

## Settings (`/admin/settings` or site CMS settings)

- [ ] Phone number (public) — shown on **Contact** page
- [ ] Contact email (`contact_email`) — shown on Contact page; receives contact-form messages (fallback: `ADMIN_EMAIL`)
- [ ] Pickup address
- [ ] Business hours
- [ ] Lead-time note (if used on home)
- [ ] Bank transfer details (`bank_transfer_details`) — account name, bank, branch, account / IBAN as you use them

## Media (`/admin/media`)

- [ ] Hero / home images (real photos, correct HE+EN alt text)
- [ ] Any secondary marketing images used by CMS slots
- [ ] No placeholder stock left visible on `/he` and `/en`

## Catalog

- [ ] Categories with Hebrew (+ English) names
- [ ] Products: price, availability, options, descriptions HE/EN
- [ ] Product photos (background-removed if desired) on every sellable item
- [ ] Hide or delete draft / test products before launch
- [ ] Bundles (if used) contain only live products

## Trust surfaces

- [ ] Home trust strip still accurate (delivery area, pickup, handmade, manual approval)
- [ ] Checkout privacy notice + legal links work
- [ ] Footer has **Contact** link → `/[locale]/contact` with matching Settings values
- [ ] Contact form sends to the correct inbox
- [ ] Legal pages reviewed with counsel

## Spot-check after content fill

1. Home first viewport: brand dominant, no empty image slots
2. Catalog cards show real images and prices
3. Contact page shows phone / email / address / hours (no draft sample data)
4. Checkout bank-transfer path shows your real transfer instructions after settings save
5. Confirmation email content looks correct in HE and EN

## Out of launch scope (do not block on these)

- Credit-card payments / registered business checkout
- WhatsApp, coupons, loyalty, extra delivery zones
- Admin UI redesign
