# ADR-0004: Private Object Storage and Media Delivery

- **Status:** Accepted
- **Date:** 2026-09-28

## Context

The product is media-heavy.

The initial catalog is expected to contain approximately 1,000 footage items.

Each Footage may contain:

- a watermarked preview;
- one or more downloadable original-quality files;
- different resolutions or file variants such as 1080p, 4K, or Master.

Individual original files may be as large as approximately 2 GB.

The administrator uploads the preview and each original-quality file individually.

Customers may stream and download watermarked previews.

Original files must only be downloadable by customers who are entitled to the corresponding Footage.

Large media files must not unnecessarily pass through the Next.js application server.

## Decision

Video binaries will be stored in **S3-compatible object storage**.

PostgreSQL stores media metadata and object references, not video binary data.

The selected storage provider must be operationally suitable for Iranian users and the project's deployment environment.

The exact provider is an infrastructure decision and is not fixed by this ADR.

Application code should rely on standard S3-compatible concepts where practical rather than spreading provider-specific behavior throughout the codebase.

## Footage and Files

A purchasable `Footage` and its physical files are separate concepts.

Conceptually:

```text id="2tdphf"
Footage
   │
   ├── FootageFile: Preview
   ├── FootageFile: 1080p
   ├── FootageFile: 4K
   └── FootageFile: Master
```

A Footage has one purchase price.

Individual downloadable file variants do not have independent prices in V1.

A file may contain metadata such as:

```text id="xqok85"
kind
label
objectKey
sizeBytes
mimeType
width
height
fps
codec
```

The exact schema will be defined during database modeling.

## File Variant Flexibility

Downloadable qualities must not be represented using an unnecessarily closed schema such as:

```text id="as4vrf"
footage.fullHdUrl
footage.fourKUrl
footage.rawUrl
```

The product may encounter additional ordinary file variants later.

The model should allow multiple `FootageFile` records without requiring a schema migration for every new quality label.

This flexibility must remain narrow and must not become a generic digital-asset framework.

## Preview Files

A published Footage has a prepared watermarked preview.

V1 previews:

- are watermarked;
- may contain audio;
- may be streamed;
- may be downloaded;
- must not expose an unwatermarked original.

The administrator supplies the prepared preview in V1.

The application does not need to generate the watermark automatically.

Preview delivery may use public or CDN-accessible object delivery where appropriate.

## Primary Cover Images

Each Footage also has one primary cover image supplied manually by the
administrator. A cover is a presentation asset for the public catalog and
Footage detail page; it is not a replacement for the watermarked preview and is
not extracted automatically from video.

Draft Footage may exist without a cover. Publication requires a usable cover.
The administrator may explicitly replace the cover later. Vidora stores the
active cover in a dedicated `FootageCover` row, separate from `FootageFile`
PREVIEW and ORIGINAL rows. The browser produces a 1280×720 JPEG crop from a
JPEG, PNG, or WebP source; the server decodes and validates the final JPEG and
rejects outputs above 2 MiB. Cover reads use a separate signed `cover` access
policy. Failed replacement leaves the existing active row untouched, and old
objects are not automatically deleted because retention remains unresolved.

## Original Files

Original downloadable files are private objects.

They must not have permanent public URLs.

Knowing an object key or storage path must not be sufficient to download a protected original.

Access must be authorized by the application.

## Upload Architecture

Large uploads must go directly from the administrator's browser to object storage.

The following architecture is prohibited for large footage files:

```text id="h63e4p"
Admin Browser
      │
      │ 2 GB file
      ▼
Next.js Server
      │
      │ 2 GB file
      ▼
Object Storage
```

The intended architecture is:

```text id="30t0cl"
Admin Browser
      │
      │ Request authorized upload
      ▼
Next.js
      │
      │ Signed upload information
      ▼
Admin Browser
      │
      │ Direct upload
      ▼
Object Storage
```

The application server is responsible for authorization and upload coordination, not for transporting the complete media payload.

## Large and Multipart Uploads

Files may reach approximately 2 GB.

The implementation must evaluate and use the storage provider's appropriate large-file upload mechanism.

Multipart or equivalent resumable upload should be used when required for reliable large-file uploads.

The upload design should support retrying failed parts where the selected provider supports that capability.

Exact:

- part size;
- concurrency;
- retry behavior;
- upload-session expiration;

are implementation details and must be based on the selected storage provider rather than invented prematurely.

## Upload Completion

A media record must not be treated as successfully uploaded merely because an upload was initiated.

The system must have an explicit completion step that confirms the expected object exists before the file becomes usable by the application.

Where practical, the implementation should record useful storage metadata such as:

- object key;
- size;
- MIME/content type;
- provider checksum or ETag when its semantics are suitable.

The exact integrity mechanism depends on the selected provider.

## Download Architecture

Protected original download follows this conceptual flow:

```text id="6cf4mx"
Authenticated User
       │
       ▼
Download Request
       │
       ▼
Application
       │
       ├── Verify authentication
       ├── Resolve Footage
       ├── Verify purchase entitlement
       └── Resolve requested FootageFile
       │
       ▼
Create Short-Lived Signed Access
       │
       ▼
Browser ───────────────► Object Storage
```

The Next.js server must not proxy the complete original file unless a future requirement explicitly justifies it.

## Signed URLs

A signed URL provides temporary file access.

It is not itself proof of purchase and is not an entitlement record.

Signed access to original files must:

- be short-lived;
- be created only after authorization;
- point only to the requested authorized file;
- not become a permanent public download mechanism.

The exact expiration period must be documented in media/security instructions.

AI agents must not choose arbitrary expiration values.

## Entitlement Boundary

Object storage does not decide whether a user purchased Footage.

The application database is authoritative for purchase entitlement.

Storage credentials, object keys, URLs, or browser state must never replace the entitlement check.

## Download History

The application may record download events for:

- customer support;
- operational diagnostics;
- security investigation;
- basic product analytics.

Download history must not become the source of truth for entitlement.

The absence of a previous download does not mean the user has no entitlement.

## V1 Media Processing

V1 explicitly does not require:

- automatic watermark generation;
- automatic transcoding;
- FFmpeg processing workers;
- background video-processing queues;
- automatic preview generation;
- automatic poster generation;
- automatic technical metadata extraction as a launch requirement.

The administrator provides prepared media files.

Automation may be introduced later if the operational workload justifies it.

## Master Files

The term `Master` refers to a high-quality prepared source supplied for customer download.

V1 does not assume that camera-native sensor RAW formats are being sold.

The media model should not depend on a specific camera codec.

## File Replacement

Replacing a file must not implicitly delete the previous object unless a documented media-retention policy explicitly permits it.

The relationship between:

- replacing a file;
- existing customer purchases;
- historical invoices;
- old storage objects;

must be considered before destructive behavior is introduced.

## Object Deletion and Retention

The V1 product requirements do not yet define a complete object-retention policy.

Therefore AI agents must not invent automatic deletion behavior for:

- unpublished Footage;
- archived Footage;
- replaced files;
- failed uploads;
- orphaned objects.

Safe cleanup policies may be introduced later through an explicit implementation decision or ADR.

Until then, destructive media cleanup requires human review.

## Security Requirements

The application must not:

- expose storage account credentials to the browser;
- make original files publicly readable;
- treat object-key secrecy as authorization;
- generate original-file signed URLs without entitlement checks;
- log sensitive signed URLs unnecessarily;
- allow normal customers to create arbitrary upload authorizations.

Administrative upload operations require administrator authorization.

## Consequences

### Positive

- large files do not consume application-server bandwidth unnecessarily;
- reduced server memory and timeout pressure;
- protected originals remain private;
- storage can scale independently from the Next.js application;
- S3-compatible semantics reduce unnecessary provider coupling;
- future media automation can be added without changing the fundamental storage model.

### Negative

- upload coordination is more complex than a basic multipart HTML form;
- CORS and object-storage configuration become security-sensitive;
- large-file upload reliability depends partly on provider capabilities;
- protected download correctness depends on reliable entitlement checks.

## AI Agent Constraints

AI agents must not:

- store video binaries in PostgreSQL;
- proxy multi-gigabyte uploads through Next.js;
- make original files publicly readable;
- create permanent public original-file URLs;
- bypass entitlement checks for original downloads;
- introduce FFmpeg, workers, Redis, or a queue solely for hypothetical future processing;
- invent media-retention or object-deletion rules;
- hard-code provider-specific behavior throughout business modules;
- expose storage secrets to client-side code.

If the selected storage provider cannot satisfy these requirements, the agent must report the incompatibility rather than weaken the architecture.
