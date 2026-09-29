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

OTP request flows must consider:

- resend abuse;
- SMS cost abuse;
- brute-force verification;
- phone enumeration.

Exact rate limits and expiration values must be documented before implementation.

---

# 6. Sessions

Customer sessions should use secure browser-oriented session handling.

Session credentials must not be stored in `localStorage`.

Production cookies should use appropriate security attributes based on the selected authentication implementation and deployment environment.

Do not invent a custom JWT architecture unless explicitly required.

---

# 7. CSRF and Request Integrity

For state-changing browser requests, use the protections provided by the selected framework/auth architecture and evaluate whether additional CSRF protection is required.

Do not disable framework or auth-library protections merely because they interfere with implementation.

External callbacks such as payment-provider callbacks must be validated using provider-specific verification rather than treated as trusted browser requests.

---

# 8. Payment Security

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

# 9. Download Security

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

# 10. Signed URLs

Signed URLs for private originals must be short-lived.

Do not:

- persist them as permanent download URLs;
- expose them unnecessarily in logs;
- treat them as durable entitlement;
- generate them without authorization.

Exact expiration is defined by media/security configuration.

---

# 11. Upload Security

Only the administrator may initiate protected media uploads.

Upload authorization should constrain the upload as much as practical, including relevant:

- object destination;
- operation;
- content expectations;
- expiration.

Never expose long-lived object-storage credentials to the browser.

A signed upload authorization is not permission to upload arbitrary objects anywhere in storage.

---

# 12. File Validation

Do not trust:

- filename extension;
- browser-provided MIME type;
- browser-provided file size;

as sole proof of file type or integrity.

Validation depth should be proportional to V1 risk and provider capability.

Do not build an unnecessary malware-scanning infrastructure unless required, but do not treat client metadata as authoritative.

---

# 13. Secrets

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

# 14. Logging

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

# 15. Error Responses

Public error responses must not expose:

- stack traces;
- database details;
- SQL;
- internal object-storage configuration;
- provider secrets;
- authentication internals.

Keep detailed diagnostics server-side.

---

# 16. Input Validation

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

# 17. Database Safety

Use parameterized database access.

If raw SQL is necessary, never interpolate untrusted input directly into SQL strings.

Database constraints should reinforce important invariants where appropriate.

---

# 18. Sensitive Product Behavior

Do not invent security-sensitive recovery flows.

Examples:

- changing account phone number;
- recovering an account without the registered SIM;
- manually granting purchases;
- overriding payment state;
- support impersonation.

Such flows require explicit product and security decisions.

---

# 19. Security Tests

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

# 20. Security Review Trigger

Stop and report before implementation when a task appears to require:

- weakening an existing authorization boundary;
- exposing a private resource publicly;
- storing credentials in client code;
- bypassing payment verification;
- inventing account recovery;
- destructive access to customer purchases.

Do not trade security invariants for implementation convenience.
