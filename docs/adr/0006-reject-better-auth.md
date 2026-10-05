# ADR-0006: Reject Better Auth for Phone-Only Authentication

- **Status:** Accepted
- **Date:** 2026-10-01

## Context

ADR-0003 requires customer identity to be a unique normalized Iranian mobile phone number, with OTP sign-in and an HttpOnly browser session. It names Better Auth as the primary library candidate and requires a bootstrap check before adoption. That check must reject the library if phone-only identity needs fake or meaningless customer email data, or if the library adds significant accidental complexity.

AUTH-01 performed that check against the current stable release and the official documentation, without installing Better Auth into this application.

Evidence date: 2026-10-01.

Inspected release:

- `better-auth@1.7.7`
- `@better-auth/core@1.7.7`
- Better Auth CLI source at tag `v1.7.7`

The published packages were downloaded and inspected outside this repository. They were not added as application dependencies.

Authoritative references:

- [Email](https://better-auth.com/docs/concepts/email)
- [Phone Number](https://better-auth.com/docs/plugins/phone-number)
- [Database](https://better-auth.com/docs/concepts/database)
- [Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Cookies](https://better-auth.com/docs/concepts/cookies)
- [CLI](https://better-auth.com/docs/concepts/cli)
- [Issue #9124](https://github.com/better-auth/better-auth/issues/9124)

This repository's database baseline is Prisma ORM 7.10.0 with PostgreSQL, from the in-progress DATA-01 setup. Better Auth declares optional peers `prisma` and `@prisma/client` at `^5 || ^6 || ^7`, and the 1.7.7 CLI can emit a Prisma 7 schema (`provider = "prisma-client"`, no `url` in the datasource). Prisma 7 compatibility is not the reason for rejection.

## Decision

Better Auth is rejected for Vidora customer authentication.

Customer authentication will be a small application-owned phone OTP and server-side session implementation inside the existing Next.js monolith. PostgreSQL through Prisma remains the system of record.

The product contract in ADR-0003 is unchanged.

## Evidence

### Core schema

`getAuthTables` in `@better-auth/core@1.7.7` defines these models:

| Model          | Required fields                                                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`         | `name`, `email` (unique), `emailVerified`, `createdAt`, `updatedAt`. `image` is optional.                                                                                                                  |
| `session`      | `expiresAt`, `token` (unique), `createdAt`, `updatedAt`, `userId`. `ipAddress` and `userAgent` are optional. Omitted only when secondary storage is configured and database session storage is not forced. |
| `account`      | `accountId`, `providerId`, `userId`, `createdAt`, `updatedAt`, plus optional OAuth and password columns. Always present.                                                                                   |
| `verification` | `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`. Omitted only when secondary storage is configured and `verification.storeInDatabase` is not set.                                             |

`user.email` is hardcoded `required: true` and `unique: true`. The same file says dropping that constraint is a v2 change. The runtime user schema is `email: z.string()` and `name: z.string()`. `image` is the only nullable core profile field.

Supported schema customization renames tables and columns (`modelName`, `fields`) and adds `additionalFields`. It does not provide a supported way to remove `email` or `name`, or to make them optional.

The official email documentation states that email is required for all users regardless of authentication method.

On 2026-07-28, a Better Auth maintainer wrote on issue #9124 that every user is assumed to have a unique email, that users with no email are unsupported, and that changing this is a v2 architectural change rather than a patch or minor release. Issue #9124 was still open on the evidence date. The 1.7.7 source still contains the v2 TODO.

### Phone-number plugin

The plugin adds two optional user fields:

- `phoneNumber`: optional, unique string
- `phoneNumberVerified`: optional boolean

Phone number is not the core identity. Email remains the required unique user key. A unique optional phone column does not stop multiple users from having no phone, and it does not replace the email requirement.

Automatic signup is `signUpOnVerification`. The 1.7.7 types and docs require `getTempEmail`. The verify route writes:

- `email` from `getTempEmail(phoneNumber)`
- `name` from `getTempName(phoneNumber)`, or the phone number when `getTempName` is omitted
- `phoneNumber` from the request string
- `phoneNumberVerified: true`

There is no phone-signup path that leaves email and name unset. The plugin's own type comment says a temporary email has to be created to sign the user up.

`phoneNumberValidator` returns a boolean. It does not transform the number. Lookup and storage use the submitted string. Equivalent Iranian forms would become different users unless every plugin entry point normalized them first. The library lowercases email and does not canonicalize phone numbers.

Enabling the plugin registers all of these endpoints:

- `POST /phone-number/send-otp`
- `POST /phone-number/verify`, including `updatePhoneNumber: true`
- `POST /sign-in/phone-number` (phone and password)
- `POST /phone-number/request-password-reset`
- `POST /phone-number/reset-password`

`update-user` can also set `phoneNumber` to `null`, which clears the number and its verified flag. ADR-0003 forbids inventing an account phone-number change flow and forbids adding password authentication. Mounting this plugin would expose both.

The plugin's own defaults are OTP length 6, expiry 300 seconds, and 3 attempts, plus a plugin rate limit of 10 requests per 60 seconds on `/phone-number` paths. Those are library defaults. They are not Vidora policy.

### OTP and session behavior

Phone OTP storage uses the shared `verification` model. `send-otp` stores `value` as the plaintext string `` `${code}:0` `` and `identifier` as the submitted phone number, unless `verification.storeIdentifier` hashes identifiers. Verification splits that value, compares the code with plain inequality, increments the attempt suffix, and deletes the row on success. The code is not hashed.

Successful verification resolves the user by the stored phone string, creates one on first success only when `signUpOnVerification` is configured, then calls `createSession`. The session row stores the raw session token. The response body also returns that token. The session cookie is `httpOnly: true`, `sameSite: "lax"`, and `secure` when production or HTTPS cookie mode is active. The default session cookie lifetime is 7 days unless `session.expiresIn` is set.

That cookie transport matches ADR-0003. It does not offset the identity-model mismatch. Secondary storage, including the documented Redis integration, is optional. This decision does not adopt it. The repository architecture rule does not allow Redis without a new architectural decision.

### Schema generation

`auth generate` writes Better Auth models into `prisma/schema.prisma`. On Prisma 7 it can keep `provider = "prisma-client"` and leave the database URL in `prisma.config.ts`. It still owns `User`, `Session`, `Account`, and `Verification`, including the required email and name columns and the optional phone columns.

Do not run Better Auth CLI schema generation before DATA-02, or at all, for this application. DATA-02 must author the application schema through the normal Prisma migration workflow.

## Selected approach

Implement only the ADR-0003 flow:

```text
Enter phone number
        ↓
Normalize to the canonical Iranian mobile form
        ↓
Request OTP
        ↓
Send OTP through the SMS provider boundary
        ↓
Submit OTP
        ↓
Verify OTP
        ↓
Resolve or create User by that canonical phone
        ↓
Create a new server-side session
        ↓
Set an HttpOnly session cookie
```

Normalization rules belong to AUTH-02. OTP request behavior belongs to AUTH-03. Verification and session creation belong to AUTH-04. Customer versus admin authorization belongs to AUTH-05.

### Persistence

DATA-02 should add only these authentication models, plus any administrative identity that task separately requires:

```text
User
  id
  canonical phone, required and unique
  createdAt
  updatedAt

OtpChallenge
  id
  canonical phone
  code hash
  expiresAt
  attempt count
  createdAt

Session
  id
  userId
  secret hash
  expiresAt
  createdAt
```

Constraints:

- `User` has no email column and no required name column.
- The canonical phone is the customer identity. AUTH-02 defines the exact stored format. DATA-02 must not invent a second phone representation.
- The OTP code is stored only as a one-way hash. Logs and API responses must not contain the code.
- A successful verification consumes the challenge so the same code cannot be reused.
- The cookie contains the raw session secret. The database stores only a hash of that secret.
- Session lookup must use that hash.
- Successful authentication creates a new session secret. Do not reuse a pre-authentication cookie value.
- Do not add an `Account` model, a password hash, an OAuth token table, or a Better Auth `verification` table.
- Use one ID strategy for these rows. Do not introduce a second identifier scheme for authentication.
- Do not add a customer role column as a substitute for the admin boundary.

AUTH-03 adds `OtpRequestEvent` for the rolling phone and IP request limits. `OtpChallenge` does not store a client IP, and an in-memory counter would not hold across application instances. The table is only that OTP request-rate record. It is not a generic rate-limit framework and it is not a Better Auth model.

Footage, commerce, and other product models stay in their own roadmap phases.

### Browser session

- HttpOnly cookie.
- `Secure` in production.
- `SameSite=Lax`.
- The secret is not stored in `localStorage` and is not a JWT or refresh-token pair.
- The session survives normal navigation and reload because the server resolves the cookie to a stored session.

OTP request policy is defined in `instructions/security.md`: a 6-digit code, a 5-minute lifetime, a 60-second resend cooldown, 5 verification attempts per challenge, 5 requests per canonical phone per rolling hour, and 20 requests per client IP per rolling hour. Codes are stored as HMAC-SHA256 digests keyed by `OTP_HASH_SECRET`. A successful send supersedes older unconsumed, unexpired challenges for that phone. AUTH-04 must select the active challenge with the rule in `instructions/security.md` and must not accept an older code after that supersession. Session lifetime is an absolute 30 days, defined in `instructions/security.md`. It is not Better Auth's 7-day default, and a request does not extend it.

### Boundaries

- SMS delivery stays behind the narrow `SmsProvider.sendOtp(...)` boundary from ADR-0003. No provider is integrated by this decision.
- Customer session checks and admin authorization stay separate.
- No phone-number change, account recovery, password sign-in, email sign-in, or social login.
- No Redis, queue, or separate auth service.
- Login CSRF for `POST /api/auth/otp/verify` is the Origin allowlist in `instructions/security.md`. `SameSite=Lax` remains on the session cookie. Do not disable framework protections, and do not replace this check with an application-wide CSRF framework unless a later requirement says so.

## Consequences

### Positive

- Customer identity is the canonical phone number, with a database unique constraint.
- No synthetic email or name is stored.
- The schema does not add Better Auth's `Account` or `verification` models. Customer authentication persistence is `User`, `OtpChallenge`, `Session`, and the narrow `OtpRequestEvent` rate record added for OTP request limits.
- OTP codes and session secrets are not stored in recoverable form.
- Password, phone-change, and OAuth routes are not exposed.
- Later domain tables can reference `User` without coupling to a generated auth schema.

### Negative

- Session creation, cookie attributes, OTP storage, and abuse limits are application code rather than a maintained auth framework.
- OTP request limits and the absolute 30-day session lifetime are defined in `instructions/security.md`. A request does not extend that lifetime.
- The canonical phone string is `+989XXXXXXXXX`. AUTH-02 defines it, and `instructions/security.md` documents the validation rules. DATA-02 must store that format and must not choose a competing representation.

## AI Agent Constraints

AI agents must not:

- add `better-auth` or `@better-auth/prisma-adapter` unless a later ADR reopens this decision;
- run `auth generate` or `auth migrate` against this schema;
- add a customer email or name column to satisfy an auth library;
- store plaintext OTP codes or raw session secrets in the database;
- mount phone-password, password-reset, or phone-number-change endpoints;
- copy Better Auth default OTP or session durations into Vidora;
- introduce Redis or a JWT session architecture for this flow.
