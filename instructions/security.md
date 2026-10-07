# Security Instructions

Read this file for tasks involving:

- authentication;
- authorization;
- Admin functionality;
- payments;
- invoices;
- uploads;
- downloads;
- signed URLs;
- external callbacks;
- secrets;
- customer-controlled input.

Security controls must be proportional to actual risk.

Do not introduce enterprise security infrastructure without a concrete threat or requirement.

---

# 1. Trust Boundaries

Treat all browser-controlled data as untrusted.

This includes:

- form values;
- query parameters;
- route parameters;
- cookies that are not cryptographically/session validated;
- headers;
- file metadata supplied by the browser;
- prices supplied by the browser;
- payment callback parameters.

Validate and authorize server-side.

---

# 2. Authentication Is Not Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> May this user perform this operation?

A valid customer session does not authorize:

- Admin operations;
- another customer's purchases;
- arbitrary original downloads;
- arbitrary upload operations.

Authorization must be checked at the server boundary that performs the sensitive operation.

---

# 3. Client-Side UI Is Not a Security Boundary

Hiding a button does not protect an operation.

Example:

```text id="e4kpbq"
Customer does not own Footage
→ Hide download button
```

is useful UX but insufficient security.

The server must independently reject unauthorized download requests.

---

# 4. Admin Security

Administrative operations require explicit Admin authorization.

Normal customers must not gain Admin access through:

- direct URL navigation;
- calling a Server Action manually;
- calling a Route Handler directly;
- modifying client state;
- replaying browser requests.

V1 has one administrator and does not require generic RBAC.

Do not weaken the boundary because there is only one Admin.

Admin identity is separate from Customer `User` identity (ADR-0007):

- `Admin` persistence is not a `User` row and has no role column;
- `AdminSession` is separate from customer `Session`;
- cookie `vidora_admin_session` is separate from `vidora_customer_session`;
- customer authentication does not grant Admin access;
- Admin authentication does not create a Customer account;
- there is no public Admin signup; Admin phones are manually provisioned;
- the same canonical phone may exist independently on `User` and `Admin` without linking identities.

Server helpers `requireCurrentCustomer` and `requireCurrentAdmin` enforce these boundaries. An Admin session alone is not a Customer session, and a Customer session alone is not Admin authorization.

---

# 5. OTP Security

Approved OTP request policy:

- OTP code length: 6 digits.
- OTP lifetime: 5 minutes.
- Resend cooldown per canonical phone: 60 seconds.
- Maximum verification attempts per challenge: 5.
- Request limit per canonical phone: 5 requests per rolling hour.
- Request limit per client IP: 20 requests per rolling hour.

These numbers are application policy. They are not columns on `OtpChallenge`, and they are not copied from an authentication library. `failedAttemptCount` starts at 0. AUTH-04 enforces the 5-attempt limit. AUTH-03 does not verify codes or create sessions.

`OtpChallenge` persists the code only as an HMAC-SHA256 hex digest in `codeHash`. The key is `OTP_HASH_SECRET`, a required server-only environment variable of at least 32 characters. There is no plaintext OTP column. The digest is `HMAC-SHA256(OTP_HASH_SECRET, UTF-8 OTP code)`. Later verification must use that same function. Do not store or compare the plaintext code.

`purpose` is `customer` or `admin`. Customer and Admin share this table. Cooldown, supersession, and active selection are scoped by canonical phone + purpose. A customer-purpose challenge must not authenticate Admin, and an admin-purpose challenge must not authenticate a Customer. Hourly phone and IP request limits still count `OtpRequestEvent` rows across purposes because SMS cost is shared.

`consumedAt` records successful use; a non-null value invalidates that challenge. It is not how a replaced OTP is invalidated. A challenge can exist before the customer `User` row, so it has no user foreign key. An Admin challenge also has no admin foreign key; Admin must already be provisioned before Admin verification succeeds. An OTP request does not create a `User` or an `Admin`.

A resend inside the 60-second cooldown, while an unconsumed, unexpired, non-superseded challenge exists for the same phone and purpose, does not generate another OTP and does not send another SMS. Expired, consumed, and superseded challenges do not keep that cooldown. A reserved challenge (`sentAt` null) still keeps that cooldown. After 60 seconds a new challenge may be reserved even if an older unconsumed challenge has not expired. That reservation transaction commits before the SMS provider is called. Do not hold a database transaction open during the external SMS request.

`sentAt` is null on the reserved row. That pending row is not eligible for verification. It is still a non-failed challenge. While `expiresAt` is strictly after the verification time, it blocks every older challenge for that phone and purpose, including a previous delivered challenge. The block starts when the reservation commits, before the SMS provider is called. When the provider accepts the send, a later short write sets `sentAt` on that challenge and commits before any older challenge is changed. That write does not run while the SMS request is open. `sentAt` means the provider accepted this send. It does not mean the code was verified.

A following short transaction takes the same phone advisory lock as reservation and sets `supersededAt` on every previous unconsumed, unexpired challenge for that canonical phone and purpose whose `createdAt` is less than or equal to the delivered challenge. It does not run while the SMS request is open. The delivered challenge is not superseded. `supersededAt` is not cleared when the newer challenge is later consumed or expires. A challenge created after the one just sent is left unchanged. Challenges for the other purpose are left unchanged. Historical rows are retained. There is no cleanup policy.

If that supersede write fails after `sentAt` is stored, the request still counts as accepted. The newer challenge stays delivered. Every earlier challenge for that phone and purpose stays permanently ineligible because a newer row with `sentAt` set blocks it, including when `supersededAt` was not written and after the newer row is consumed or expires.

When the provider fails, delete the reserved challenge and do not set `sentAt` or `supersededAt`. Deletion matches only `sentAt` null, so a delivered challenge is not removed. After that delete, the previous delivered challenge may become eligible again. The `OtpRequestEvent` row is kept and still counts toward the hourly limits. If deleting the reserved challenge fails, that row can still impose cooldown and stays ineligible for verification, and it keeps blocking older challenges until it expires. Cooldown rejections and rate-limit rejections do not insert an event.

If the process stops after the provider may have accepted the SMS, or if `sentAt` cannot be stored, keep the pending row. Do not delete it and do not supersede previous challenges. The pending row stays ineligible until `sentAt` is committed. Every older challenge for that phone and purpose stays ineligible while that pending row is unexpired. The `sentAt` write failure fails the request. The event row remains. This prefers a period with no verifiable OTP over accepting an older OTP after a newer OTP may have been sent.

A pending row stops blocking when its `expiresAt` is at or before the verification time. Selection then uses the rest of this rule. The pending row does not become eligible on expiry. With the 5-minute lifetime, a pending resend created after the 60-second cooldown expires after the previous challenge, so that previous challenge is usually already expired when the pending row expires. A later successful request is how the customer obtains a new eligible challenge.

AUTH-04 must use this selection rule and must not invent another. `selectActiveOtpChallenge` in `src/modules/auth` implements it. Callers must pass only challenges for one phone and one purpose. A challenge is eligible only when all of these are true:

- `phone` is the canonical phone being verified;
- `purpose` matches the authentication context being verified;
- `sentAt` is set;
- `supersededAt` is null;
- `consumedAt` is null;
- `expiresAt` is strictly after the verification time;
- no newer non-failed challenge for that same phone and purpose blocks it.

A newer challenge has a later `createdAt`, or the same `createdAt` and the greater id. A row that still exists is non-failed. Explicit provider failure deletes the reserved row, so that attempt is absent and does not block.

A newer non-failed challenge blocks an older challenge in these cases:

- The newer row has `sentAt` set. That block remains after the newer row is consumed, expires, or has `supersededAt` set.
- The newer row has `sentAt` null and `expiresAt` strictly after the verification time. The pending row is never eligible. `consumedAt` and `supersededAt` on that pending row do not lift the block before expiry and do not make the pending row eligible. When its `expiresAt` is at or before the verification time, it no longer blocks.

If more than one eligible row exists, select the one with the latest `createdAt`. If `createdAt` ties, select the greater id and do not fall back to an earlier row. Compare the submitted code only with the selected challenge. Do not try an older code when that challenge does not match, is missing, is reserved, is consumed, is expired, or is superseded. A reserved row is never eligible. A row with `supersededAt` set is never eligible again. A block from a newer delivered row does not end. A block from a newer pending row ends when that pending row expires.

Verification compares the submitted code with `otpCodeMatchesHash` against that selected challenge only. A wrong code increments `failedAttemptCount` by 1. The count is not reset. The 5th wrong attempt stores 5. A challenge with `failedAttemptCount` greater than or equal to 5 is permanently unusable. That count is the exhaustion record. `consumedAt` stays reserved for successful verification and is not set when attempts are exhausted. A later correct code does not consume an exhausted challenge, does not increment the count further, and does not fall back to an older challenge.

Successful verification runs in one database transaction. It consumes the selected challenge by setting `consumedAt`, resolves the account for that purpose, and inserts the matching session. For customer purpose, it resolves or creates `User` and inserts `Session`. For admin purpose, it resolves an already-provisioned `Admin` and inserts `AdminSession`; it never creates `Admin`, `User`, or customer `Session`. The conditional consume requires the challenge to still be eligible and under the attempt limit, so two correct submissions cannot both consume it. The transaction takes the same phone advisory lock as OTP reservation before it reads challenges, and it locks that phone's challenge rows for the purpose being verified, so a resend cannot change eligibility during the check. `User.phone` and `Admin.phone` remain unique within their own tables. Creating the customer uses the `User` unique constraint, not a read-then-insert alone. No external call runs inside the transaction. A verification response does not say whether the `User` row was newly created.

`OtpRequestEvent` records each OTP send attempt that passed cooldown and rate checks: canonical phone, bounded client IP, and `createdAt`. The hourly phone and IP limits count these rows, so the limits hold across application instances. Phone and IP reservations take a PostgreSQL transaction advisory lock, in a stable key order, so concurrent requests cannot pass the same limit check before either insert is visible. The event row is kept when SMS sending fails. The reserved `OtpChallenge` (`sentAt` null) is removed so a failed send does not impose the resend cooldown. The failed attempt still consumes hourly quota.

Client IP is an explicit argument at the auth request boundary. The auth module does not read `Forwarded`, `X-Forwarded-For`, or `X-Real-IP`. The application is not deployed behind a documented trusted proxy, so those headers are untrusted. A missing or malformed address fails the request. The IP limit is only as strong as the address that boundary supplies.

OTP values must:

- expire;
- have attempt limits;
- not be logged in plaintext;
- not be returned in API responses;
- become invalid after successful use as required by the authentication design.

Do not log `codeHash`, `OTP_HASH_SECRET`, SMS credentials, or a provider body that echoes the message text. An OTP request must not reveal whether the phone already belongs to a `User`.

SMS delivery goes through `SmsProvider.sendOtp`. The initial provider is Kavenegar verify/lookup (`receptor`, `token`, `template`). `KAVENEGAR_API_KEY` and `KAVENEGAR_OTP_TEMPLATE` are server-only and are validated when that provider is constructed. Application boot does not require them. Do not log the lookup URL: the API key is in the path, and the provider response message can contain the OTP.

OTP request flows must consider:

- resend abuse;
- SMS cost abuse;
- brute-force verification;
- phone enumeration.

---

# 6. Iranian Mobile Number Normalization

Customer identity uses one canonical Iranian mobile number.

The canonical persisted representation is:

```text
+989XXXXXXXXX
```

`X` is an ASCII digit. The value is E.164-style: `+`, country code `98`, and the ten-digit national number beginning with `9`.

`normalizeIranianMobile` in `src/modules/auth` is the only conversion into this form. Persist and compare customer and Admin phone identity only after normalization.

These inputs, and only these inputs, resolve to that canonical value:

```text
09XXXXXXXXX
989XXXXXXXXX
+989XXXXXXXXX
```

For example, `09121234567`, `989121234567`, and `+989121234567` all become `+989121234567`.

Any national number whose first digit after country code `98` is `9` is a mobile number for this rule. Operator prefixes beyond that leading `9` are not further restricted.

Reject every other value. Accepted input is matched exactly. Characters are not stripped, digits are not translated, and a missing prefix is not invented.

Rejected input includes:

- wrong length;
- a non-Iranian country code;
- an Iranian number that is not a mobile number, including numbers that do not begin with `9` after country code `98`;
- letters, spaces, punctuation, or other malformed characters;
- unsupported spellings, including a national number without the leading `0`, a `00` international prefix, a trunk `0` after `+98`, and non-ASCII digits.

`normalizeIranianMobile` returns only `+989XXXXXXXXX`. Invalid input fails and does not produce a best-effort string. The failure does not echo the submitted number.

Persist that canonical value on `User.phone`, `Admin.phone`, `OtpChallenge.phone`, and `OtpRequestEvent.phone`. `User.phone` is unique within customers, and `Admin.phone` is unique within administrators. Those unique constraints are the identity invariants under concurrent creation within each table. Matching values across `User` and `Admin` do not link identities. Those phone columns are `varchar(13)` and have a PostgreSQL `CHECK` so the stored value matches `^\+989[0-9]{9}$`. Normalization remains required before insert. The database constraints reject a phone that was not stored in the canonical form.

OTP request limits, lifetime, cooldown, and hashing are defined in section 5. This section does not set a second policy.

---

# 7. Sessions

Customer and Admin sessions are opaque server-side sessions. V1 does not use a JWT, a refresh token, or rolling renewal.

The customer cookie name is `vidora_customer_session`. The Admin cookie name is `vidora_admin_session`. Each value is a base64url encoding of 32 cryptographically random bytes and nothing else. It does not contain the phone number or other account data. PostgreSQL stores the SHA-256 hex digest of that UTF-8 token in `Session.secretHash` or `AdminSession.secretHash`. The raw token is not a database column, is not logged, and is not returned in a normal JSON response. Lookup hashes the cookie and reads that unique hash in the matching table only. A customer cookie must not resolve an Admin, and an Admin cookie must not resolve a Customer.

`expiresAt` is exactly 30 days after creation. A request does not extend it. A session whose `expiresAt` is at or before the current time is not authenticated. Expired rows may remain until a later cleanup policy. This schema has no revocation column. Logout is not part of this session foundation. A customer session references `User` and is deleted with that user. An Admin session references `Admin` and is deleted with that Admin. Cascade deletion is storage cleanup, not an approved account-deletion product policy.

Cookie attributes for both cookies:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production, and not `Secure` in local development, where HTTPS is unavailable
- `Path=/`
- `Max-Age` of 30 days, the same lifetime as `expiresAt`
- no `Domain` attribute

Session credentials must not be stored in `localStorage` or `sessionStorage`.

Reading the cookie is allowed in a Server Component. Setting it is allowed only in a Route Handler or Server Function. `POST /api/auth/otp/verify` verifies a customer-purpose code and sets the customer cookie. `POST /api/admin/auth/otp/verify` verifies an admin-purpose code and sets the Admin cookie. Later requests, including navigation and reload, restore the account with `resolveCurrentCustomer()` or `resolveCurrentAdmin()`. Those reads do not change `expiresAt`.

`SameSite=Lax` stays on both cookies. Login CSRF for both OTP verification POSTs is the Origin allowlist in section 8. There is no CSRF token and no application-wide CSRF framework. Do not disable framework protections.

Do not invent a custom JWT architecture unless explicitly required.

---

# 8. CSRF and Request Integrity

For state-changing browser requests, use the protections provided by the selected framework/auth architecture and evaluate whether additional CSRF protection is required.

Do not disable framework or auth-library protections merely because they interfere with implementation.

External callbacks such as payment-provider callbacks must be validated using provider-specific verification rather than treated as trusted browser requests.

## OTP verification login CSRF

`POST /api/auth/otp/verify` creates the customer session cookie. `POST /api/admin/auth/otp/verify` creates the Admin session cookie. A cross-site page can submit an attacker's phone and OTP. The browser can store the response `Set-Cookie` for this site even when the cookie is `SameSite=Lax`, because that attribute governs later sends, and this attack is about setting a new session. Both routes therefore check `Origin` before they verify the code and before they set a cookie.

This check is scoped to those OTP verification routes. Do not grow it into application-wide CSRF middleware, a double-submit cookie, or a token framework unless a later requirement says so.

### Allowlist

Expected origins are explicit configuration. The request does not choose them.

- Outside production (`development` and `test`), `http://localhost:3000` is allowed. That is the documented local development origin (`next dev` and the README). It is a constant in `src/modules/auth/browser-auth-origin.ts`.
- Outside production, `APP_ORIGIN` is an optional server environment variable. When it is set, it adds one origin. Omit it when the browser uses `http://localhost:3000`. Set it to another local origin such as a non-default port when the browser sends that origin.
- In production, localhost is not implied. `APP_ORIGIN` is required, and it is the only accepted origin.
- A set value must be a canonical absolute `http` or `https` origin: scheme and host, a port only when it is not the scheme default, and no path, query, userinfo, or fragment. Boot validation uses the same predicate as the request check. An invalid value fails configuration. It is not ignored. Production without `APP_ORIGIN` fails boot configuration clearly.

`http://127.0.0.1:3000` is a different origin. Allow it only by setting `APP_ORIGIN` to that exact value. In production that means setting `APP_ORIGIN` to that value as the sole allowlisted origin.

These request fields do not select or widen the allowlist. There is no trusted-proxy model, so they stay untrusted:

- `Host`
- `Forwarded`
- `X-Forwarded-Host`
- `X-Forwarded-Proto`
- `Referer`

### Browser contract

The Fetch standard gives a request an origin when its method is not `GET` or `HEAD`, and serializes that origin in `Origin`. HTML form submission follows the same rule. A browser POST therefore includes one `Origin` value, or the literal `null` when the origin is opaque. Page script cannot set this header.

The route accepts the POST only when `Origin` is exactly one allowlisted origin.

It rejects the POST when `Origin` is missing, `null`, a list, not a canonical `http` or `https` origin, or any other origin. A lookalike such as `http://localhost:3000.example` is rejected. `Referer` is not a fallback when `Origin` is absent.

Rejection is HTTP 403 with `{ "status": "rejected" }` and `Cache-Control: no-store`. The route does not call OTP verification, so the challenge is not consumed and the attempt counter does not change. It does not set a session cookie.

A non-browser client can send an allowlisted `Origin`. The header is not a secret. The check stops another website from completing verification in the victim's browser.

---

# 9. Payment Security

Never trust:

- browser-submitted price;
- callback success flags alone;
- browser redirects;
- client-side payment state.

The server must:

1. resolve the authoritative Order;
2. use server-authoritative amount;
3. perform provider verification;
4. verify relevant amount/order consistency;
5. complete the purchase idempotently.

Payment secrets remain server-side.

---

# 10. Download Security

Original Footage files are private.

Before granting access:

1. authenticate the customer;
2. resolve the requested Footage/file;
3. verify durable purchase entitlement;
4. issue temporary authorized access.

Never authorize based only on:

- knowing the object key;
- knowing the Footage ID;
- having an invoice number;
- previous download history;
- client-side state.

---

# 11. Signed URLs

Signed URLs for private originals must be short-lived.

Do not:

- persist them as permanent download URLs;
- expose them unnecessarily in logs;
- treat them as durable entitlement;
- generate them without authorization.

Exact expiration seconds come from validated server configuration
(`STORAGE_SIGNED_*_TTL_SECONDS`), resolved through
`src/modules/media/storage-access-policy.ts`. See `instructions/media.md` §6.2.
Do not invent signed-access TTL defaults in code.

Storage credentials remain server-only. Original objects must not use permanent
public URLs. Preview vs original access policy is distinguished at the
`ObjectStorage` boundary; do not make the entire media bucket public merely to
simplify preview delivery.

---

# 12. Upload Security

Only the administrator may initiate protected media uploads.

Upload authorization should constrain the upload as much as practical, including relevant:

- object destination;
- operation;
- content expectations;
- expiration.

Never expose long-lived object-storage credentials to the browser.

A signed upload authorization is not permission to upload arbitrary objects anywhere in storage.

---

# 13. File Validation

Do not trust:

- filename extension;
- browser-provided MIME type;
- browser-provided file size;

as sole proof of file type or integrity.

Validation depth should be proportional to V1 risk and provider capability.

Do not build an unnecessary malware-scanning infrastructure unless required, but do not treat client metadata as authoritative.

---

# 14. Secrets

Secrets must come from environment or approved secret management.

Never commit:

- database passwords;
- SMS credentials;
- payment credentials;
- storage credentials;
- auth secrets;
- signing secrets.

Never place server secrets in variables intentionally exposed to client bundles.

`.env.example` contains names and safe examples/placeholders only.

---

# 15. Logging

Never intentionally log:

- OTP plaintext;
- OTP code hashes;
- `OTP_HASH_SECRET`;
- SMS provider credentials or lookup URLs;
- passwords if any ever exist;
- full authentication credentials;
- storage secrets;
- payment secrets;
- complete sensitive session tokens;
- session token hashes;
- long-lived private credentials.

Be careful with logging complete request objects from sensitive endpoints.

Logs should still contain safe identifiers needed for diagnosis.

---

# 16. Error Responses

Public error responses must not expose:

- stack traces;
- database details;
- SQL;
- internal object-storage configuration;
- provider secrets;
- authentication internals.

Keep detailed diagnostics server-side.

---

# 17. Input Validation

Validate untrusted inputs before using them.

Relevant examples:

- phone numbers;
- IDs;
- slugs;
- search/filter input;
- payment callback data;
- file metadata;
- Admin form data.

Validation does not replace authorization.

---

# 18. Database Safety

Use parameterized database access.

If raw SQL is necessary, never interpolate untrusted input directly into SQL strings.

Database constraints should reinforce important invariants where appropriate.

---

# 19. Sensitive Product Behavior

Do not invent security-sensitive recovery flows.

Examples:

- changing account phone number;
- recovering an account without the registered SIM;
- manually granting purchases;
- overriding payment state;
- support impersonation.

Such flows require explicit product and security decisions.

---

# 20. Security Tests

Security-sensitive features should include negative-path tests where practical.

Examples:

```text id="w3ghmx"
Anonymous → protected download → denied

User B → User A purchase → denied

Customer → Admin mutation → denied

Failed payment verification → no entitlement

Repeated payment callback → no duplicate entitlement
```

---

# 21. Security Review Trigger

Stop and report before implementation when a task appears to require:

- weakening an existing authorization boundary;
- exposing a private resource publicly;
- storing credentials in client code;
- bypassing payment verification;
- inventing account recovery;
- destructive access to customer purchases.

Do not trade security invariants for implementation convenience.
