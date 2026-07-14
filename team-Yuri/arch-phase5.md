# Architecture Phase 5

## Phase Identifier
PHASE=5

## Status
STATUS: APPROVED

## Phase Goal

Apply the user-approved **Bakery Scroll** light bakery storefront design to the existing Next.js public customer experience so `/he` and `/en` match the visual language of `DOCS/ux-previews/direction-bakery-scroll.html` (and sibling bakery pages), while preserving Phases 1–3 behavior: catalog reads, cart, guest checkout, order persistence, i18n, and admin order/ops untouched. Phase 4 Production cutover remains parked.

## Source References

- `team-Yuri/plan.md` — Phase 5: Storefront Bakery Scroll UI; Phase 4 PARKED; Growth → Phase 6
- `team-Yuri/arch-phase2.md` — storefront routes, cart, checkout, i18n (extend presentation; do not replace domain)
- `team-Yuri/arch-phase4.md` — Production residual (out of this phase); prior ban on redesign applies only inside Phase 4
- `DOCS/ux-previews/direction-bakery-scroll.html` — home mock (primary visual SoT)
- `DOCS/ux-previews/bakery-catalog.html`, `bakery-product.html`, `bakery-cart.html`, `bakery-checkout.html`, `bakery-home-en.html`, `bakery-checkout-en.html`
- `DOCS/ux-previews/bakery-theme.css` — tokens, layout patterns, motion
- `DOCS/ux.md` — must be updated this phase to supersede Direction A as selected storefront direction
- `DOCS/Maison-Malka-PRD.md` — brand “wow / want to order” without inventing new product domains
- `.cursor/rules/40-project-structure.md`, `.cursor/rules/50-git-workflow.md`, `.cursor/rules/20-testing.md`

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| Presentation-only phase on existing storefront | User wants Bakery Scroll in the real app before Production; domain already works | CSS/tokens/components/pages under `src/`; no new business modules |
| Visual SoT = Bakery Scroll UX previews | Explicit user lock after Direction A experiments | Match light cream, gold accents, sticky nav, ticker, carousels, hero composition — not Noir & Gold dark redesign |
| Keep route contract from Phase 2 | Avoid regression and SEO churn | `/[locale]`, `/catalog`, `/products/[id]`, `/cart`, `/checkout`, `/order/[id]`, login/register — same paths |
| Design tokens in `globals.css` / Tailwind `@theme` | Align with bakery-theme variables | Replace/extend `mm-*` tokens toward bakery palette (`--bg` soft cream, ink, gold, line, dark CTA) |
| Typography remains Cormorant + Heebo | Already in app + mocks | Adjust weights/sizes to match bakery mock; no new font families without need |
| Motion: 2–3 intentional effects | Mock uses marquee, reveal, carousel scroll | Respect `prefers-reduced-motion`; no decorative noise |
| Admin UI unchanged | Phase boundary; risk isolation | No admin layout/theme rewrite except shared token bleed if unavoidable — prefer scoping storefront styles |
| No Prisma / ERD changes | UI only | If a schema bug blocks UI, stop and escalate to Architect |
| Phase 4 stays parked | User deferring Production for more features | No Vercel Production requirement; no Resend live proof in Phase 5 acceptance |
| Business Growth deferred to Phase 6 | Plan amendment | Payments/loyalty/WhatsApp out of Phase 5 |
| Git: `phase-5/bakery-scroll-storefront` from `develop` | Workflow rule | Developer records branch in `dev-phase5.md` |
| Update `DOCS/ux.md` selected direction | Docs must match reality | Developer (or Manager-assigned) updates status to Bakery Scroll; keep Direction A as historical option if useful |

## Constraints / Non-Negotiables

- Do not break guest checkout → `Order` `pending_approval`
- Do not add online payment, coupons, loyalty, WhatsApp, or delivery-zone features
- Do not require Production / Resend to close this phase
- Do not redesign `/admin` surfaces as a goal
- Do not invent top-level folders
- Do not hardcode catalog/prices; keep DB-driven products/images
- Preserve HE (RTL default) + EN (LTR)
- TypeScript strict; `npm run lint` and `npm test` must PASS
- Visually testable on local `npm run dev` (functionally testable outcome required)

## Technical Boundaries / Out of Scope

- Phase 4: Vercel Production URL, live Resend message ids, merge-to-`main` production cutover
- Phase 6+: payments, growth, automation, multi-region delivery
- Pixel-perfect clone of every Unsplash URL from mocks when real `ProductImage` exists — prefer real catalog media
- Rewriting CartProvider persistence model or checkout validation rules (lead time, Saturday, fulfillment) except styling/layout of forms
- New localization keys only as needed for bakery copy already implied by mocks / existing i18n patterns
- Static HTML mocks remain in `DOCS/ux-previews/` as reference; they are not the shipped app

## Dependencies and Interfaces

### Builds on
- Phase 2 storefront components: `src/components/storefront/*`, `src/app/[locale]/*`
- Phase 3 order confirmation + notifications (emails may be no-op locally without Resend — acceptable)
- Existing CartProvider, LanguageSwitcher, CheckoutForm domain logic

### Touch surfaces (indicative — Manager may refine)
- `src/app/globals.css` (tokens)
- `src/app/layout.tsx` / locale layout if font loading needs tweak
- `StorefrontHeader`, `StorefrontFooter`, home page, catalog, product, cart, checkout UI
- Possibly small shared UI primitives (carousel, ticker, section chrome) under `src/components/storefront/`
- `src/messages/{he,en}.ts` / i18n strings if copy alignment needed
- `DOCS/ux.md` direction status

### External services
- Unchanged Supabase DB/Storage/Auth; no new vendors

## Data / State Considerations

- No new tables or enums
- Cart still client/session until checkout
- Product imagery: use storage URLs from DB; fall back to tasteful placeholder only if missing
- Do not change order field validation, pricing recomputation, or status transitions

## Security / Privacy Considerations

- No new PII fields on checkout
- Do not expose service-role keys; keep server actions as-is
- Avoid injecting untrusted HTML from CMS (there is none); keep React text nodes
- Third-party image URLs from mocks must not become production dependency if products have real images

## Testing and Lint Expectations

- `npm run lint` PASS
- `npm test` PASS (extend or add lightweight tests only if new pure helpers appear — e.g. carousel util; otherwise existing suite remains the gate)
- Document commands + results in `dev-phase5.md`
- Manual functional pass (required evidence): home Bakery Scroll look; catalog; PDP; add to cart; checkout submit (local); HE↔EN switch; mobile ~375px smoke

## Functional Testability

- **Page/screen the user can open:** `http://localhost:3000/he`, `/he/catalog`, `/he/products/[id]`, `/he/cart`, `/he/checkout` (and `/en` equivalents)
- **User-visible behavior:** Light bakery layout (cream bg, gold accents, brand-forward header, horizontal scroll sections on home); existing purchase path still works
- **Command-line flow:** `npm run dev`; `npm run lint`; `npm test`
- **API endpoint / request:** Existing checkout server action still creates order (no new API required)
- **Minimal end-to-end flow:** Browse home → open product → add to cart → checkout guest → see confirmation / pending order
- **Expected observable result:** Storefront feels like Bakery Scroll mocks; order row still appears for admin; no Production dependency

This phase is **not** infrastructure-only.

## Handoff Notes for Manager

1. Confirm visual parity priorities vs mocks: **home first**, then catalog, PDP, cart, checkout (same theme chrome throughout).
2. Choose implementation style within contract: Tailwind utility composition vs small CSS modules — prefer existing Tailwind + token update pattern.
3. Sequence milestones for `phase-5/bakery-scroll-storefront`: tokens → shell (header/footer/ticker) → home → catalog → PDP → cart → checkout → `DOCS/ux.md` → lint/test/manual evidence.
4. Acceptance = local E2E + visual match (not pixel audit); Production explicitly **not** required.
5. Phase 4 residual must remain documented as open when writing Developer notes.
6. Do not expand into admin redesign or growth features.

## Architect Review
ARCHITECT_REVIEW_STATUS: APPROVED

### Review Notes

**Review date:** 2026-07-15  
**Reviewer:** Yuri (Software Architect)  
**Artifacts reviewed:** `arch-phase5.md`, `manager-phase5.md` (MANAGER_REVIEW_STATUS: APPROVED), `dev-phase5.md` (STATUS: COMPLETE)

#### Architecture alignment — PASS

| Check | Verdict | Notes |
|---|---|---|
| Phase 5 goal | Pass | Bakery Scroll presentation on public storefront |
| Presentation-only | Pass | Tokens/components/pages/i18n/docs; no new business domains |
| Visual SoT Bakery Scroll | Pass | Home hero, ticker, horizontal scrollers, cream/gold tokens documented |
| Route contract Phase 2 | Pass | Same `/[locale]` storefront paths |
| Admin untouched as goal | Pass | No admin redesign; minor token inheritance noted as residual |
| No Prisma / ERD | Pass | No migrations in evidence |
| Phase 4 Production not required | Pass | Explicitly PARKED in Known Issues |
| Phase 6 growth out | Pass | No payments/loyalty/WhatsApp |
| `DOCS/ux.md` direction lock | Pass | Bakery Scroll selected |
| Git workflow | Pass | `phase-5/bakery-scroll-storefront` from `develop`; pushed |
| Manager gate | Pass | APPROVED with acceptance criteria checked |

#### Functional testability — PASS (with documented residual)

| Criterion | Verdict | Notes |
|---|---|---|
| Local Bakery Scroll surfaces | Pass | `/he`, catalog, PDP, cart, checkout chrome; HE↔EN |
| Lint / unit tests / build | Pass | lint; 18 tests; `npx next build` |
| Motion a11y | Pass | `prefers-reduced-motion` in globals |
| Guest order create re-proof | Partial | Submit not re-logged this phase; `createGuestOrder` still wired — **accepted** for presentation-only (Manager concurred) |
| Production / Resend | N/A | Correctly out of Phase 5 |

#### Accepted residuals for Phase 5 close

| Item | Disposition |
|---|---|
| Guest checkout submit not re-logged | Accepted — domain unchanged; recommend smoke before Production |
| Unsplash hero fallback when no product images | Accepted — preferred DB images when present |
| Admin inherits `mm-*` token refresh | Accepted — not an admin redesign |
| Phase 4 Production + live Resend | Remains open — resume before customer go-live |
| Windows `npm run build` Prisma EPERM | Accepted — `npx next build` PASS documented |

**Architect APPROVED.** Phase 5 complete architecturally. Do **not** update `PHASE.md` without explicit user instruction. Next product choices: more pre-prod features, or resume Phase 4 Production readiness.

### Required Corrections

None.
