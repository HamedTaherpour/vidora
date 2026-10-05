# Project Definition

> Status: Draft  
> Scope: V1  
> Purpose: Canonical product definition for humans and AI coding agents.

## 1. Product Overview

This project is a Persian stock-footage platform for Iranian users.

The platform allows users to discover, preview, purchase, and download professionally produced video footage.

Footage is uploaded and managed exclusively by the platform administrator.

Users can browse and search the catalog, watch or download watermarked previews, purchase individual footage items, and later return to their account to download any available original-quality files associated with their purchases.

The initial catalog is expected to contain approximately 1,000 footage items.

The product may support additional digital asset types, such as After Effects projects, in the future. V1 is exclusively focused on video footage.

---

## 2. Target Users

V1 targets Iranian users such as:

- video editors;
- filmmakers;
- content creators;
- advertising teams;
- social-media creators;
- other professionals looking for ready-to-use footage.

The V1 storefront is Persian-first and intended for Iranian users.

---

## 3. Core Product Model

A `Footage` represents one purchasable video asset.

Each Footage:

- has its own price;
- has descriptive metadata;
- belongs to one or more relevant catalog classifications;
- has a watermarked preview;
- may have multiple downloadable original files or quality variants;
- is purchased as a single product.

Example:

```text
Footage
"پرواز پرندگان بر فراز کوه"

Price:
450,000 Toman

Preview:
Watermarked MP4

Available files:
- 1080p
- 4K
- Master
```

The price belongs to the Footage, not to an individual quality/file.

Purchasing the Footage grants the user access to all downloadable files currently offered for that purchased Footage according to the platform's purchase/download policy.

---

## 4. V1 User Journey

The primary user journey is:

```text
Browse / Search
      ↓
Find Footage
      ↓
View Footage Detail
      ↓
Watch Watermarked Preview
      ↓
Buy Now
      ↓
Phone + OTP Authentication if required
      ↓
Payment
      ↓
Payment Verification
      ↓
Purchase Recorded
      ↓
Footage Added to User Library
      ↓
Download Available Files
```

Users must have an account before a purchase can be completed.

V1 does not require a shopping cart.

Each purchase flow starts from a single Footage through `Buy Now`.

---

## 5. Authentication

Customer authentication is intentionally simple.

V1 uses:

```text
Iranian mobile phone number
+
OTP verification code
```

A user account is associated with a unique phone number.

Authentication must allow returning users to regain access to their previously purchased footage.

The specific SMS provider is an implementation decision and is not defined by this document.

---

## 6. Footage Discovery

Discovery is a core capability of the product.

Users must be able to browse and search the footage catalog.

V1 should support:

- text search;
- categories;
- tags;
- relevant video metadata filters;
- price filtering where useful.

Initial technical filters may include:

- resolution;
- orientation;
- frame rate;
- duration;
- available file/quality types.

The exact filter set may evolve during product and UI design.

The initial catalog size of approximately 1,000 Footage items does not require a dedicated external search engine by product requirement.

Search infrastructure is an architecture decision.

---

## 7. Footage Detail

Each published Footage should have a dedicated public page.

The page should be capable of displaying:

- title;
- description;
- watermarked preview;
- price;
- category information;
- tags;
- duration;
- resolution information;
- frame rate where available;
- relevant technical metadata;
- available downloadable qualities/files;
- related or similar footage when implemented.

The Footage page is also an important SEO surface.

---

## 8. Preview

Every published Footage must have a preview suitable for public consumption.

V1 previews:

- contain a visible platform watermark;
- may contain audio;
- can be streamed by users;
- can be downloaded by users;
- must not expose an unwatermarked original asset.

For V1, the administrator provides the prepared watermarked preview.

Automated preview generation, transcoding, and watermark generation are not required for V1.

---

## 9. Original Footage Files

A Footage may contain multiple downloadable files.

Examples include:

```text
1080p
4K
Master
```

The administrator uploads these files individually.

Files may be large, with individual files expected to reach approximately 2 GB.

The term `Master` refers to the high-quality prepared master supplied for sale. V1 does not assume that camera-native RAW sensor footage is being sold.

The exact codecs and formats may vary between footage items.

Original downloadable files must not be publicly accessible without authorization.

---

## 10. Purchase

Every Footage has one administrator-defined price.

Prices are stored and displayed in integer Toman. Example: `450000` means 450,000 Toman. Floating-point money is forbidden. If a payment provider requires another unit, conversion belongs at the payment-provider boundary only.

V1 uses a single-item `Buy Now` flow.

There is:

- no shopping cart;
- no subscription;
- no pricing by resolution;
- no discount system.

A successful purchase grants the authenticated user access to the purchased Footage.

Purchase history must remain available to the user.

---

## 11. Purchase Entitlement

A successful verified purchase creates durable evidence that the user is entitled to access the purchased Footage.

The entitlement must not depend solely on:

- a browser session;
- a payment callback URL;
- an invoice PDF;
- a temporary download link.

The platform database is the authoritative record of the purchase.

A returning authenticated user must be able to access previously purchased Footage through their account/library.

---

## 12. Downloads

Original footage files are protected assets.

A user may download original files only when the platform verifies that the authenticated user has purchased the corresponding Footage.

Download authorization conceptually follows:

```text
Authenticated User
       ↓
Purchase / Entitlement Check
       ↓
Authorized
       ↓
Temporary Secure File Access
       ↓
Download
```

Original files must not be exposed through permanent public URLs.

Large files should not be unnecessarily proxied through the application server.

Exact storage and secure-delivery mechanisms are architecture decisions.

Download history may be recorded for support, security, and operational purposes.

---

## 13. Usage Rights

V1 intends to provide broad usage rights after purchase.

A purchaser should be able to use purchased footage in their own projects, including commercial projects.

The purchase should provide ongoing access rather than requiring repeated purchases for ordinary reuse.

However, purchasing footage does not inherently mean transferring copyright ownership of the underlying source asset.

At minimum, the final terms should distinguish using the footage in projects from redistributing or reselling the original footage file itself.

The final legal/license wording must be approved by the business owner before launch.

AI agents must not invent additional licensing restrictions.

---

## 14. Orders

Every purchase must create a durable Order record.

Although V1 Buy Now contains only one Footage per checkout, the commerce model should preserve a clean distinction between:

```text
Order
and
Order Item
```

Historical orders must not change when current Footage information changes.

Relevant purchase information must therefore be snapshotted when the order is created or paid.

This includes at least:

- Footage reference;
- Footage title snapshot;
- price snapshot;
- monetary currency/unit information required to interpret the amount.

---

## 15. Payment

Payments are made through an Iranian payment provider.

The specific provider is not defined by this product document.

A payment redirect or callback alone must not be treated as authoritative proof of successful payment.

Payment success must be verified according to the selected payment provider's server-side verification mechanism before purchase access is granted.

Relevant provider transaction/reference information must be retained for support and reconciliation.

---

## 16. Invoice

A successful purchase requires an invoice/receipt record.

The invoice must correspond to a real recorded Order and verified Payment.

The invoice is not the authoritative purchase database itself.

It should contain sufficient non-sensitive information to identify the transaction for the customer and support team, including:

- unique invoice number;
- order reference;
- purchase date;
- purchased Footage information;
- amount paid;
- payment status where appropriate;
- payment transaction/reference information where appropriate;
- masked customer phone number.

Historical invoice information must use purchase-time snapshots rather than mutable current Footage information.

Invoices must remain retrievable after purchase.

### Support verification

A customer may contact support regarding a past purchase.

Support must be able to locate and verify a purchase using appropriate transaction information such as:

```text
Invoice number
+
Customer account / phone verification
```

Payment reference information may also be used when necessary.

Possession of an invoice image or invoice number alone must not automatically prove ownership of the associated user account.

---

## 17. User Library

Authenticated users must have a persistent personal library containing their purchased Footage.

The library should allow users to:

- view purchased Footage;
- open the Footage information;
- see available downloadable files;
- download available files;
- access relevant invoice/purchase information.

A user must not lose library access merely because they logged out or changed devices.

---

## 18. Administration

V1 has a single administrator.

The administrator authenticates with Iranian mobile phone + OTP, but Admin identity is separate from Customer `User` identity. Admin has its own persistence and session cookie. There is no public Admin signup; Admin accounts are manually provisioned. The same canonical phone may exist independently on Customer and Admin without linking those identities. Customer authentication does not grant Admin access, and Admin authentication does not create a Customer account. V1 does not introduce generic RBAC.

The administrator can manage the platform's content and commerce data required for operation.

At minimum, administration requires capabilities for:

- Footage;
- Footage files;
- previews;
- categories;
- tags;
- prices;
- publication state;
- orders;
- payments/support lookup;
- users;
- blog content.

V1 does not require a multi-role administration system or complex RBAC.

Authentication and authorization must still prevent normal customers from accessing administrative functionality.

---

## 19. Footage Administration

The administrator must be able to create and edit Footage metadata.

A Footage should support an explicit publication lifecycle rather than becoming public merely because a database record exists.

At minimum, V1 requires the conceptual distinction between:

```text
Draft
Published
```

Additional operational states may be introduced only when justified by implementation requirements.

The administrator uploads:

```text
Watermarked Preview

and

One or more original/downloadable files
```

Publishing should require the minimum data necessary for a valid customer-facing Footage.

---

## 20. Blog

The platform requires a lightweight blog primarily for SEO and useful content.

V1 does not require a sophisticated rich-text editing system.

Blog content may use Markdown.

A Blog Post should support at least:

- title;
- slug;
- excerpt;
- content;
- cover image where applicable;
- SEO title;
- SEO description;
- publication state/date.

The implementation should prioritize simplicity and maintainability over advanced editor functionality.

---

## 21. SEO

SEO is important for both the Footage catalog and blog.

Public pages should be designed so search engines can meaningfully discover and index appropriate content.

Relevant surfaces include:

```text
Home
Footage pages
Category pages
Search/browse landing surfaces where appropriate
Blog posts
```

Technical SEO implementation is defined separately from this product document.

---

## 22. UI and Design

Storefront UI is a first-class part of the product.

UI decisions should not be invented independently by implementation agents when an approved design contract exists.

The project should maintain a lightweight design-as-code workflow.

Design documentation may include:

```text
docs/design/
  foundations/
  components/
  pages/
```

The design process should define reusable components and page contracts before or alongside implementation.

Important early surfaces include:

- Home;
- Search / Browse;
- Footage Card;
- Footage Detail;
- Video Preview;
- Buy Now;
- Authentication;
- User Library;
- Download UI;
- Admin Footage management.

The storefront and administration interface may use different visual priorities.

The storefront should prioritize discovery and media presentation.

The administration interface should prioritize speed, clarity, and operational usability.

---

## 23. V1 Explicitly Out of Scope

The following are explicitly out of scope unless a later approved decision changes this document:

- shopping cart;
- discounts;
- coupon codes;
- subscriptions;
- contributor accounts;
- user-uploaded footage;
- creator payouts;
- marketplace commissions;
- multi-admin RBAC;
- automated watermark generation;
- automated video transcoding pipeline;
- recommendation engine;
- dedicated external search engine as a product requirement;
- multiple languages;
- mobile application;
- After Effects assets;
- pricing per video quality;
- separate purchase of individual quality variants.

AI agents must not implement these capabilities opportunistically.

---

## 24. Known Future Possibilities

The following are known possibilities, not V1 commitments:

- After Effects projects;
- additional digital asset types;
- automated preview generation;
- automated watermarking;
- automated metadata extraction;
- more advanced search;
- richer filtering;
- shopping cart;
- discounts and campaigns;
- contributors;
- multiple administrators and roles;
- analytics;
- recommendation/personalization.

Future possibilities must not cause unnecessary V1 abstractions without an approved architecture decision.

---

## 25. Product Engineering Principles

V1 optimizes for:

```text
Fast delivery
+
Correct critical flows
+
Simple architecture
+
AI-friendly repository
+
Approximately one-year maintainability
```

It does not optimize for hypothetical massive future scale.

The project should avoid both:

```text
throwaway prototype architecture
```

and:

```text
premature enterprise architecture
```

Critical areas such as payment verification, purchase ownership, protected downloads, authentication, invoices, and administrative authorization must remain robust even when the surrounding implementation is intentionally simple.

---

## 26. AI Agent Rules for Product Ambiguity

This document is authoritative for V1 product scope.

AI coding agents must not invent business behavior when a requirement is ambiguous.

Examples of decisions an agent must not invent include:

- download limits;
- refund policy;
- additional licensing restrictions;
- discount rules;
- new administrator roles;
- file-retention policy;
- payment recovery behavior;
- automatic asset deletion;
- new pricing models;
- additional purchase restrictions.

When implementation requires an undefined business decision, the agent must stop and report the ambiguity.

The appropriate process is:

```text
Ambiguity
   ↓
Human / Architecture Decision
   ↓
PROJECT / ADR / Instruction update when necessary
   ↓
Implementation
```

---

## 27. Source of Truth

Product scope:

```text
docs/PROJECT.md
```

Architecture decisions:

```text
docs/adr/*
```

Implementation roadmap:

```text
docs/ROADMAP.md
```

Engineering and AI rules:

```text
AGENTS.md
instructions/*
```

Implementation agents must use these canonical sources instead of creating competing project rules inside tool-specific configuration.
