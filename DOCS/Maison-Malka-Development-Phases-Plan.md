# Maison Malka - Development Phases Plan

Version: MVP v1.0  
Status: Architecture Planning Document

---

## 1. Purpose

This document defines the recommended development phases for the Maison Malka system.

The goal is to build the system incrementally while maintaining architectural integrity, reducing risk, and allowing future expansion.

Each phase must be completed and validated before moving to the next phase.

---

## 2. Development Strategy

The system will be developed in controlled phases:

```text
Phase 1 — Foundation
        ↓
Phase 2 — Customer Experience
        ↓
Phase 3 — Order Operations
        ↓
Phase 4 — Production Readiness
        ↓
Phase 5 — Business Growth
```

---

## Phase 1 — System Foundation

### Objective

Create the technical foundation required for the Maison Malka platform.

### Scope

**Included:**

- Project structure.
- Development environment.
- Database foundation.
- Core backend structure.
- Admin authentication.
- Product data model.
- Category structure.
- Image storage foundation.
- Vercel deployment foundation.
- Supabase project configuration.
- Authentication foundation.
- Admin user foundation.
**Not Included:**

- Customer ordering flow.
- Online payment.
- Advanced marketing features.
- Delivery automation.

### Completion Criteria

Phase 1 is complete when:

- Admin user can access the system.
- Product structure exists.
- Categories can be managed.
- Images can be stored and connected to products.
- Database structure is validated.
- Application is deployed to development environment.
- Supabase services are configured.
- Admin authentication works.
- User model supports future multiple administrators.

---

## Phase 2 — Customer Experience

### Objective

Allow customers to browse products and create order requests.

### Scope

**Included:**

- Brand homepage.
- Product catalog organized by categories.
- Product pages.
- Fixed bundles (predefined product packages).
- Internationalization: Hebrew and English from MVP.
- Product options.
- Shopping cart.
- Customer information form (guest checkout — no registration required).
- Optional customer registration and login (save details for future orders).
- Pickup/delivery selection.
- Order submission.

**Not Included:**

- Payment processing.
- Advanced customer accounts.
- Marketing automation.

### Completion Criteria

Phase 2 is complete when:

- Customer can browse products.
- Customer can select products and options.
- Customer can submit an order request without creating an account.
- Customer can optionally register to save details for future orders.
- Registered customer can log in and reuse saved details.
- Order information is stored correctly.
- Customer-facing UI supports Hebrew and English.

---

## Phase 3 — Order Management

### Objective

Enable business owner to operate daily orders.

### Scope

**Included:**

- Order management dashboard.
- Order list view.
- Order calendar view (by requested fulfillment date).
- Order status management.
- Approval/rejection workflow.
- Customer email notifications (Resend).

### Order States

Supported:

- Pending Approval.
- Approved.
- Rejected.
- Completed.

### Completion Criteria

Phase 3 is complete when:

- Business owner can review orders in list view.
- Business owner can review orders in calendar view.
- Orders can be approved or rejected.
- Customers receive email notifications via Resend.
- Daily operations can be managed through the system.

---
Order approval is mandatory.

Customer order does not become final until approved by administrator.
## Phase 4 — Production Readiness

### Objective

Prepare the system for real customer usage.

### Scope

**Included:**

- Production hosting.
- Security validation.
- Backup strategy.
- Performance improvements.
- Error monitoring.
- **Pre-launch Trust & Legal (required before public launch):**
  - Privacy, terms, and cancellation pages (Hebrew + English) with storefront links.
  - Always-visible business contact (phone, pickup address, hours).
  - Checkout consent to terms (client + server).
  - Jerusalem delivery disclosure + arranged cost + customer affirmation.
  - Keep bank transfer; admin-stored payment instructions shown after order approval.
  - No ע.מ./ח.פ. display required in this wave.

> **Team Yuri mapping:** Trust & Legal is executed as Team Yuri `PHASE=7`. Product roadmap phase docs fold this into MVP launch readiness (`DOCS/phases/09-…`). Production cutover itself is **Wave 0** in `DOCS/phases/12-post-mvp-waves-roadmap.md` and resumes Team Yuri Phase 4 (PARKED until go-live).

### Completion Criteria

Phase 4 is complete when:

- System is deployed to Production.
- Customer data is protected.
- Backup process exists.
- Operational risks are documented.
- Trust & Legal wave above is live (or explicitly deferred with documented owner approval).
- Live Resend order notifications are proven on Production.

---

## Phase 5 — Post-MVP Growth Waves

### Objective

Expand system capabilities in ordered waves after Production. Canonical map: `DOCS/phases/12-post-mvp-waves-roadmap.md`.

**Prerequisite:** Wave 0 / Phase 4 Production before taking real paying traffic on Growth features (especially online payments).

### Wave 1 — Conversion (Team Yuri Phase 8 — planned)

- Basic coupons/promotions.
- Online payment provider integration.
- Product recommendations.
- Order history + reorder for registered customers.

Product doc: `DOCS/phases/10-growth-and-retention.md` (Wave 1 section).

### Wave 2 — Retention & ops (Team Yuri Phase 9 — planned)

- WhatsApp and/or SMS notifications.
- Basic admin reports.
- Seasonal product availability windows.
- Simple loyalty (not full CRM).

Product doc: `DOCS/phases/10-growth-and-retention.md` (Wave 2 section).

### Wave 3 — Scale & automation (Team Yuri Phase 10 — planned)

- Delivery zones beyond Jerusalem + zone pricing.
- Daily order caps + delivery time windows.
- Marketing automations (reminders / sequences as approved).
- **Manual marketing email campaigns** (consent + unsubscribe) — `DOCS/features/marketing-email-campaigns.md`.

Product doc: `DOCS/phases/11-scale-and-automation.md`.

### Wave 4 — Heavy / deferred (Team Yuri Phase 11+ backlog)

- Automated inventory.
- Advanced product customization.
- Full CRM.
- Production / kitchen planning.

Product doc: `DOCS/phases/13-deferred-heavy-ops.md`.

### Possible later additions (within waves as approved)

- Additional administrators / advanced permissions (usually with ops growth).

### Completion Criteria

Per-wave acceptance criteria in the product phase docs and Team Yuri phase artifacts when execution is approved. Documentation lock alone does **not** start implementation.

### Supersedes

Earlier drafts that placed “manual marketing email” as Development Phase 12 / Team Yuri Phase 8 are superseded; campaigns belong to Wave 3 / Team Yuri Phase 10.

---

## Architecture Rule

New features must not bypass existing architecture decisions.

Temporary solutions require:

- Documentation.
- Defined limitation.
- Future replacement plan.

---

**Document Owner:** Software Architecture  
**Project:** Maison Malka
