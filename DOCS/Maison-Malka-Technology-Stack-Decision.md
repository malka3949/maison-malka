# Maison Malka - Technology Stack Decision

Version: MVP v1.0  
Status: Architecture Decision Record

---

## 1. Purpose

This document defines the approved technology direction for the Maison Malka MVP system.

The goal is to select technologies that support:

- Fast MVP development.
- Maintainability by a small team or single owner.
- Future business growth.
- Clear architecture boundaries.
- Reliable operation.

---

## 2. Architecture Direction

### Selected Architecture Style

**Modular Monolith**

The system will be built as one application with clear internal separation between modules.

**Reason:**

- Lower operational complexity.
- Suitable for MVP.
- Easier maintenance.
- Allows future expansion.

Microservices architecture is **not approved** for MVP.

---

## 3. Frontend Technology

### Decision

**Next.js + TypeScript**

### Purpose

Used for the customer-facing website and web application interface.

### Reasons

- Strong support for modern websites.
- Good performance.
- Suitable for mobile-responsive experiences.
- Good support for search engine visibility.
- Large ecosystem.

---

## 4. Backend Technology

### Decision

Backend logic will be implemented within the Next.js application layer.

**Responsibilities:**

- Order management.
- Product management.
- Business rules.
- Customer handling.
- Notifications triggering.

**Reason:** Avoid unnecessary separation during MVP.

---

## 5. Programming Language

### Decision

**TypeScript**

**Requirements:**

- Strict typing enabled.
- Clear interfaces between system components.
- Avoid uncontrolled dynamic structures.

**Reason:** Improves reliability and maintainability.

---

## 6. Database Technology

### Decision

**PostgreSQL**

### Purpose

Store business information:

- Products.
- Categories.
- Product options.
- Customers.
- Orders.
- Users.
- Permissions.

**Reason:** The business domain requires structured relational data.

---

## 7. Database Access Layer

### Decision

**Prisma ORM**

### Purpose

Provide a controlled way for application code to interact with the database.

**Requirements:**

- Database schema must be documented.
- Changes require review.
- No uncontrolled direct database manipulation.

---

## 8. Image Storage

### Decision

**External object storage.**

Selected:

Supabase Storage

Purpose:

- Product images.
- Brand assets.
- Marketing images.

Requirements:

- Files stored outside database.
- Database stores references only.
- Storage structure must support future expansion.

---

## 9. Authentication & Authorization

### Decision

Use **managed authentication solution**.

Selected:

Supabase Auth

Requirements:

- Secure login.
- Password protection.
- Session management.
- Role-based authorization preparation.

Admin users must not be hardcoded.

The system must support future multiple administrators.

---

## 10. Hosting Direction

### Development

**Allowed:** Free or low-cost hosting environments.

**Purpose:** Development and testing.

### Production

**Requirement:** Managed cloud hosting.

Development and Production Hosting:

Selected:
Vercel

Requirements:

- Managed cloud hosting.
- Secure deployments.
- Environment separation.
- Future scaling capability.

## 11. Email System

### Decision

**External email delivery provider.**

**Selected:**

Resend

### Used for:

- Order received notification.
- Approval notification.
- Rejection notification.
- **Post-MVP (Team Yuri Phase 8 / product Phase 12):** manual admin marketing campaigns to consented recipients only.

### Requirements:

- Email delivery logic must remain separated from order logic.
- Transactional emails only in MVP (not marketing campaigns).
- Marketing campaigns (when enabled) use a **separate campaign module**; must not call order `sendOrder*` helpers.
- Marketing sends require active marketing consent + unsubscribe link in every campaign email.

### Growth strategy:

- Start on Resend free tier for MVP.
- As business volume grows, upgrade to a paid Resend plan on the same provider.
- Provider replacement is not the default growth path.
- **Manual** marketing campaigns may use Resend in-app (Phase 8 / product 12) with batching and consent gates.
- If marketing **automation** or high-volume ESP features are needed later, add a separate marketing tool while keeping Resend for order-related emails.

---

## 12. AI Development Rules

When using AI coding assistants, the following rules are mandatory:

- Architecture decisions must not be changed automatically.
- New libraries require approval.
- Data models must follow approved design.
- Temporary solutions must be documented.
- Security shortcuts are not allowed.

---

## 13. Technology Restrictions

**Not approved for MVP:**

- Microservices.
- Custom payment processing.
- Custom authentication system.
- Complex infrastructure.
- Unnecessary frameworks.

---

## 14. Approved Technology Summary

| Area | Technology |
|---|---|
| Architecture | Modular Monolith |
| Frontend | Next.js |
| Language | TypeScript |
| Backend | Next.js Backend Layer |
| Database | PostgreSQL |
| Database Access | Prisma |
| Image Storage | Supabase Storage |
| Authentication | Supabase Auth |
| Hosting | Vercel |
| Notifications | Resend |

---

**Document Owner:** Software Architecture  
**Project:** Maison Malka
