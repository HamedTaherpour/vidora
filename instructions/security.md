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

---

# 5. OTP Security

OTP values must:

- expire;
- have attempt limits;
- not be logged in plaintext;
- not be returned in production API responses;
- become invalid after successful use as required by the authentication design.

`OtpChallenge` persists the code only as a one-way hash in `codeHash`. There is no plaintext OTP column. `consumedAt` records successful use; a non-null value invalidates that challenge. A challenge can exist before the customer `User` row, so it has no user foreign key. Lifetime, resend, and attempt-limit numbers are still undefined and are not stored as policy on this table.

OTP request flows must consider:

- resend abuse;
- SMS cost abuse;
- brute-force verification;
- phone enumeration.

Exact rate limits and expiration values must be documented before implementation.

---

# 6. Iranian Mobile Number Normalization

Customer identity uses one canonical Iranian mobile number.

The canonical persisted representation is:

```text
+989XXXXXXXXX
```

`X` is an ASCII digit. The value is E.164-style: `+`, country code `98`, and the ten-digit national number beginning with `9`.

`normalizeIranianMobile` in `src/modules/auth` is the only conversion into this form. Persist and compare customer phone identity only after normalization.

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

Persist that canonical value on `User.phone` and `OtpChallenge.phone`. `User.phone` is unique, and that unique constraint is the customer identity invariant under concurrent creation. Both columns are `varchar(13)` and have a PostgreSQL `CHECK` so the stored value matches `^\+989[0-9]{9}$`. Normalization remains required before insert. The database constraints reject a phone that was not stored in the canonical form.

OTP lifetime, resend cooldown, and rate limits remain undefined. This section does not set them.

---

# 7. Sessions

Customer sessions should use secure browser-oriented session handling.

Session credentials must not be stored in `localStorage`.

`Session.secretHash` stores a hash of the browser session secret. The raw secret is not a database column. Session lookup uses that hash. `expiresAt` is the persisted lifetime. This schema has no separate revocation column. A session references `User` and is deleted with that user.

Production cookies should use appropriate security attributes based on the selected authentication implementation and deployment environment.

Do not invent a custom JWT architecture unless explicitly required.

---

# 8. CSRF and Request Integrity

For state-changing browser requests, use the protections provided by the selected framework/auth architecture and evaluate whether additional CSRF protection is required.

Do not disable framework or auth-library protections merely because they interfere with implementation.

External callbacks such as payment-provider callbacks must be validated using provider-specific verification rather than treated as trusted browser requests.

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

Exact expiration is defined by media/security configuration.

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
- passwords if any ever exist;
- full authentication credentials;
- storage secrets;
- payment secrets;
- complete sensitive session tokens;
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
