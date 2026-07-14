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

### Completion Criteria

Phase 4 is complete when:

- System is deployed.
- Customer data is protected.
- Backup process exists.
- Operational risks are documented.

---

## Phase 5 — Business Growth

### Objective

Expand system capabilities based on business needs.

### Possible Features

- Online payments.
- WhatsApp notifications.
- Customer accounts improvements.
- Loyalty program.
- Promotions.
- Seasonal products.
- Delivery automation.
- Capacity management.


### Possible additions:

- Online payment provider integration.
- Additional administrators.
- Advanced permission management.
### Completion Criteria

Defined separately based on business growth requirements.

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
