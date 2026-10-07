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

Upload authorization, object-storage integration, signed URLs, and protected downloads are later media tasks.

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

---

# 7. Object Keys

Object keys should be predictable enough for operations but must not be treated as authorization secrets.

A possible organization is:

```text id="lkt19d"
footage/{footageId}/preview/...
footage/{footageId}/originals/...
```

Exact naming may evolve.

Knowing an object key must never grant purchase access.

---

# 8. Upload Flow

Large media uploads must go directly:

```text id="r5ygvb"
Admin Browser
      ↓
Object Storage
```

after server-side authorization.

Do not proxy multi-gigabyte media through Next.js.

---

# 9. Upload Authorization

Only the administrator may request upload authorization.

The application should constrain authorized uploads to the intended object operation and destination.

Storage account credentials must never be exposed to the browser.

---

# 10. Large Files

Expected individual file size may reach approximately 2 GB.

Use the selected provider's appropriate large-file mechanism.

Where multipart upload is required:

- track upload identity;
- complete uploads explicitly;
- handle failed parts safely;
- do not mark application media ready before upload completion is confirmed.

Do not invent provider-specific part sizes before provider selection.

---

# 11. Upload State

The database should distinguish enough state to avoid presenting incomplete files as available.

An initiated upload is not equivalent to a completed upload.

Do not publish or offer a protected download for an object that has not been successfully confirmed.

Keep the state model as small as the actual workflow permits.

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
