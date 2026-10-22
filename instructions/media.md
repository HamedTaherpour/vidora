# Media Instructions

Read this file for tasks involving:

- FootageFile;
- previews;
- original media;
- object storage;
- uploads;
- downloads;
- signed URLs;
- media metadata.

Also read ADR-0004.

---

# 1. Core Model

A `Footage` is the purchasable product.

A `FootageFile` is a physical media file associated with that product.

Do not treat one database Footage row as one physical video file.

Conceptually:

```text id="iy4quf"
Footage
  │
  ├── Preview
  ├── 1080p
  ├── 4K
  └── Master
```

One Footage has one purchase price in V1.

File variants do not have separate prices.

## 1.1 Persistence Contract (MEDIA-01)

PostgreSQL stores `FootageFile` metadata separately from `Footage`.

Durable invariants:

- each Footage may have at most one `PREVIEW` `FootageFile` (database partial unique index);
- each Footage may have many `ORIGINAL` variants;
- `label` is open-ended descriptive text, not a closed enum and not unique;
- `objectKey` stores provider-neutral object identity and is globally unique;
- signed URLs are never persisted;
- technical metadata (`width`, `height`, `fps`, `codec`) may be nullable;
- retention/deletion remains unresolved (ADR-0004); Footage FK deletion is Restrict so media metadata is not silently cascade-deleted.

Protected customer downloads remain a later media task. Admin direct multipart upload is MEDIA-03 (see §8–§11).

## 1.2 Object Storage Boundary (MEDIA-02)

Initial provider: **Liara Object Storage** (S3-compatible).

Application code depends on a provider-neutral `ObjectStorage` boundary:

```text
media / application code
  → ObjectStorage
  → Liara S3-compatible adapter
```

Do not import AWS SDK types or Liara-specific client details into business modules.

Server-only entry: `createObjectStorage()` in `src/modules/media/create-object-storage.ts`.

Storage credentials are parsed only when storage is constructed (`storageEnvSchema`), not at application boot, so build and default CI do not require a live Liara account.

Signed-access TTL variables are parsed lazily only when `createReadAccess` / `createUploadAccess` runs (`storageSignedReadTtlEnvSchema` / `storageSignedUploadTtlEnvSchema`). Connectivity checks and non-signing operations do not require them.

Credentials are server-only. Never expose them through `clientEnv` or `NEXT_PUBLIC_*` variables. Never log them.

---

# 2. Preview

The V1 preview is supplied manually by the administrator.

It:

- is watermarked;
- may contain audio;
- may be streamed;
- may be downloaded.

Preview access does not require purchase.

A preview must never accidentally reference a protected unwatermarked original.

---

# 3. Originals

Original/downloadable variants are private.

They must not use permanent public URLs.

Access requires server-side purchase authorization.

During MEDIA-05, Admin may list ORIGINAL variants on the protected Footage
editor and edit only their descriptive `label`. Labels remain open-ended and
non-unique. The edit preserves `objectKey`, storage-verified properties,
`providerUploadId`, and `uploadStatus`; it performs no storage operation and
does not delete or replace a physical object. Only `READY` variants are
usable files. Customer entitlement and download access remain deferred to the
later download tasks.

---

# 4. File Labels

Do not hard-code the system around a fixed set such as:

```text id="yp7qvh"
1080p
4K
RAW
```

Use file records that can carry descriptive labels and technical metadata.

Examples may include:

```text id="fysajb"
1080p
4K
Master
ProRes Master
```

Do not create a generic asset framework.

The domain remains Footage.

---

# 5. Master Terminology

`Master` means a high-quality prepared source/download variant.

Do not assume camera-native RAW formats such as R3D or BRAW unless the actual uploaded file uses such a format.

Do not describe all high-quality files as RAW.

---

# 6. Storage

Media binaries belong in S3-compatible object storage.

PostgreSQL stores:

- metadata;
- object keys;
- relationships;
- application state.

Do not store video binaries in PostgreSQL.

Do not store signed URLs, temporary URLs, provider responses, or access tokens in PostgreSQL.

## 6.1 Preview vs original access policy

`ObjectAccessPolicy` distinguishes:

- `preview` — watermarked preview delivery; may later be streamed/downloaded without purchase;
- `original` — private downloadable variants; never permanent public URLs.

MEDIA-02 keeps the bucket private and expresses both policies through temporary signed access with different lifetimes. CDN or public-bucket topology for previews is not decided here.

Do not make the entire bucket public merely to simplify preview delivery.

Original-file privacy must not be weakened.

## 6.2 Temporary signed-access lifetimes

MEDIA-02 establishes distinct preview vs original signed-access policies. Exact TTL seconds are **not** hard-coded in application code and are **not** shipped as product defaults.

Configured through validated server environment variables (seconds):

| Access        | Policy   | Environment variable                         |
| ------------- | -------- | -------------------------------------------- |
| Signed read   | preview  | `STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS`    |
| Signed read   | original | `STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS`   |
| Signed upload | preview  | `STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS`  |
| Signed upload | original | `STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS` |

Validation:

- required only when the matching signed-access operation is used;
- must be a positive integer;
- must not exceed `604800` (S3 SigV4 technical maximum for presigned URLs — not a product TTL recommendation).

Policy resolution lives in `storage-access-policy.ts`. Do not invent alternate expiration values in business code.

Signed URLs are temporary and must never be persisted.

`createReadAccess` / `createUploadAccess` are infrastructure primitives. They do not perform purchase entitlement or Admin authorization. Later download/upload tasks own those checks and must call these primitives only after authorization.

Do not call original signed-read access from arbitrary browser code without that future authorization boundary.

---

# 7. Object Keys

Object keys should be predictable enough for operations but must not be treated as authorization secrets.

`FootageFile.objectKey` is the provider-neutral object identity used with `ObjectStorage`.

Server-generated organization (MEDIA-03):

```text id="lkt19d"
footage/{footageId}/preview/{uuid}[.ext]
footage/{footageId}/originals/{uuid}[.ext]
```

The browser must not choose an arbitrary storage key. Object-key secrecy is not an authorization control.

Knowing an object key must never grant purchase access.

---

# 8. Upload Flow (MEDIA-03)

Large Admin media uploads go directly to Liara Object Storage after server-side authorization:

```text
Admin Browser
    ↓
Next.js authorization/control endpoint
    ↓
ObjectStorage multipart initiation/signing
    ↓
Browser uploads parts directly to Liara
    ↓
Next.js completion endpoint
    ↓
Storage completes multipart upload
    ↓
Object existence/metadata confirmed
    ↓
FootageFile upload state becomes READY
```

Next.js handles Admin authorization, validation, object-key allocation, multipart initiation, part signing, completion validation, and persistence state.

Next.js does **not** transport video bytes. Do not proxy multi-gigabyte media through the application server.

Control routes (cookie-authenticated Admin mutations):

- `POST /api/admin/media/uploads`
- `POST /api/admin/media/uploads/[id]/parts`
- `POST /api/admin/media/uploads/[id]/complete`
- `POST /api/admin/media/uploads/[id]/abort`

These routes apply the approved browser `Origin` allowlist (same helpers as OTP verification). Signed direct `PUT` requests to object storage use provider signing and do not carry the Admin session cookie.

---

# 9. Upload Authorization

Only an authenticated Admin may initiate upload, obtain signed part-upload access, complete upload, or abort an unfinished upload.

Anonymous and Customer callers are denied server-side (`requireAuthenticatedAdmin` / AUTH-05). Admin UI visibility is not a security boundary.

Every signing request must be tied to a persisted Admin-authorized upload session (`FootageFile` row). Do not sign arbitrary object keys or arbitrary provider upload IDs supplied by the browser.

Storage account credentials must never be exposed to the browser. Signed part URLs are temporary and must never be persisted.

---

# 10. Large Files and Multipart Strategy

Expected individual file size may reach approximately 2 GB.

Explicit server-side maximum:

```text
2 GiB = 2_147_483_648 bytes
```

Reject requested uploads larger than this limit before multipart initiation. Browser-reported size is used for authorization and expected-size consistency; it is not sole proof of content.

## Multipart strategy (Liara S3-compatible)

Liara Object Storage is used through the AWS S3-compatible API. MEDIA-03 uses standard multipart primitives via `ObjectStorage`:

- `CreateMultipartUpload`
- signed `UploadPart`
- `CompleteMultipartUpload`
- `AbortMultipartUpload`

Capability evidence: Liara documents S3-compatible AWS SDK usage; the official `@liara/sdk` exposes incomplete-upload listing/removal and documents transparent multipart for large `putObject` payloads. Live development-bucket probes remain preferred when credentials are available and are not required in default CI.

Browser part `PUT`s require the Liara bucket CORS configuration to allow the Admin app origin for `PUT` (and typically `GET`/`HEAD` preflight as needed). That is an operations concern for the development/production bucket; it is not encoded as application product policy.

Fixed part size (not user-configurable in V1 UI):

```text
16 MiB = 16_777_216 bytes
```

Rationale:

- satisfies the S3 minimum of 5 MiB for every part except the last;
- keeps a 2 GiB object at 128 parts (well under the 10_000 part limit);
- practical for browser `Blob.slice` memory/network behavior;
- permits retry of an individual failed part without restarting the full upload.

The browser requests signing for needed part numbers; the server signs only valid part numbers for that persisted session.

Part upload failure: retry that part (bounded client attempts). Do not restart the full ~2 GB upload unless the provider session is lost.

Completion is explicit and server-authorized. Part PUT success alone does not mark media ready. The client submits `{ partNumber, etag }` pairs. The server validates the session and expected part set, calls `CompleteMultipartUpload`, confirms the object with `HeadObject` (including expected size), and only then sets `uploadStatus = READY`.

Failed completion must not mark READY. Preserve durable state for safe retry when provider semantics permit. Do not create a second media row automatically. Idempotent completion of an already-READY session returns success without duplicating the row.

Abort (when supported): Admin-only; marks the row `ABORTED`; does not mark READY; does not delete unrelated objects. No cleanup cron in MEDIA-03.

---

# 11. Upload State

`FootageFile` carries upload lifecycle fields:

- `uploadStatus`: `INITIATED` | `READY` | `FAILED` | `ABORTED`
- `providerUploadId`: S3 multipart upload id while unfinished (null when READY/ABORTED)
- `sizeBytes`: authorized expected size while incomplete; confirmed size when READY

Only `READY` rows are usable media. Incomplete uploads must never be presented as downloadable or streamable.

Signed URLs are never persisted.

## Preview invariant during upload

The database still allows at most one `PREVIEW` `FootageFile` per Footage.

- A READY preview blocks a new preview upload (replacement/deletion policy is unresolved — do not invent it).
- A non-ready preview row may be restarted in place for retry (same row identity, new server object key / multipart session).
- Concurrent second preview rows are rejected by the partial unique index.

Multiple `ORIGINAL` uploads remain allowed. Labels stay open-ended.

---

# 12. Metadata

Useful metadata may include:

```text id="h5f79i"
label
kind
objectKey
sizeBytes
mimeType
width
height
fps
codec
```

Only store metadata the product or operations actually need.

V1 does not require an automated ffprobe pipeline.

Admin-entered metadata is acceptable where defined by the product workflow.

---

# 13. Download Flow

Protected download flow:

```text id="uyn03e"
Authenticated Customer
        ↓
Application
        ↓
Entitlement Check
        ↓
Short-Lived Signed Access
        ↓
Object Storage
```

The application server should authorize, not transport, the large file.

---

# 14. Entitlement

Object storage does not know whether a customer purchased Footage.

Purchase authorization comes from application data.

Never authorize a download merely because:

- the user knows the object key;
- the user knows a file ID;
- the user downloaded it previously;
- the user has an invoice number.

---

# 15. Signed Access

Signed original-file access must be temporary.

Do not persist signed URLs as permanent application data.

Do not cache them as durable customer download URLs.

Generate them after authorization.

Do not unnecessarily log complete signed URLs.

Use the approved lifetimes in §6.2. Do not invent alternate expiration values in business code.

---

# 16. File Added After Purchase

The following product rule is unresolved:

> If a new downloadable file is added to a Footage after a customer purchased that Footage, does the previous customer gain access to the new file?

Do not implement behavior that depends on an assumed answer.

If the task reaches this boundary, stop and report it.

---

# 17. Replacement

Replacing a FootageFile record or uploading a new variant must not automatically delete an old object unless retention behavior has been explicitly approved.

Historical customer access may depend on product decisions not yet defined.

---

# 18. Deletion and Cleanup

Do not invent automatic deletion for:

- replaced objects;
- unpublished Footage;
- incomplete uploads;
- orphaned objects;
- archived content.

Cleanup is useful, but destructive cleanup requires an explicit retention policy.

A future cleanup task can be added once the lifecycle is understood.

---

# 19. Media Processing

V1 does not require:

- FFmpeg workers;
- transcoding;
- automatic watermarking;
- automatic preview generation;
- automatic poster generation;
- background media queues.

Do not introduce these because they are common in video platforms.

The administrator supplies prepared files.

---

# 20. CDN

Preview delivery may use CDN/public object delivery where useful.

Do not assume protected originals should become publicly cacheable.

Any CDN strategy for protected originals must preserve entitlement and private-access guarantees.

---

# 21. Failure Handling

Expected media failures should produce actionable application state.

Examples:

- upload authorization failure;
- multipart part failure;
- upload completion failure;
- missing object;
- signed-access generation failure.

Do not report an upload as successful until required completion checks succeed.

---

# 22. Security

Never:

- expose storage credentials;
- make original buckets/objects public;
- rely on obscurity of object keys;
- generate signed originals without entitlement;
- allow customers to request arbitrary upload authorization.

Media convenience must not weaken purchase protection.
