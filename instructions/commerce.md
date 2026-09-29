# Commerce Instructions

Read this file for tasks involving:

- Footage pricing;
- Buy Now;
- Orders;
- OrderItems;
- Payments;
- payment callbacks;
- payment verification;
- purchase completion;
- Entitlements;
- User Library;
- Invoices;
- protected purchase access.

Also read ADR-0005.

---

# 1. V1 Commerce Model

V1 intentionally uses a simple commerce model.

A customer purchases one Footage at a time through Buy Now.

V1 does not include:

- shopping cart;
- coupons;
- discounts;
- promotional campaigns;
- subscriptions;
- separate pricing per file quality;
- contributor payouts;
- marketplace commissions.

Do not build infrastructure for these features.

---

# 2. Footage Price

Each Footage has one current price.

The price is controlled by the server-side catalog state.

The browser may display a price, but browser-submitted price is never authoritative.

The server must resolve the authoritative Footage price when creating an Order.

---

# 3. Money

Never use floating-point values for persisted monetary amounts.

Before commerce schema implementation, the project must explicitly define:

- canonical database monetary unit;
- storefront display unit;
- payment-provider monetary unit;
- conversion boundary if conversion is required.

The storefront is expected to display prices in Toman.

Do not infer Rial/Toman conversion behavior.

Do not scatter monetary conversion across UI and payment code.

If conversion is required, define one deliberate boundary.

---

# 4. Buy Now

The V1 purchase flow is:

```text id="kzvvkt"
Footage
   ↓
Buy Now
   ↓
Authenticated Customer
   ↓
Create Order
   ↓
Create Payment
   ↓
Payment Provider
```

If authentication is required before continuing, preserve the intended purchase context without creating a shopping-cart system.

Do not introduce Cart or CartItem models.

---

# 5. Order

An Order represents a purchase attempt.

The Order must belong to the authenticated customer.

Do not allow the browser to choose another customer identity.

Order state transitions must be explicit.

Do not infer successful purchase merely from redirect state.

---

# 6. OrderItem

Although V1 Buy Now contains one Footage, the purchase is represented through:

```text id="e1r4dr"
Order
  ↓
OrderItem
```

An OrderItem must snapshot relevant purchase-time data.

At minimum:

- Footage identity;
- Footage title;
- purchase price.

Additional snapshot fields should only be added when required for historical correctness.

The existence of OrderItem does not authorize implementation of a shopping cart.

---

# 7. Historical Integrity

Historical commerce records must not change when current catalog data changes.

Example:

```text id="c77u7z"
Purchase date:
Footage price = 1,000,000

Later:
Admin changes current price to 1,500,000
```

The historical Order and Invoice must still represent the original purchase amount.

Do not generate historical commerce information from mutable current Footage values.

---

# 8. Payment Provider

Provider integration must use the approved narrow payment boundary.

Conceptually:

```text id="7zc0gv"
PaymentProvider

createPayment(...)
verifyPayment(...)
```

Provider-specific SDK/API behavior belongs in the provider implementation.

Do not spread provider-specific logic across:

- UI;
- Orders;
- Invoices;
- Downloads;
- unrelated modules.

---

# 9. Payment Creation

A payment must be created from authoritative server-side Order data.

Before requesting payment, ensure the relevant Order is valid for the authenticated customer and expected purchase flow.

Do not trust:

- client amount;
- client price;
- client payment status;
- arbitrary client Order ownership claims.

---

# 10. Payment Callback

A payment-provider callback or browser redirect is not proof of successful payment.

Never implement:

```text id="5hvgns"
callback says success
       ↓
Order = PAID
```

Required conceptual flow:

```text id="41dhn5"
Provider Callback
       ↓
Resolve Payment / Order
       ↓
Server-Side Provider Verification
       ↓
Validate Verification Result
       ↓
Complete Purchase
```

---

# 11. Payment Verification

Verification must use the payment provider's authoritative server-side mechanism.

Where applicable, verify relevant invariants such as:

- expected Order;
- expected payment record;
- expected amount;
- provider authority/reference;
- verification status.

Provider-specific semantics must be understood before implementation.

Do not guess how provider status codes behave.

---

# 12. Failed Verification

Failed or uncertain payment verification must not grant purchase access.

Do not create an Entitlement because:

- customer returned from payment page;
- callback contains a success-like query parameter;
- UI says payment succeeded;
- browser reports a transaction reference.

When verification is uncertain, preserve diagnosable payment state without granting protected access.

---

# 13. Idempotency

Payment callbacks and verification may happen more than once.

Purchase completion must be safe under repetition.

Repeated successful verification must not create:

- duplicate Entitlements;
- duplicate Invoices;
- duplicate OrderItems;
- inconsistent Order states;
- duplicate side effects.

Do not implement idempotency solely with a race-prone read-then-create pattern when database constraints or transactions are required.

---

# 14. Purchase Completion

After successful provider verification, purchase completion establishes durable application state.

Conceptually:

```text id="0hfxqe"
Verified Payment
      ↓
Order becomes paid
      ↓
Entitlement exists
      ↓
Invoice exists
```

These dependent database changes must preserve consistency.

Use an appropriate database transaction for database-side completion where necessary.

Do not keep external network verification calls inside unnecessarily long database transactions.

---

# 15. Entitlement

Entitlement represents durable permission for a customer to access purchased Footage.

Conceptually:

```text id="xsmz71"
Customer
   +
Footage
   =
Purchase Entitlement
```

Entitlement is not equivalent to:

- Payment callback;
- Invoice;
- signed URL;
- download history;
- local browser state.

The database is authoritative.

---

# 16. Entitlement Uniqueness

The schema and completion logic must prevent accidental duplicate entitlement state where the product model expects one durable purchase access relationship.

Exact uniqueness constraints must follow the final schema and purchase semantics.

Do not rely solely on UI behavior to prevent duplicates.

---

# 17. User Library

The User Library derives from durable customer purchase/entitlement state.

It must survive:

- logout;
- browser restart;
- device change;
- later return to the application.

Do not store purchase ownership only in client state.

---

# 18. Protected Downloads

A customer may access protected original files only after server-side entitlement verification.

Download authorization must not depend solely on:

- Order ID;
- Invoice number;
- Payment reference;
- Footage ID;
- file ID;
- previous download history.

Read `instructions/media.md` for file delivery.

---

# 19. Files Added After Purchase

The following business rule is intentionally unresolved:

> If a new downloadable file or quality is added to a Footage after a customer purchased it, does the previous customer receive access to the new file?

Do not infer the answer.

If implementation requires this decision, stop and report it.

---

# 20. Download Limits

V1 currently has no approved download-count limit.

Do not introduce:

- one-time downloads;
- maximum download counts;
- expiration of purchase entitlement;

without an explicit product decision.

Signed URL expiration is a security mechanism and is not a purchase expiration rule.

---

# 21. Invoice

A successful purchase requires a durable Invoice/receipt record.

The Invoice is linked to historical purchase and verified payment information.

It is not the sole source of truth for purchase entitlement.

---

# 22. Invoice Historical Data

Invoice rendering must use historical purchase data.

Do not use current:

- Footage title;
- Footage price;

when those values have changed since purchase.

Relevant historical values must come from the Order/OrderItem snapshot or other deliberate immutable purchase data.

---

# 23. Invoice Number

Each Invoice must have a stable unique support-facing identifier.

The identifier must be searchable by Admin/support.

Do not treat possession of the identifier as authentication.

Do not expose an internal database sequence as the only customer-facing identifier unless explicitly approved.

---

# 24. Invoice and Customer Support

Support verification may use information such as:

```text id="udwnn2"
Invoice Number
+
Verified Customer Account / Phone
```

Payment reference may provide additional evidence.

A screenshot or forwarded Invoice alone does not prove account ownership.

---

# 25. Official Invoice Fields

The exact legal/tax fields required for the production Invoice are not yet fully defined.

Do not invent:

- tax identifiers;
- legal registration data;
- mandatory tax wording;
- regulatory fields.

The business owner must confirm these before the Invoice feature is considered production-legally complete.

---

# 26. Refunds

Refund policy is unresolved.

Do not implement:

- automatic refunds;
- refund eligibility;
- refund windows;
- entitlement revocation after refund;

without an approved product rule.

If schema design encounters refund-related uncertainty, avoid obviously blocking future evolution but do not build a speculative refund subsystem.

---

# 27. Purchase of the Same Footage Again

The product behavior for intentionally purchasing the same Footage multiple times must be explicitly defined if implementation reaches that scenario.

Do not silently:

- allow duplicate purchases;
- reject duplicate purchases;
- redirect directly to the Library;

unless the approved product behavior defines it.

This is a product decision, not merely a database decision.

---

# 28. Concurrent Requests

Commerce behavior must remain correct when requests are repeated or concurrent.

Particular attention is required for:

- payment callback duplication;
- simultaneous verification requests;
- Entitlement creation;
- Invoice creation.

Use database constraints and transactions where appropriate.

---

# 29. Logging

Commerce logs may include safe identifiers such as:

- internal Order ID;
- Payment ID;
- provider name;
- safe provider reference where appropriate;
- verification outcome.

Do not log:

- provider secrets;
- full sensitive credentials;
- unnecessary customer-sensitive data.

---

# 30. Required Tests

Critical commerce behavior should include tests for relevant cases such as:

```text id="5ccegp"
Server price overrides client-controlled values

Failed payment verification
→ no Entitlement

Successful payment verification
→ paid Order + Entitlement + Invoice

Repeated successful verification
→ no duplicate side effects

User B
→ cannot access User A purchase
```

The exact test level should follow `instructions/testing.md`.

---

# 31. Stop Conditions

Stop and report instead of implementing when correctness depends on an unresolved rule involving:

- money unit/conversion;
- refunds;
- duplicate purchase behavior;
- access to files added after purchase;
- legal Invoice requirements;
- provider verification semantics.

Financial behavior must not be invented by an implementation agent.
