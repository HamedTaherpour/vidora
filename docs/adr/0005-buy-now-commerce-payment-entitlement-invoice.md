# ADR-0005: Buy Now Commerce, Payment, Entitlement, and Invoice

- **Status:** Accepted
- **Date:** 2026-09-28

## Context

V1 intentionally uses a simple commerce model.

Each Footage:

- has one administrator-defined price;
- is purchased individually;
- unlocks all downloadable file variants covered by the purchase policy.

V1 does not include:

- a shopping cart;
- discounts;
- coupon codes;
- subscriptions;
- separate pricing per resolution or file quality.

Customers must authenticate before completing a purchase.

A successful purchase must remain associated with the customer's account so that the customer can return later and download purchased Footage again.

The system also requires a durable invoice/receipt that can be used during customer-support interactions.

## Decision

V1 uses a **single-item Buy Now checkout flow**.

Conceptually:

```text id="1pm6j2"
Footage
   ↓
Buy Now
   ↓
Authenticate if necessary
   ↓
Create Order
   ↓
Create Payment
   ↓
Redirect to Payment Provider
   ↓
Provider Callback
   ↓
Server-Side Payment Verification
   ↓
Complete Purchase
   ↓
Create Entitlement
   ↓
Create / Finalize Invoice
   ↓
Footage Available in User Library
```

## Order Model

Every purchase attempt that reaches the appropriate checkout stage is represented by an `Order`.

Although a V1 checkout contains only one Footage, the model must preserve the distinction between:

```text id="14sx16"
Order
  ↓
OrderItem
```

rather than placing a direct `footageId` field on `Order` as the only purchased-item representation.

This introduces little complexity while preserving a clean commerce model.

It also avoids unnecessary schema redesign if a cart is introduced in the future.

This does **not** mean that a cart should be implemented in V1.

## Price Ownership

Each Footage has one current price.

Individual Footage files or qualities do not have independent purchase prices.

The amount charged for an Order must be determined on the server.

Client-submitted monetary values must never be trusted as authoritative pricing.

## Historical Snapshots

Commerce history must remain stable even when catalog data changes later.

`OrderItem` must therefore snapshot relevant purchase-time information.

At minimum:

```text id="25xoe6"
footageId
titleSnapshot
priceSnapshot
```

The stored monetary representation must follow the project's documented money-unit convention.

If the administrator later changes:

- Footage title;
- current Footage price;

an existing Order or Invoice must not change historically.

## Money Representation

Monetary values must use integer-safe storage.

Floating-point monetary storage is prohibited.

The approved durable money convention is:

- canonical business and storage unit: **Toman**;
- monetary values are stored as **integers**.

Example: `120000` means 120,000 Toman.

The application UI displays prices in Toman and matches the stored unit in V1.

If a payment provider requires another unit, convert explicitly at the payment-provider boundary only. Do not convert catalog or order money to Rial in persistence.

AI agents must not infer or silently implement a Rial/Toman conversion rule outside that provider boundary.

## Payment Provider Boundary

The application will use an Iranian payment provider.

Provider-specific integration must sit behind a narrow application boundary.

Conceptually:

```text id="b2o57x"
PaymentProvider

createPayment(...)
verifyPayment(...)
```

The initial implementation may use ZarinPal.

This boundary exists because payment providers are external infrastructure and may change.

It must not grow into an unnecessary generic payment framework.

## Payment Creation

Payment creation must be based on server-authoritative Order information.

The server must determine:

- customer;
- Order;
- amount;
- callback context;
- relevant payment metadata.

The browser must not be able to change the authoritative purchase amount.

## Payment Callback

A browser redirect or provider callback is not, by itself, proof of successful payment.

The application must perform the selected provider's server-side payment verification before marking the purchase as successful.

The following is prohibited:

```text id="t57zxv"
Provider redirects with success=true
          ↓
Immediately grant download access
```

The required model is:

```text id="25xv3x"
Provider Callback
       ↓
Resolve Payment / Order
       ↓
Server-Side Provider Verification
       ↓
Verification Successful?
       ↓
Complete Purchase
```

## Payment Records

The application must retain enough payment information for support, reconciliation, and idempotent verification.

Relevant fields may include:

```text id="yhzef6"
provider
amount
status
providerAuthority
providerReferenceId
createdAt
verifiedAt
```

The exact schema depends on the selected provider.

Sensitive provider information must not be logged unnecessarily.

## Idempotency

Payment callbacks and verification requests may be repeated.

Purchase completion must therefore be idempotent.

Repeated successful verification must not create:

- duplicate entitlements;
- duplicate invoices;
- inconsistent Order states;
- duplicate purchase side effects.

The implementation must explicitly test this behavior.

## Purchase Completion Consistency

The system must avoid partially completed successful purchases.

Conceptually, the following state changes belong to one purchase-completion operation:

```text id="o8x2hd"
Verified Payment
      ↓
Order becomes paid
      ↓
Entitlement becomes available
      ↓
Invoice becomes available
```

Database transaction boundaries must be evaluated during implementation.

External provider verification itself must not be incorrectly treated as a database transaction.

## Entitlement

A successful verified purchase creates durable evidence that:

```text id="r8isqv"
User X
is entitled to access
Footage Y
```

Entitlement is an application/database concept.

It must not be represented only by:

- a payment callback;
- an invoice;
- browser state;
- a signed download URL;
- download history.

Protected download authorization must consult the authoritative purchase/entitlement state.

## User Library

Purchased Footage must remain available in the authenticated customer's library.

Logging out, changing browser, or changing device must not remove the purchase.

V1 does not define:

- subscriptions;
- time-limited access;
- arbitrary download-count limits.

AI agents must not introduce these restrictions.

## Access to File Variants

Purchasing a Footage grants access to the downloadable file variants covered by the product's purchase policy.

The following rule remains intentionally unresolved:

> If the administrator adds a new downloadable file or quality to a Footage after a customer has already purchased it, does the previous purchaser automatically gain access to that newly added file?

This decision must be resolved before implementation depends on it.

AI agents must not infer an answer.

## Invoice Requirement

Every successful purchase requires a durable invoice/receipt record.

The Invoice must correspond to:

```text id="42aqqe"
Order
+
Verified Payment
```

An Invoice must not exist as the sole authoritative proof of purchase.

The database purchase state remains authoritative.

## Invoice Number

Each Invoice must have a unique customer/support-facing identifier.

The identifier must be:

- unique;
- stable;
- searchable from the Admin interface;
- suitable for communication with customer support.

The exact format is an implementation decision.

Do not expose an internal auto-incrementing database identifier as the only customer-facing invoice identity unless explicitly approved.

## Invoice Data

An invoice must contain enough information to identify the historical purchase.

At minimum:

- invoice number;
- order reference;
- purchase date;
- purchased Footage title snapshot;
- purchase amount snapshot;
- masked customer phone number;
- relevant payment reference;
- verified payment/purchase status as appropriate.

Historical invoice information must come from purchase-time snapshots rather than mutable current catalog values.

## Invoice Retrieval

A customer must be able to retrieve invoices for previous purchases from their account.

The Admin/support interface must also be able to locate the corresponding transaction.

## Customer Support Verification

Possession of an Invoice PDF, screenshot, or invoice number alone does not prove ownership of the customer account.

For support purposes, a purchase should be verifiable using appropriate evidence such as:

```text id="g1xggd"
Invoice Number
+
Verified Customer Account / Phone
```

Provider payment reference information may be used as additional evidence where necessary.

Support processes must not treat a forwarded invoice screenshot as sufficient authentication.

## Invoice Rendering

V1 requires a downloadable or printable customer invoice.

The exact rendering mechanism may be:

- generated PDF;
- printable HTML with an export mechanism;
- another simple deterministic representation.

The implementation should choose the simplest approach that satisfies the actual business/legal requirement.

The Invoice's historical data must remain deterministic regardless of rendering mechanism.

## Official Invoice Requirements

The business requires an official invoice, but the exact legal/tax fields required for production have not yet been fully defined in this project specification.

Before production launch, the business owner must confirm required information such as applicable:

- seller legal identity;
- registration information;
- tax information;
- customer information;
- legally required invoice fields.

AI agents must not invent legal or tax requirements.

This uncertainty does not block initial application architecture or general invoice modeling, but it blocks declaring the production invoice feature legally complete.

## Refunds

Refund business rules are not currently defined.

V1 must not introduce a full refund subsystem without an approved requirement.

The schema should avoid obviously preventing future refund support, but speculative refund architecture must not be built.

AI agents must not infer refund eligibility or behavior.

## No Shopping Cart

V1 explicitly does not include a shopping cart.

Do not create:

- Cart models;
- CartItem models;
- cart state management;
- multi-item checkout UI.

The existence of `OrderItem` does not imply that a cart exists.

## No Discounts

V1 explicitly does not include:

- discounts;
- coupon codes;
- promotional campaigns;
- sale prices;
- discount engines.

The purchase price is the server-authoritative Footage price snapshotted for the Order.

## Security Requirements

The commerce flow must ensure that:

- customers cannot submit authoritative prices;
- payment callbacks cannot grant access without verification;
- one customer's purchase cannot authorize another customer's download;
- Invoice identifiers are not treated as authentication credentials;
- payment-provider secrets remain server-side;
- protected download authorization relies on authenticated entitlement.

A critical expected behavior is:

```text id="0q80mb"
User A purchases Footage X

User B requests an original file of Footage X

Result:
Access denied
```

This behavior requires automated test coverage.

## Consequences

### Positive

- very simple customer checkout;
- clean historical purchase records;
- reliable support lookup;
- durable purchase entitlement;
- payment-provider logic remains isolated;
- future cart support would not require replacing the fundamental Order/OrderItem model.

### Negative

- an `OrderItem` model exists even though V1 purchases are single-item;
- payment completion requires careful idempotency and transaction handling;
- legally complete invoice requirements must still be confirmed before launch.

## AI Agent Constraints

AI agents must not:

- add a shopping cart;
- add discounts or coupon infrastructure;
- trust client-provided prices;
- grant purchase access based solely on callback query parameters;
- skip server-side payment verification;
- create duplicate side effects on repeated payment verification;
- derive historical invoices from current Footage prices;
- treat Invoice possession as customer authentication;
- invent refund rules;
- invent download-count limits;
- invent Rial/Toman conversion behavior;
- decide whether future Footage files are granted to previous purchasers without an approved product decision.

If payment, entitlement, invoice, or legal behavior is ambiguous, the agent must stop and report the ambiguity before implementation.
