# ADR-0007: Separate Admin Identity and Session

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

ADR-0003 requires customer authentication by Iranian mobile OTP and requires that a valid customer session must not grant Admin access. V1 has a single administrator and must not introduce generic RBAC.

ADR-0006 deferred administrative identity while selecting the application-owned customer OTP and session approach. AUTH-05 must establish the Admin boundary without modeling Admin as a special `User` row or adding roles to Customer.

## Decision

Admin identity is separate from Customer `User`.

```text
Customer User  →  Session  →  vidora_customer_session
Admin          →  AdminSession  →  vidora_admin_session
```

### Persistence

- `Admin` stores only what Admin authentication needs: id, unique canonical phone, timestamps.
- `AdminSession` stores opaque session secret hashes with an absolute 30-day lifetime, matching customer session policy.
- `Admin.phone` uses the same canonical Iranian mobile form and PostgreSQL `CHECK` pattern as `User.phone`.
- The same phone value may exist independently on `User` and `Admin`. Matching phones do not link the identities.
- There is no public Admin signup. Admin rows are manually provisioned.
- V1 currently expects one administrator. The table may hold more than one Admin row without introducing permissions or RBAC.
- Do not add roles, permissions, password, email, or profile fields for Admin in V1.

### OTP

Customer and Admin reuse one `OtpChallenge` table and the same OTP policy numbers from `instructions/security.md`.

`OtpChallenge.purpose` distinguishes authentication context:

- `customer`
- `admin`

Invariants:

- A customer-purpose challenge cannot authenticate Admin.
- An admin-purpose challenge cannot authenticate a Customer.
- Cooldown, supersession, and active challenge selection are scoped by phone + purpose.
- Hourly phone and IP request limits remain shared across purposes because SMS cost is shared.
- Admin verification never creates an `Admin` row. The Admin must already be provisioned.
- Admin authentication never creates a Customer `User` or customer `Session`.
- Customer authentication never creates an `Admin` or `AdminSession`.

### Cookies and guards

- Customer cookie: `vidora_customer_session`
- Admin cookie: `vidora_admin_session`
- Cookie attributes match the approved session transport: HttpOnly, SameSite=Lax, Secure in production, Path=/, Max-Age 30 days, no Domain.
- `requireCurrentCustomer` and `requireCurrentAdmin` enforce server-side authorization. UI hiding is not a security boundary.
- Admin OTP verification uses the same Origin allowlist as customer OTP verification.

### Explicitly rejected

- Generic RBAC, roles, or permission tables
- Modeling Admin as a Customer role
- Automatic Customer creation from Admin login
- Automatic Admin access from Customer login
- Public Admin registration
- Hard-coded Admin phone numbers in source
- Duplicate OTP tables without a demonstrated need

## Consequences

### Positive

- Customer and Admin authorization boundaries are explicit and separately enforceable.
- Existing OTP request/verification machinery is reused without confusing purposes.
- Same-phone Customer and Admin accounts remain safe and unlinked.

### Negative

- Operators must manually provision Admin phones.
- Application code owns both session systems.
- Shared hourly OTP request limits mean Customer and Admin OTP requests for one phone compete for the same SMS budget.

## AI Agent Constraints

AI agents must not:

- add roles or permissions to `User` or `Admin`;
- treat a customer session as Admin authorization;
- treat an Admin session as a Customer session;
- authenticate Admin from a customer-purpose OTP, or the reverse;
- invent public Admin signup, invitation, or account-linking flows;
- introduce a second OTP policy or a generic rate-limit framework for Admin.
