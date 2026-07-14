# Manager Phase 3

## Phase Identifier
PHASE=3

## Status
STATUS: READY_FOR_DEVELOPER

## Phase Goal

Deliver functionally testable admin order operations: protected list, detail, and calendar views; manual approve/reject workflow on `pending_approval` orders; and transactional customer emails (received, approved, rejected) via Resend — without online payment processing or breaking Phase 1–2 flows.

## Source References

- `team-Yuri/arch-phase3.md`
- `team-Yuri/arch-phase2.md` (Order model, `createGuestOrder`)
- `team-Yuri/plan.md` — Phase 3
- `DOCS/Maison-Malka-ERD.md` — Order entities
- `DOCS/Maison-Malka-Architecture-Plan.md` — §11 Notifications
- `DOCS/Maison-Malka-Technology-Stack-Decision.md` — Resend
- `DOCS/Maison-Malka-Development-Phases-Plan.md` — Phase 3
- `DOCS/phases/08-admin-orders.md`
- `.cursor/rules/20-testing.md`, `30-docs.md`, `40-project-structure.md`, `50-git-workflow.md`

## Architecture Summary

- **Stack:** Extend existing Next.js + Prisma + Supabase monolith; add Resend SDK/server HTTP client
- **Phase 3 scope:** Admin `/admin/orders` (list, detail, calendar); server actions for status transitions; notification module under `src/lib/notifications/`
- **Order model:** Reuse Phase 2 Prisma schema; no migration unless Architect-approved gap found
- **Status workflow (MVP):** `pending_approval` → `approved` | `rejected` only (admin-initiated)
- **Emails:** Order received (post-checkout), approved, rejected — Hebrew-first plain/HTML acceptable
- **Env:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (server-only); document in `.env.example` and README
- **Git:** Branch `phase-3/order-operations` from `develop`; milestone commits per `50-git-workflow.md`
- **Deferred:** Payment gateway, WhatsApp/SMS, notification audit log table, `payment_pending` UI, production hardening (Phase 4)

## Ordered Milestones

| Order | Milestone | Description | Acceptance Signal |
|---:|---|---|---|
| M0 | Git branch setup | Checkout `phase-3/order-operations` from `develop` | Branch exists; recorded in `dev-phase3.md` Git section |
| M1 | Resend foundation | Env vars, `.env.example`, notification module, mockable send API | Unit tests for payload builder; lint passes; no client exposure of API key |
| M2 | Order status guard | Server helper/action validating legal transitions | Unit tests: only `pending_approval` → `approved`/`rejected`; reject illegal transitions |
| M3 | Admin order list | `/admin/orders` with sort (default `created_at` desc), status filter, date range filter | Admin sees pending orders; filters change result set |
| M4 | Admin order detail | `/admin/orders/[id]` — customer, items, options, fulfillment, totals, notes | Full snapshot readable; links from list |
| M5 | Approve / reject actions | Buttons on detail (or list) calling secured server action | DB status updates; UI reflects new status; non-admin blocked |
| M6 | Admin calendar | `/admin/orders/calendar` grouped by `requested_fulfillment_date` | Orders appear on correct day; navigate to detail |
| M7 | Order received email | Hook after successful `createGuestOrder` | Email attempt logged; order persist even if send fails |
| M8 | Approved / rejected emails | Send on admin status change | Resend message id or test-inbox proof in dev report |
| M9 | Admin nav + styling | Orders link in admin shell; reuse `mm-*` / admin patterns | Consistent with Phase 1 admin UI (Hebrew-first) |
| M10 | Tests, docs, evidence | Unit tests, README, `dev-phase3.md`, push branch | `npm run lint`, `npm test`, `npm run build` PASS |

## Detailed Development Plan

### M0 — Git branch setup
- `git fetch origin && git checkout develop && git pull --ff-only origin develop`
- `git checkout -b phase-3/order-operations`
- Commit message when starting: `phase-3: start order operations branch`

### M1 — Resend foundation
- Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.example` with comments (server-only)
- Create `src/lib/notifications/` (e.g. `resend.ts`, `templates.ts`, `types.ts`)
- Export functions: `sendOrderReceived`, `sendOrderApproved`, `sendOrderRejected` (names may vary; contract must match)
- Use Resend API from server only; return `{ ok, messageId?, error? }` — never throw into checkout rollback
- Unit test: template/payload includes order id, customer name, fulfillment date; mock fetch/client

### M2 — Order status guard
- `src/lib/orders/status.ts` (or under `actions/`): `canTransition(from, to)` and `assertTransition`
- Allowed MVP transitions from admin UI: `pending_approval` → `approved`, `pending_approval` → `rejected`
- Reject transitions from `approved`/`rejected`/`completed` without explicit arch scope
- Unit tests cover all enum cases used in UI

### M3 — Admin order list
- Route: `src/app/admin/(protected)/orders/page.tsx`
- Query orders with Prisma; include item count or total in list row
- Filters: `status` (at minimum `pending_approval`, `approved`, `rejected`, all), optional `created_at` or fulfillment date range
- Default sort: newest first
- Link each row to detail

### M4 — Admin order detail
- Route: `src/app/admin/(protected)/orders/[id]/page.tsx`
- Show: customer_name, phone, email, fulfillment_type, delivery_address, requested_fulfillment_date, payment_method, notes, subtotal, total
- Line items: product reference + quantity + unit/line totals; option snapshots from OrderItemOption
- Show current status badge

### M5 — Approve / reject actions
- Server action `updateOrderStatus(orderId, newStatus)` with `requireAdmin()`
- Only expose approve/reject when current status is `pending_approval`
- On success: revalidate list/detail paths; return clear errors for illegal transitions
- Commit after M3–M5 slice: `phase-3: admin order list detail and status actions`

### M6 — Admin calendar
- Route: `src/app/admin/(protected)/orders/calendar/page.tsx`
- Group orders by `requested_fulfillment_date` (month view acceptable; week list acceptable)
- Each cell/day shows order count and/or short list (customer name, status, total)
- Click through to order detail
- Helper for date grouping unit-tested

### M7 — Order received email
- In `createGuestOrder` (after DB commit): call `sendOrderReceived` with order id and customer_email
- Log failure server-side; do not fail checkout response if email fails
- Document behavior in README

### M8 — Approved / rejected emails
- On successful approve: `sendOrderApproved`
- On successful reject: `sendOrderRejected`
- Capture Resend response id in logs or dev evidence
- Commit: `phase-3: wire Resend notifications for order lifecycle`

### M9 — Admin nav + styling
- Add "הזמנות" (orders) to admin sidebar/header in `(protected)/layout.tsx` or shared nav component
- Sub-nav or tabs: רשימה / לוח שנה
- Match existing admin typography and `mm-*` tokens

### M10 — Tests, docs, evidence
- Unit tests: status guard, calendar grouping, notification payload (minimum 3 new test cases or files)
- Update README: Resend setup, verified sender domain note, admin order URLs
- Complete `team-Yuri/dev-phase3.md` with Git table, commits, functional + email proof
- `git push -u origin phase-3/order-operations`

## Acceptance / Gating Criteria

Phase 3 passes Manager review only if **all** are true:

- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0 (includes Phase 3 unit tests)
- [ ] `npm run build` exits 0
- [ ] Git branch `phase-3/order-operations` from `develop`; milestone commits documented
- [ ] `.env.example` documents `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (no real secrets committed)
- [ ] `/admin/orders` lists orders; filters work (status minimum)
- [ ] `/admin/orders/[id]` shows full order snapshot
- [ ] Approve changes `pending_approval` → `approved` in DB
- [ ] Reject changes `pending_approval` → `rejected` in DB
- [ ] Illegal status transitions rejected server-side (unit test proof)
- [ ] `/admin/orders/calendar` shows orders on correct fulfillment dates
- [ ] Guest checkout still works (Phase 2 regression)
- [ ] Phase 1 `/admin` catalog still works
- [ ] Order received email triggered on checkout (evidence: log message id or Resend dashboard)
- [ ] Approval email triggered on approve (evidence required)
- [ ] Rejection email triggered on reject (evidence required)
- [ ] No payment gateway, WhatsApp, or notification DB log table added
- [ ] `dev-phase3.md` complete with commands, functional evidence, email proof
- [ ] README updated for Resend + admin orders

## Functional Testability Criteria

- **Page/screen the user can open:** `/admin/orders`, `/admin/orders/calendar`, `/admin/orders/[id]`
- **User-visible behavior:** Admin logs in → sees pending order → opens detail → approves or rejects → calendar shows order on fulfillment date
- **Command-line flow:** `npm run dev` → guest checkout (or `scripts/verify-guest-order.ts`) → admin UI status change → query DB status
- **API endpoint / request:** `updateOrderStatus` returns error on illegal transition; success updates row
- **Minimal end-to-end flow:** Guest places order → customer receives "received" email → admin approves → customer receives "approved" email → DB `approved`
- **Expected observable result:** Business owner manages daily orders in admin without external tools

## Test Plan

### Automated

| ID | Area | Command / test | Pass condition |
|---|---|---|---|
| T1 | Lint | `npm run lint` | Exit 0 |
| T2 | Unit tests | `npm test` | Exit 0; includes status guard, calendar helper, notification payload tests |
| T3 | Build | `npm run build` | Exit 0 |
| T4 | Status guard | `tests/lib/phase3*.test.ts` (or equivalent) | Illegal transitions fail; legal approve/reject pass |

### Manual / functional

| ID | Steps | Expected |
|---|---|---|
| F1 | Login admin → `/admin/orders` | Order list renders; newest pending visible |
| F2 | Filter status = pending | Only pending orders shown |
| F3 | Open order detail | Customer, items, options, fulfillment, totals correct |
| F4 | Click approve on pending order | Status `approved`; list/detail update |
| F5 | Attempt approve on already approved | Error or disabled UI; no DB change |
| F6 | Reject another pending order | Status `rejected`; rejection email proof |
| F7 | `/admin/orders/calendar` | Order appears on `requested_fulfillment_date` |
| F8 | Guest checkout new order | Order `pending_approval`; received email proof |
| F9 | `/admin/products`, `/he` catalog | Phase 1–2 regression PASS |

### Email verification

| Event | Proof required in `dev-phase3.md` |
|---|---|
| Order received | Resend message id, API response snippet, or test inbox note |
| Order approved | Same |
| Order rejected | Same |

If Resend account not configured: BLOCKED — Developer must configure test API key or document BLOCKED with reason (not acceptable for COMPLETE).

## Required Developer Evidence

`team-Yuri/dev-phase3.md` must include:

1. **Git section:** branch `phase-3/order-operations`, base `develop`, commit table (SHA, message, milestone), push status
2. Implementation summary per milestone (M0–M10)
3. Commands with results: `npm run lint`, `npm test`, `npm run build`
4. Functional steps F1–F9 with actual results
5. Email proof for received / approved / rejected (message ids or documented test method)
6. Order id(s) used in proof (DB status before/after)
7. `.env.example` / README Resend documentation
8. Known limitations / deviations from `arch-phase3.md`
9. Phase 1–2 regression notes

## Out of Scope

- Online payment / card processing
- WhatsApp, SMS, push notifications
- Email notification persistence table
- Customer self-service order tracking portal (beyond existing confirmation page)
- `payment_pending` workflow UI
- Mark `completed` (optional nice-to-have; not required for phase close)
- Rejection reason field / order edit / re-submit
- Production security audit, backup, monitoring (Phase 4)
- Merging `phase-3/order-operations` → `develop` → `main` (user/orchestrator gate)

## Risks / Open Questions

| Risk / Question | Mitigation |
|---|---|
| Resend sender domain not verified | Document setup steps; use Resend onboarding domain for dev; block COMPLETE without send proof |
| Email failure blocks checkout | Arch requires non-rollback; implement try/catch + log only |
| Admin approves wrong order | Detail view shows full snapshot; confirm button label clear |
| Calendar timezone vs `Date` field | Use consistent UTC/local handling; document in dev report |
| Large order volume UI | MVP list pagination optional; acceptable if <100 orders without pagination |
| Resend free tier limits | Document; acceptable for MVP evidence |

## Manager Review
MANAGER_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(pending — after Developer delivery)

### Required Corrections

(none — pre-review)
