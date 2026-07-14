# Maison Malka - Architecture Plan

Version: MVP v1.0  
Status: Draft Architecture Baseline

---

## 1. System Overview

### Purpose

Maison Malka is a premium boutique pastry e-commerce platform.

The system will provide:

- Digital brand presence.
- Product showcase.
- Customer ordering flow.
- Manual order approval process.
- Basic business administration capabilities.

The MVP is designed for a small growing business with future expansion capability.

---

## 2. Architecture Goals

The architecture must support:

- Premium customer experience.
- Simple operation for a single business owner.
- Future growth without major redesign.
- Clear separation between customer, business, and system responsibilities.
- Low operational complexity during MVP.

---

## 3. Architecture Principles

### 3.1 Keep MVP Simple

The first version must avoid unnecessary complexity.

**Not included:**

- Advanced inventory management.
- Complex marketing automation.
- Advanced customer relationship management.
- Automated production planning.

### 3.2 Separate Data From Application Logic

Business data must not be embedded inside application code.

**Examples:**

- Products.
- Prices.
- Images.
- Orders.
- Customers.

These must be managed as system data.

### 3.3 Prepare For Growth

The system must allow future additions:

- More administrators.
- More delivery areas.
- Online payments.
- Customer accounts.
- Marketing features.

---

## 4. High Level System Architecture

`Customer
    |
Next.js Web Application
    |
Next.js Application Layer
    |
+-------------------------------+
|                               |
Supabase PostgreSQL        Supabase Storage
|                               |
Business Data              Product Images
|
Supabase Auth
|
Admin Users

---

## 5. Main System Components

### 5.1 Customer Website

**Responsibilities:**

- Display brand content.
- Display products.
- Allow product selection.
- Manage shopping cart.
- Collect order information.
- Submit order requests.

**Requirements:**

- Mobile responsive.
- Fast image loading.
- Premium visual experience.

### 5.2 Backend System

**Responsibilities:**

- Business rules.
- Order management.
- Product management.
- Customer data management.
- Notification triggering.

The backend is the central business logic layer.

### 5.3 Database

**Stores:**

- Products.
- Categories.
- Product options.
- Customers.
- Orders.
- Order status.
- Admin users.

### 5.4 Admin Panel

**Responsibilities:**

- Manage products.
- Manage categories.
- Upload images.
- Review orders.
- Approve or reject orders.
- Manage availability.

**Future support:**

- Multiple administrators.
- Different permission levels.

---
### Admin User Model

MVP:

- One active business administrator.

Architecture requirement:

- Users must be managed through authentication system.
- Admin identity must not be hardcoded.
- Data model must support multiple administrators in the future.
- Future permission levels must be possible.
## 6. Product Catalog Architecture

**Product structure:**

```text
Category
    |
Product
    |
    +-- Images
    +-- Description
    +-- Base Price
    +-- Options
```

**Supported in MVP:**

- Categories.
- Products under categories.
- Fixed bundles (predefined packages).
- Basic variations.
- Price changes based on options.

**Not supported:**

- Complex customization engine.

---

## 7. Order Management Architecture

**Order lifecycle:**

```text
Pending Approval
    |
    +-------------+
    |             |
Approved      Rejected
    |
Payment Pending
    |
Completed
```

**Order information:**

- Customer details.
- Products.
- Selected options.
- Requested date.
- Pickup/delivery choice.
- Notes.

**Important:** Order creation date and requested fulfillment date must be stored separately.

---

## 8. Payment Architecture

### MVP Payment Model

Supported:

- Bank transfer.
- Payment on pickup.

Not supported:

- Online credit card payments.
- Payment provider integration.
- Storage of payment information.

Reason:

Reduce security and operational complexity during MVP.

Future:

Online payment provider can be integrated without redesigning order architecture.
---

## 9. Delivery Architecture

### MVP

**Supported:**

- Pickup.
- Delivery request.

**Delivery management:** Manual handling by business owner.

**Future:**

- Delivery zones.
- Automatic pricing.
- Delivery scheduling.

---

## 10. Customer Account Architecture

### MVP

- **Guest checkout** — הרשמה אינה חובה בהזמנה ראשונה.
- לקוח ממלא פרטים בטופס הזמנה (שם, טלפון, אימייל, כתובת משלוח אם רלוונטי).
- **הרשמה אופציונלית** — לקוח יכול ליצור חשבון לנוחות, כדי שפרטיו יישמרו להזמנות הבאות.
- **התחברות** — לקוח רשום יכול להתחבר ולמלא פרטים אוטומטית.

**Required customer information (per order):**

- Name.
- Phone.
- Email.
- Delivery details (if delivery selected).

**Available after optional registration:**

- Saved customer details.
- Order history.

---

## 11. Notification Architecture

### MVP

Email notifications only.

**Selected provider:**

Resend

**Events:**

- Order received.
- Order approved.
- Order rejected.

**Architecture:**

```text
Order System
    |
Notification Service
    |
Resend
```

**Growth strategy:**

- MVP: Resend free tier.
- Growth: upgrade Resend plan as email volume increases.
- Keep Resend for transactional order emails.
- Add separate marketing tooling later only if needed.

**Future channels:** WhatsApp, SMS.

---

## 12. Infrastructure Direction

### Development Environment

**Allowed:** Free or low-cost hosting solutions.

**Purpose:** Development and testing.

### Production Environment

**Requirement:** Managed cloud infrastructure.

**Must support:**

- Reliability.
- Backup.
- Security.
- Future scaling.

---
## Infrastructure Provider Decisions

### Application Hosting

Selected:
Vercel

Purpose:
- Host Next.js application.
- Provide managed deployment.
- Support future scaling.

---

### Database Platform

Selected:
Supabase PostgreSQL

Purpose:
- Store structured business data.
- Provide managed PostgreSQL infrastructure.

---

### Authentication

Selected:
Supabase Auth

Requirements:
- Secure administrator login.
- Session management.
- Future multi-user support.

---

### Image Storage

Selected:
Supabase Storage

Requirements:
- Store product and brand images.
- Database stores file references only.
- Images are not stored inside database.

### Email Delivery

Selected:
Resend

Purpose:
- Send transactional order emails.
- Support MVP on free tier.

Growth:
- Upgrade Resend plan as business volume grows.
- Do not replace provider by default.

## 13. Security Requirements

The system must:

- Protect customer information.
- Protect administrator access.
- Avoid storing sensitive payment information.
- Use secure authentication.
- Apply role-based permissions.

---

## 14. Development Phases

### Phase 1 — MVP Foundation

**Scope:**

- Responsive website.
- Brand pages.
- Product catalog.
- Shopping cart.
- Order creation.
- Admin panel.
- Manual approval.
- Email notifications.

### Phase 2 — Business Growth

**Possible additions:**

- Online payment.
- Customer accounts.
- Improved customer management.
- Delivery improvements.

### Phase 3 — Advanced Operations

**Possible additions:**

- Production planning.
- Inventory support.
- Marketing automation.
- Loyalty features.

---

## 15. Engineering Standards

**Required:**

- Clean separation of frontend/backend responsibilities.
- Documented architecture decisions.
- No hardcoded business data.
- Secure authentication.
- Maintainable code structure.
- Clear environment separation.

---

## 16. Current Architectural Decisions Summary

| Decision | Selected Option |
|---|---|
| Order approval | Manual approval |
| Product management | Internal admin panel |
| Payment | Manual payment |
| Delivery | Manual delivery handling |
| Customer account | Guest checkout + optional registration |
| Images | Admin-managed replacement |
| Hosting | Managed cloud direction |
| Platform | Responsive website |
| Brand experience | Premium brand + commerce |
| Catalog | Categories + products + fixed bundles |
| Orders view | List + calendar |
| Capacity limits | Manual control |
| Notifications | Resend (transactional email) |
| Admin model | Future multi-admin support |

---

**Document Owner:** Software Architecture  
**Project:** Maison Malka
