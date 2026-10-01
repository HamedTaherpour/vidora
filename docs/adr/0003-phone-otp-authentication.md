# ADR-0003: Phone OTP Authentication

- **Status:** Accepted
- **Date:** 2026-09-28

## Context

V1 serves Iranian users.

Customer authentication is intentionally simple:

```text
Iranian Mobile Number
+
One-Time Password (OTP)
```

A customer must be able to:

- create an account;
- sign in again later;
- purchase footage;
- access previous purchases;
- return on another device and regain access to their library.

Email/password authentication is not required for V1.

The system currently has a single administrator.

Customer authentication and administrative authorization must remain conceptually separate even though V1 does not require a general-purpose RBAC system.

## Decision

A customer's primary identity will be a unique normalized Iranian mobile phone number.

The conceptual authentication flow is:

```text
Enter Phone Number
        ↓
Request OTP
        ↓
Send OTP Through SMS Provider
        ↓
Submit OTP
        ↓
Verify OTP
        ↓
Resolve or Create User
        ↓
Create Session
```

Authentication will use browser-friendly sessions.

Session credentials must not be stored in `localStorage`.

Secure HttpOnly cookies are the preferred browser session transport.

## Authentication Implementation

A mature authentication library should be preferred over implementing a complete session system from scratch when the library fits the product requirements without introducing significant accidental complexity.

**Better Auth** is the primary candidate for project bootstrap.

Before adopting it, the bootstrap task must verify that its phone-number/OTP implementation can support the project's phone-only identity model cleanly.

In particular, the project must avoid introducing fake or meaningless customer email addresses merely to satisfy a library assumption unless that tradeoff is explicitly reviewed and accepted.

If Better Auth creates unnecessary complexity for the required phone-only model, a smaller alternative may be selected through an implementation decision or follow-up ADR.

AUTH-01 completed that check against Better Auth 1.7.7. The library does not support this phone-only model without a required email and name. ADR-0006 rejects Better Auth and selects the smaller application-owned OTP and session approach. The product contract defined by this ADR remains unchanged.

## OTP Requirements

An OTP must:

- expire after a short period;
- be valid only for its intended authentication purpose;
- have a verification-attempt limit;
- not be logged in plaintext;
- not remain valid after successful use;
- not be treated as a permanent credential.

Exact values for:

- OTP lifetime;
- resend cooldown;
- request limits;
- verification-attempt limits;

must be explicitly defined in the authentication/security instructions.

AI agents must not invent these values.

## SMS Provider

SMS delivery must sit behind a small provider boundary.

Conceptually:

```text
SmsProvider
  sendOtp(...)
```

The initial implementation may use Kavenegar.

Authentication/domain code should not depend directly on Kavenegar-specific APIs throughout the codebase.

The abstraction should remain narrow and should not become a generic messaging framework.

## Iranian Phone Number Normalization

Phone numbers must be normalized before identity lookup.

Possible user input may include forms such as:

```text
0912...
+98912...
98912...
```

The application must convert supported input into one canonical representation before persistence or identity comparison.

The canonical persisted representation is `+989XXXXXXXXX`.

Supported input is `09XXXXXXXXX`, `989XXXXXXXXX`, or `+989XXXXXXXXX`. Any other value is rejected. Validation rules are documented in `instructions/security.md`.

There must not be multiple user accounts representing the same mobile number in different textual formats.

## Customer and Administrator Separation

A valid customer session must not grant access to administrative routes or mutations.

V1 does not require a generic role/permission framework.

The minimum conceptual distinction is:

```text
Customer
Admin
```

The implementation should use the simplest mechanism that securely preserves this boundary.

A future multi-admin RBAC system must not be built in V1 without a new requirement.

## Abuse Protection

OTP authentication creates both security and financial-abuse risks because each SMS request can have a monetary cost.

The implementation must consider:

- OTP request throttling;
- verification-attempt limits;
- repeated resend abuse;
- phone-number enumeration;
- SMS cost amplification;
- session fixation;
- secure cookie configuration.

CAPTCHA is not a default V1 requirement.

It may be introduced later if actual abuse or threat analysis justifies it.

## Account Phone Number Changes

Changing the phone number associated with an existing account is not currently defined as a V1 product flow.

AI agents must not invent an account phone-number migration or recovery policy.

If this becomes necessary, the business and security behavior must be explicitly defined first.

## Consequences

### Positive

- low-friction authentication for the target Iranian audience;
- no password management;
- stable identity for purchases and user library;
- returning users can recover their purchase access through their phone-based account.

### Negative

- authentication availability depends partly on an SMS provider;
- SMS requests have monetary cost;
- abuse prevention is required;
- loss of access to the registered SIM card creates an account-recovery scenario that V1 does not currently define.

## AI Agent Constraints

AI agents must not:

- add email/password customer authentication;
- add social login;
- introduce a JWT/refresh-token architecture without a demonstrated requirement;
- store browser session credentials in `localStorage`;
- log OTP values;
- invent OTP expiry, cooldown, or rate-limit values;
- introduce a phone-number-change flow without an approved product decision;
- introduce generic RBAC for hypothetical future administrators.

If an authentication or account-recovery requirement is undefined, the agent must stop and report the ambiguity rather than inventing behavior.
