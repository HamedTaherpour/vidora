# V1 Implementation Roadmap

> Status: Active  
> Scope: V1  
> Canonical product definition: `docs/PROJECT.md`

## 1. Purpose

This roadmap breaks V1 into small, reviewable implementation tasks suitable for both human developers and AI coding agents.

The roadmap is intentionally smaller than a long-term product roadmap.

Its goals are:

- maintain implementation order;
- expose dependencies;
- prevent uncontrolled scope expansion;
- provide bounded tasks to coding agents;
- define completion criteria before implementation begins;
- keep V1 focused on shipping.

This roadmap does not override:

- `docs/PROJECT.md`;
- accepted ADRs;
- engineering/security instructions;
- `AGENTS.md`.

If documents conflict, the conflict must be reported rather than silently resolved by an implementation agent.

---

# 2. Task Status

Allowed task states:

```text
TODO
IN_PROGRESS
BLOCKED
READY_FOR_REVIEW
DONE
```

A task must not be marked `DONE` merely because code was written.

It must satisfy its acceptance criteria and required verification.

---

# 3. Execution Model

Each implementation task should have:

- one bounded objective;
- known dependencies;
- explicit acceptance criteria;
- explicit out-of-scope items where useful;
- required tests or verification.

Before implementing a task, the coding agent must read:

1. `AGENTS.md`;
2. `docs/PROJECT.md`;
3. relevant ADRs;
4. relevant instructions;
5. the task definition;
6. the smallest useful neighboring code context.

Agents must not implement later roadmap tasks opportunistically.

---

# Phase 0 — Foundation & Governance

Goal:

> Establish the repository, architecture guardrails, AI workflow, and minimum CI before product features are implemented.

---

## FND-01 — Bootstrap Next.js Application

**Status:** DONE

### Depends On

None.

### Objective

Create the initial production-oriented Next.js application using the architecture approved by ADR-0001.

### Requirements

- Next.js App Router;
- TypeScript strict mode;
- pnpm;
- current approved stable dependency versions;
- ESLint;
- formatting;
- Tailwind CSS;
- shadcn/ui foundation;
- no unnecessary starter/demo content;
- no Docker requirement for local development.

### Acceptance Criteria

- application starts locally;
- production build succeeds;
- TypeScript strict mode is enabled;
- lint succeeds;
- formatting check succeeds;
- initial directory structure follows the modular-monolith direction;
- no product feature is implemented yet.

### Out of Scope

- authentication;
- database schema;
- footage UI;
- payment;
- media upload.

---

## FND-02 — Install Canonical Project Governance

**Status:** READY_FOR_REVIEW

### Depends On

FND-01.

### Objective

Install the project's canonical engineering and AI-agent governance structure.

### Required Structure

```text
AGENTS.md

docs/
  PROJECT.md
  ROADMAP.md
  adr/

instructions/

.agents/
  skills/

.cursor/
.codex/
```

### Acceptance Criteria

- `AGENTS.md` identifies canonical project sources;
- AI agents are required to read relevant project documentation before implementation;
- ambiguity stop-rule is documented;
- tool-specific AI configuration does not duplicate or contradict canonical rules;
- architecture changes require explicit approval;
- agents are forbidden from weakening tests to make verification pass.

---

## FND-03 — Establish Quality Commands

**Status:** DONE

### Depends On

FND-01.

### Objective

Provide a small, predictable set of local quality commands.

### Required Commands

Equivalent scripts must exist for:

```text
format
format:check
lint
typecheck
test
build
```

### Acceptance Criteria

- each command works independently;
- commands fail with a non-zero exit code on failure;
- commands are documented;
- commands do not require external infrastructure unless explicitly stated.

---

## FND-04 — Establish CI

**Status:** READY_FOR_REVIEW

### Depends On

FND-03.

### Objective

Run the project's minimum quality gates on pull requests and relevant branches.

### CI Must Run

```text
install
format:check
lint
typecheck
test
build
```

### Acceptance Criteria

- CI uses a frozen lockfile;
- dependency installation is deterministic;
- CI fails if a required quality gate fails;
- CI does not require production credentials;
- default CI tests remain infrastructure-light.

---

## FND-05 — Environment Configuration

**Status:** READY_FOR_REVIEW

### Depends On

FND-01.

### Objective

Create typed and validated environment configuration.

### Requirements

- separate server-only and client-safe environment variables;
- startup/build validation where appropriate;
- `.env.example`;
- secrets must not be committed;
- client bundles must not expose server secrets.

### Acceptance Criteria

- missing required configuration fails clearly;
- environment schema is centralized;
- `.env.example` documents required keys without real credentials.

---

# Phase 1 — Database & Authentication

Goal:

> Establish persistent application data and secure phone-based customer authentication.

---

## DATA-01 — Configure PostgreSQL and Prisma

**Status:** READY_FOR_REVIEW

### Depends On

FND-05.

### Objective

Connect the application to PostgreSQL using the approved Prisma version.

### Acceptance Criteria

- Prisma is configured;
- database connection is environment-driven;
- initial migration workflow works;
- Prisma major version is pinned;
- development workflow does not require Docker;
- database instructions document migration safety.

---

## DATA-02 — Create Initial Core Schema

**Status:** READY_FOR_REVIEW

### Depends On

DATA-01, AUTH-01, AUTH-02.

### Objective

Create only the foundational models required for the next phases.

### Initial Scope

Models required for:

- User;
- administrative identity where required;
- authentication/session persistence required by the chosen auth implementation.

Footage and commerce models should be added in their respective phases unless required earlier.

### Acceptance Criteria

- migration succeeds;
- unique customer identity is enforceable;
- Iranian phone identity has a canonical persisted representation;
- no speculative product models are added.

---

## AUTH-01 — Resolve Authentication Implementation

**Status:** READY_FOR_REVIEW

### Decision

Better Auth is rejected. The selected approach is ADR-0006.

### Depends On

DATA-01.

### Objective

Validate the preferred authentication library against ADR-0003 before integrating it.

### Investigation

Confirm whether the preferred Better Auth configuration can cleanly support:

- phone-only customer identity;
- OTP;
- persistent sessions;
- HttpOnly cookies;
- Prisma/PostgreSQL;
- no meaningful/fake email requirement.

### Acceptance Criteria

One of the following is documented:

1. Better Auth is accepted with the exact integration approach; or
2. Better Auth is rejected with a concrete reason and a smaller approved approach is selected.

The implementation must not proceed based on assumption.

---

## AUTH-02 — Implement Phone Normalization

**Status:** READY_FOR_REVIEW

### Depends On

AUTH-01.

### Objective

Define and implement canonical Iranian mobile-number handling.

### Acceptance Criteria

Equivalent supported forms resolve consistently, for example:

```text
0912...
98912...
+98912...
```

Invalid Iranian mobile numbers are rejected.

Normalization has unit tests.

The canonical stored representation is documented.

---

## AUTH-03 — Implement OTP Request Flow

**Status:** READY_FOR_REVIEW

### Depends On

AUTH-01, AUTH-02.

### Objective

Allow a customer to request an OTP safely.

### Requirements

- SMS provider boundary;
- initial Iranian SMS provider implementation;
- OTP expiration;
- resend/cooldown policy;
- abuse/rate protection;
- no plaintext OTP logging.

### Acceptance Criteria

- valid phone can request OTP;
- invalid phone cannot;
- resend policy is enforced;
- provider failures are handled safely;
- OTP value is not exposed through logs or normal API responses.

---

## AUTH-04 — Implement OTP Verification and Session

**Status:** READY_FOR_REVIEW

### Depends On

AUTH-03.

### Objective

Verify OTP and establish the authenticated customer session.

### Acceptance Criteria

- valid OTP authenticates the customer;
- first successful authentication can create the customer account;
- returning phone resolves to the existing customer;
- invalid/expired OTP fails;
- attempt limits are enforced;
- successful use invalidates the OTP as required;
- session uses secure browser-appropriate transport;
- session survives normal page navigation/reload.

---

## AUTH-05 — Protect Customer and Admin Boundaries

**Status:** READY_FOR_REVIEW

### Depends On

AUTH-04.

### Objective

Establish authorization boundaries for authenticated customers and the single V1 administrator.

### Acceptance Criteria

- anonymous users cannot access protected customer operations;
- normal customers cannot access admin operations;
- administrator can access admin operations;
- V1 does not introduce generic RBAC.

---

# Phase 2 — Admin Catalog

Goal:

> Allow the administrator to create, organize, price, and publish Footage.

---

## CAT-01 — Implement Footage Schema

**Status:** READY_FOR_REVIEW

### Depends On

DATA-01.

### Objective

Model the purchasable Footage entity.

### Scope

Include only fields required by the approved V1 product and discovery requirements.

### Acceptance Criteria

- Footage has a stable ID;
- title;
- unique slug;
- description;
- price;
- publication state;
- relevant timestamps;
- schema supports draft and published content;
- monetary storage follows the approved money convention.

---

## CAT-02 — Implement Categories and Tags

**Status:** READY_FOR_REVIEW

### Depends On

CAT-01.

### Objective

Model catalog classification required for browsing and search.

### Acceptance Criteria

- Footage can be classified appropriately;
- category/tag relationships are queryable;
- duplicate or invalid identifiers are prevented where appropriate;
- no generic taxonomy framework is introduced.

---

## CAT-03 — Implement Admin Footage CRUD

**Status:** READY_FOR_REVIEW

### Depends On

CAT-01, CAT-02, AUTH-05.

### Objective

Allow the administrator to create and edit Footage metadata.

### Acceptance Criteria

Admin can:

- create draft Footage;
- edit metadata;
- set price;
- manage category/tag relationships;
- publish valid Footage;
- unpublish Footage.

Normal customers cannot perform these operations.

---

## CAT-04 — Implement Admin Catalog List

**Status:** READY_FOR_REVIEW

### Depends On

CAT-03.

### Objective

Provide an operational catalog-management view.

### Acceptance Criteria

Admin can:

- list Footage;
- identify draft/published state;
- search or locate Footage efficiently;
- open an item for editing.

Complex analytics and bulk-management systems are out of scope.

---

# Phase 3 — Media

Goal:

> Support reliable direct upload and protected delivery of large footage files.

---

## MEDIA-01 — Implement Footage File Model

**Status:** TODO

### Depends On

CAT-01.

### Objective

Represent preview and downloadable physical files separately from Footage.

### Acceptance Criteria

A Footage can have:

- a preview;
- multiple downloadable original-quality files.

File metadata can represent varying quality labels without adding a new database column for every quality.

---

## MEDIA-02 — Integrate S3-Compatible Storage

**Status:** TODO

### Depends On

FND-05, MEDIA-01.

### Objective

Connect the application to the selected object-storage provider behind a narrow storage boundary.

### Acceptance Criteria

- credentials remain server-side;
- object operations are centralized;
- provider-specific details do not leak across business modules;
- private and preview media policies are distinguishable.

---

## MEDIA-03 — Implement Direct Admin Upload

**Status:** TODO

### Depends On

MEDIA-02, AUTH-05.

### Objective

Upload footage files directly from the admin browser to object storage.

### Acceptance Criteria

- large file body does not pass through Next.js;
- only administrator can initiate authorized upload;
- large-file strategy supports files up to the expected ~2 GB limit;
- failed upload can be safely retried according to provider capability;
- upload completion is explicitly confirmed.

---

## MEDIA-04 — Implement Preview Management

**Status:** TODO

### Depends On

MEDIA-03.

### Objective

Allow Admin to associate a prepared watermarked preview with Footage.

### Acceptance Criteria

- preview can be streamed;
- preview can be downloaded;
- preview is clearly separate from protected originals;
- publishing cannot accidentally expose a protected original as preview.

---

## MEDIA-05 — Implement Original Variant Management

**Status:** TODO

### Depends On

MEDIA-03.

### Objective

Allow Admin to manage downloadable original-quality files.

### Acceptance Criteria

- multiple variants can be associated with one Footage;
- variant labels are not constrained to a speculative closed list;
- original objects remain private;
- replacing metadata does not silently delete historical objects.

---

# Phase 4 — Storefront & Discovery

Goal:

> Make the catalog discoverable and provide the primary customer browsing experience.

---

## UI-01 — Establish Design Foundations

**Status:** TODO

### Depends On

FND-01.

### Objective

Define the minimum design-as-code foundation before production storefront components proliferate.

### Scope

At minimum:

- colors;
- typography;
- spacing;
- radius;
- containers;
- breakpoints;
- RTL behavior.

### Acceptance Criteria

- canonical design documentation exists;
- implementation uses semantic design tokens;
- arbitrary per-component visual values are discouraged;
- Persian/RTL behavior is defined.

---

## UI-02 — Define Core Storefront Component Contracts

**Status:** TODO

### Depends On

UI-01.

### Objective

Define the first reusable UI contracts before implementation.

### Initial Components

- FootageCard;
- SearchBar;
- Filter controls;
- VideoPreview/Player;
- Price/BuyNow area.

### Acceptance Criteria

Each contract defines relevant:

- structure;
- states;
- responsive behavior;
- RTL behavior;
- interactions;
- data requirements.

---

## STORE-01 — Implement Public Footage Listing

**Status:** TODO

### Depends On

CAT-03, MEDIA-04, UI-02.

### Objective

Display published Footage to public users.

### Acceptance Criteria

- only published Footage appears;
- cards follow approved design contract;
- preview/poster behavior does not create uncontrolled simultaneous video playback;
- listing is responsive and RTL-correct.

---

## STORE-02 — Implement Footage Detail Page

**Status:** TODO

### Depends On

STORE-01, MEDIA-05.

### Objective

Provide the primary product page for a Footage.

### Acceptance Criteria

Page can present:

- watermarked preview;
- title;
- description;
- price;
- relevant technical metadata;
- available file/quality information;
- category/tags;
- Buy Now entry point.

---

## SEARCH-01 — Implement Catalog Search

**Status:** TODO

### Depends On

STORE-01.

### Objective

Provide PostgreSQL-backed text search suitable for the initial Persian catalog.

### Acceptance Criteria

- user can search published Footage;
- unpublished content is excluded;
- common Persian text behavior is tested;
- query has appropriate indexing;
- no external search service is introduced.

---

## SEARCH-02 — Implement Catalog Filters

**Status:** TODO

### Depends On

SEARCH-01.

### Objective

Allow useful V1 filtering without overbuilding discovery infrastructure.

### Candidate Filters

- category;
- tags;
- resolution/available quality;
- orientation;
- frame rate;
- duration;
- price.

### Acceptance Criteria

Only filters supported by actual catalog metadata are implemented.

Filter state is URL-friendly where appropriate.

---

# Phase 5 — Buy Now & Payment

Goal:

> Convert authenticated customers from Footage Detail to a verified paid purchase.

---

## COM-01 — Finalize Money Convention

**Status:** TODO

### Depends On

CAT-01.

### Objective

Explicitly define stored and provider-facing monetary units.

### Acceptance Criteria

Documentation defines:

- database monetary unit;
- storefront display unit;
- payment-provider unit;
- conversion boundary if required.

No implicit Rial/Toman conversion remains.

---

## COM-02 — Implement Order and OrderItem

**Status:** TODO

### Depends On

COM-01, AUTH-04.

### Objective

Create server-authoritative single-item Buy Now orders.

### Acceptance Criteria

- authenticated customer can create an Order for one Footage;
- price comes from server-side Footage data;
- title and price are snapshotted;
- browser cannot choose authoritative price;
- no Cart model exists.

---

## PAY-01 — Integrate Payment Provider

**Status:** TODO

### Depends On

COM-02.

### Objective

Integrate the selected Iranian payment provider behind the approved payment boundary.

### Acceptance Criteria

- payment can be created for a valid Order;
- secrets remain server-side;
- provider-specific code is isolated;
- relevant authority/reference data is persisted.

---

## PAY-02 — Implement Payment Callback and Verification

**Status:** TODO

### Depends On

PAY-01.

### Objective

Handle provider return and verify payment server-side.

### Acceptance Criteria

- callback alone never marks an Order paid;
- provider verification is performed;
- failed verification does not grant entitlement;
- amount/order consistency is checked;
- repeated callback/verification is safe.

---

## PAY-03 — Implement Idempotent Purchase Completion

**Status:** TODO

### Depends On

PAY-02.

### Objective

Convert verified payment into durable purchase state exactly once.

### Acceptance Criteria

Successful completion results in:

- paid Order;
- durable purchase entitlement;
- invoice record.

Repeated completion does not create duplicates.

Relevant consistency behavior is covered by automated tests.

---

# Phase 6 — Library, Downloads & Invoice

Goal:

> Allow customers to reliably access and prove previous purchases.

---

## LIB-01 — Implement User Library

**Status:** TODO

### Depends On

PAY-03.

### Objective

Display the authenticated customer's purchased Footage.

### Acceptance Criteria

- only the customer's purchases appear;
- purchases remain available across sessions/devices;
- customer can navigate from purchase to available downloads and invoice.

---

## DL-01 — Implement Protected Download Authorization

**Status:** TODO

### Depends On

LIB-01, MEDIA-05.

### Objective

Authorize original-file downloads using durable purchase entitlement.

### Acceptance Criteria

- anonymous user cannot download protected original;
- non-purchasing customer cannot download it;
- purchasing customer can request authorized access;
- application generates temporary file access only after authorization;
- full file does not pass through Next.js.

### Critical Security Test

```text
User A purchases Footage X.

User B requests an original file belonging to Footage X.

Expected result:
Access denied.
```

---

## DL-02 — Record Download History

**Status:** TODO

### Depends On

DL-01.

### Objective

Record useful download events without making download history the entitlement source of truth.

### Acceptance Criteria

Recorded information is sufficient for basic support/diagnostics without unnecessary sensitive data.

---

## INV-01 — Implement Invoice Data and Lookup

**Status:** TODO

### Depends On

PAY-03.

### Objective

Provide stable historical invoice records.

### Acceptance Criteria

- every completed purchase has one appropriate invoice;
- invoice number is unique and support-friendly;
- historical title and amount remain unchanged if catalog data changes;
- customer phone is masked in customer-facing invoice representation;
- Admin can locate invoice/order/payment information.

---

## INV-02 — Implement Customer Invoice Rendering

**Status:** TODO

### Depends On

INV-01.

### Objective

Provide a downloadable or printable customer invoice.

### Acceptance Criteria

- invoice can be retrieved later;
- rendering uses historical purchase data;
- invoice number is visible;
- relevant payment reference is represented appropriately;
- implementation does not invent unconfirmed legal/tax fields.

### Production Blocker

Before production launch, required official/legal invoice fields must be confirmed by the business owner.

---

# Phase 7 — Blog & SEO

Goal:

> Provide lightweight SEO content and strong public-page discoverability.

---

## BLOG-01 — Implement Blog Schema and Admin Editing

**Status:** TODO

### Depends On

DATA-01, AUTH-05.

### Objective

Provide a simple database-backed Markdown blog.

### Acceptance Criteria

Admin can manage:

- title;
- slug;
- excerpt;
- Markdown content;
- cover image where applicable;
- SEO title;
- SEO description;
- publication state/date.

No rich-text editor framework is introduced.

---

## BLOG-02 — Implement Public Blog

**Status:** TODO

### Depends On

BLOG-01.

### Objective

Render published blog content as indexable public pages.

### Acceptance Criteria

- blog index exists;
- blog detail exists;
- Markdown is rendered safely;
- unpublished posts are not publicly visible;
- pages have appropriate metadata.

---

## SEO-01 — Implement Technical SEO Foundation

**Status:** TODO

### Depends On

STORE-02, BLOG-02.

### Objective

Provide the minimum technical SEO required for launch.

### Scope

Evaluate and implement as appropriate:

- metadata;
- canonical URLs;
- sitemap;
- robots configuration;
- structured data;
- Open Graph metadata;
- crawl/index behavior.

### Acceptance Criteria

Public Footage and Blog pages expose appropriate server-rendered metadata and do not accidentally expose admin/private surfaces to indexing.

---

# Phase 8 — Production Readiness & Launch

Goal:

> Verify the critical business and security flows before production release.

---

## PROD-01 — Security Review

**Status:** TODO

### Depends On

Core V1 features complete.

### Objective

Review critical attack and authorization surfaces.

### Review Areas

- OTP abuse;
- session security;
- admin authorization;
- payment verification;
- price tampering;
- entitlement bypass;
- signed download access;
- upload authorization;
- secret exposure;
- invoice/account verification.

### Acceptance Criteria

Critical findings are resolved or explicitly accepted before launch.

---

## PROD-02 — Critical E2E Coverage

**Status:** TODO

### Depends On

Core V1 features complete.

### Objective

Cover the highest-value customer and administrator flows with Playwright.

### Critical Flows

At minimum:

```text
Customer OTP login

Browse → Footage Detail

Buy Now → Payment verification → Library

Purchased original download

Unauthorized original download denied

Admin creates and publishes Footage

Invoice retrieval
```

Payment-provider behavior may use an approved deterministic test adapter where external sandbox behavior is unsuitable for CI.

---

## PROD-03 — Production Infrastructure

**Status:** TODO

### Depends On

Core V1 features complete.

### Objective

Prepare production deployment and external services.

### Scope

- application hosting;
- production PostgreSQL;
- object storage;
- SMS credentials;
- payment credentials;
- domain;
- HTTPS;
- environment configuration;
- backups.

### Acceptance Criteria

Production secrets are not committed.

Deployment and rollback procedures are documented at the level required for V1.

---

## PROD-04 — Operational and Recovery Checks

**Status:** TODO

### Depends On

PROD-03.

### Objective

Ensure the system can recover from realistic operational problems.

### Verify

- database backup availability;
- database restore procedure;
- object-storage durability expectations;
- failed payment diagnostics;
- failed SMS diagnostics;
- failed upload diagnostics;
- basic application logging.

Do not introduce enterprise observability infrastructure without demonstrated need.

---

## PROD-05 — Launch Checklist

**Status:** TODO

### Depends On

PROD-01, PROD-02, PROD-03, PROD-04.

### Objective

Perform final production-readiness verification.

### Required Decisions Before Launch

Confirm unresolved business rules including:

- official invoice/legal fields;
- production payment-provider configuration;
- final license terms;
- policy for files added to Footage after an earlier purchase;
- required privacy/terms pages;
- support/contact information.

### Acceptance Criteria

- required product decisions are resolved;
- critical tests pass;
- production build passes;
- production services are configured;
- no known critical security issue remains unresolved;
- business owner approves launch.

---

# 4. Explicit V1 Non-Goals

The roadmap must not silently expand to include:

```text
Shopping cart
Discount engine
Coupons
Subscriptions
Contributor marketplace
User uploads
Creator payouts
Multi-admin RBAC
Automated transcoding
Automated watermark generation
Redis
BullMQ
Microservices
Separate NestJS backend
Dedicated search engine
Recommendation engine
Mobile application
After Effects products
Multi-language storefront
```

Adding one of these requires an explicit product or architecture decision.

---

# 5. Task Completion Protocol

When an implementation agent completes a task, its report should include:

```text
Task:
Status:

Implemented:
- ...

Files changed:
- ...

Tests added/updated:
- ...

Verification executed:
- ...

Architecture/product documentation updated:
- ...

Known limitations or unresolved questions:
- ...

Ready for review.
```

The implementation agent must not mark its own work `DONE` when the workflow requires review.

The normal transition is:

```text
TODO
  ↓
IN_PROGRESS
  ↓
READY_FOR_REVIEW
  ↓
DONE
```

A reviewer may return the task to `IN_PROGRESS`.

---

# 6. Scope Discipline

A task implementation should make the smallest coherent change required to satisfy its acceptance criteria.

Agents should not:

- implement future roadmap tasks because they appear convenient;
- perform unrelated refactors;
- introduce speculative abstractions;
- add dependencies without justification;
- weaken tests or validation to obtain a passing build.

If a task exposes a missing business rule or architectural decision, implementation should stop at that boundary and report it.

The roadmap should then be updated after the decision is made.

---

# 7. Roadmap Maintenance

This roadmap is expected to change as implementation reveals real constraints.

Changes should prefer:

- splitting an oversized task;
- adding a missing bounded task;
- clarifying acceptance criteria;
- updating dependencies;

rather than rewriting the entire roadmap.

Completed task history should remain understandable.

The roadmap is an execution tool, not a prediction of every future feature.
