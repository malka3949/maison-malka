# Architecture Phase 3

## Phase Identifier
PHASE=3

## Status
STATUS: READY_FOR_MANAGER

## Phase Goal

Enable daily order operations for the business owner: admin order list and calendar (by requested fulfillment date), manual approve/reject workflow on existing `Order` records, and transactional customer email notifications via Resend — without online payment processing.

## Source References

- `team-Yuri/plan.md` — Phase 3: Order Operations
- `team-Yuri/arch-phase1.md` — admin foundation
- `team-Yuri/arch-phase2.md` — Order persistence and customer checkout
- `DOCS/Maison-Malka-PRD.md`
- `DOCS/Maison-Malka-Architecture-Plan.md` — §11 Notification Architecture
- `DOCS/Maison-Malka-Technology-Stack-Decision.md` — Resend
- `DOCS/Maison-Malka-Development-Phases-Plan.md` — Phase 3
- `DOCS/Maison-Malka-ERD.md` — Order, OrderItem, OrderItemOption
- `DOCS/phases/08-admin-orders.md`

## Architectural Decisions

| Decision | Rationale | Consequence |
|---|---|---|
| Extend Phase 1–2 monolith; no new services | Approved stack | Admin order UI under existing `/admin` protected layout |
| Reuse Prisma `Order` model and `OrderStatus` enum | Phase 2 migration already applied | Phase 3 adds workflow + UI + emails; schema changes only if gaps found |
| Admin order list + detail + calendar views | PRD §7 / plan Phase 3 | Routes under `src/app/admin/(protected)/orders/` |
| Manual approval gate | PRD non-negotiable | Only admin may transition `pending_approval` → `approved` or `rejected` |
| Valid status transitions enforced server-side | Prevent invalid ops | Server actions validate current status before update |
| Notification module abstraction | Architecture Plan §11 | `src/lib/notifications/` (or equivalent) wraps Resend; order domain calls notification service |
| Resend for transactional email only | Approved provider | `RESEND_API_KEY` server-only env; document in `.env.example` |
| Email events: received, approved, rejected | Architecture Plan events | Received on successful checkout; approved/rejected on admin action |
| Customer emails use order snapshot fields | PII already on Order | No extra DB table for notification log in MVP (ERD defers log) |
| Admin UI Hebrew-first | Phase 1 convention | English admin labels optional; customer emails may be Hebrew-first with plain text |
| Calendar groups by `requested_fulfillment_date` | Development Phases Plan | Month/week view acceptable; must surface order count or list per day |
| `payment_pending` status unchanged in Phase 3 | No payment gateway | Do not build payment-collection flows; status may exist but is out of Phase 3 UI scope |
| `completed` transition optional in Phase 3 | MVP operations focus | Manager may include mark-complete if low effort; not required for phase close if approve/reject works |

## Constraints / Non-Negotiables

- No online payment / payment-gateway integration
- No WhatsApp or SMS notifications
- No customer-facing order-tracking portal beyond existing Phase 2 confirmation page (unless minimal status message added)
- Do not break Phase 1 admin catalog or Phase 2 storefront/checkout
- Admin routes remain role-protected (admin only)
- `RESEND_API_KEY` and service keys never exposed to client
- TypeScript strict; lint and unit tests required
- Functionally testable admin + email flow required

## Technical Boundaries / Out of Scope

- Production security audits, backup, monitoring (Phase 4)
- Vercel production cutover as mandatory deliverable (preview/local acceptable with documented waiver)
- Advanced analytics, export, inventory automation
- Email notification persistence / audit log table
- Multi-admin permissions beyond existing `admin` role
- Automated delivery routing / courier APIs
- Marketing campaigns / newsletter tooling

## Dependencies and Interfaces

### Builds on Phase 2
- `Order`, `OrderItem`, `OrderItemOption` models and `createGuestOrder` server action
- Customer checkout creates orders with `status = pending_approval`
- Admin auth middleware and `(protected)` layout

### New / extended (indicative)
- Admin routes: `/admin/orders` (list), `/admin/orders/[id]` (detail), `/admin/orders/calendar` (calendar)
- Server actions: `updateOrderStatus`, list/filter queries, calendar aggregation
- `src/lib/notifications/` + Resend client wrapper
- Email templates (inline TS/HTML strings acceptable for MVP)
- Env: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (or documented sender domain)

### External services
- Resend API (transactional email)
- Supabase PostgreSQL (existing)
- Vercel (existing)

### Touch points on Phase 2 code
- `createGuestOrder` (or post-create hook): trigger **order received** email to `customer_email`
- Failure to send email must not roll back order persistence; log and surface admin-visible warning optional

## Data / State Considerations

- List view: all orders; default sort by `created_at` desc; filters by `status` and date range
- Calendar view: orders keyed by `requested_fulfillment_date`; show customer name, status, total
- Detail view: customer snapshot, items with option snapshots, fulfillment, payment method, notes, totals
- Approve: `pending_approval` → `approved` only
- Reject: `pending_approval` → `rejected` only; optional rejection reason field **out of scope** unless Manager adds as nice-to-have (no schema change required for MVP reject)
- Re-submit or edit order: out of scope
- Guest and registered orders both visible (`user_id` optional)

## Security / Privacy Considerations

- Admin-only access to order list/detail/calendar and status mutations
- Server-side authorization check on every order action (session admin role)
- Validate order id exists and status transition is legal
- Resend calls server-only; sanitize email content; do not leak other customers' data in templates
- Rate-limit admin actions lightly if trivial; document if omitted
- PII (name, phone, email, address) displayed only in admin; emails go only to order's `customer_email`

## Testing and Lint Expectations

- `npm run lint` PASS
- Unit tests for: status transition guard, calendar date grouping helper, notification payload builder (mock Resend)
- Document commands and results in `dev-phase3.md`
- Functional test: place guest order → admin sees in list → approve → customer email sent (Resend test mode or documented API verification)

## Functional Testability

- **Page/screen the user can open:** `/admin/orders`, `/admin/orders/calendar`, `/admin/orders/[id]`
- **User-visible behavior:** Admin sees pending orders; opens detail; approves or rejects; calendar shows orders on fulfillment date
- **Command-line flow:** seed or script creates pending order → admin action via UI → DB status updated
- **API endpoint / request:** Status update server action returns success only for valid transitions
- **Minimal end-to-end flow:** Guest checkout (Phase 2) → admin list shows new order → approve → Resend delivers approval email (verify via Resend dashboard or test recipient)
- **Expected observable result:** Business owner can operate daily orders without external tools; customer notified on received/approved/rejected

## Handoff Notes for Manager

- Milestone order suggestion: (1) Resend env + notification module + unit tests, (2) admin order list + filters, (3) order detail + approve/reject actions, (4) calendar view, (5) wire order-received email on checkout, (6) approved/rejected emails, (7) dev evidence + README env docs
- Acceptance must require DB proof of status change and email send proof (Resend message id or test inbox screenshot described in dev report)
- Use existing admin styling (`mm-*` tokens / `admin-ui` patterns)
- Git: branch `phase-3/order-operations` from `develop`; commit per milestone per `.cursor/rules/50-git-workflow.md`
- Keep Phase 4 out: no production hardening mandate beyond documenting Resend setup

## Architect Review
ARCHITECT_REVIEW_STATUS: NOT_REVIEWED

### Review Notes

(pending — after Developer delivery and Manager approval)

### Required Corrections

(none — pre-review)
