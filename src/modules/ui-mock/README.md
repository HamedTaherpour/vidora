# UI mock fixtures

This directory is the explicit, fixture-only boundary for the UI rebuild phase.
It contains deterministic Persian presentation data and pure scenario selectors;
it does not import Prisma, storage providers, credentials, private object keys,
or protected originals.

## Locations

- `fixtures/public-footage.ts`: published public catalog items and unavailable-media examples.
- `fixtures/admin-footage.ts`: current Admin catalog and editor view data, including draft and upload states.
- `fixtures/customer-presentations.ts`: customer session, single-item purchase, library, and invoice presentation data.
- `scenarios.ts`: explicit `populated`, `empty`, `loading`, `error`, and `unavailable` selection.

Page implementations should call a feature loader with an explicit scenario and
pass the returned view model into the existing component contract. No route,
environment variable, or production data source selects mocks automatically.

Fixtures are cloned before they are returned, so tests and pages cannot mutate
the shared constants. Dates, IDs, prices, and media placeholders are stable.
The media placeholders are tiny local SVG data URIs with 16:9 geometry; they are
not third-party stock assets. The original-file boundary is represented only by
safe labels and statuses—never by URLs, object keys, or credentials.

When a page is integrated with backend capabilities, replace its local fixture
loader with the approved module query/adapter while preserving the component
contract and the same loading, empty, error, and unavailable states.
