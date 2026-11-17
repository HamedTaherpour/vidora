# Vidora UI Route Inventory

This inventory records the page routes present during `VIDORA-UI-RESET-01`.
Routes retain `UI_RESET` unless a later implementation task records a newer
status. API route handlers are intentionally excluded.

| Route                                            | Page / purpose                | Classification              | Dynamic parameters  | Authentication                                    | Important behavior to restore                                        | UI status   |
| ------------------------------------------------ | ----------------------------- | --------------------------- | ------------------- | ------------------------------------------------- | -------------------------------------------------------------------- | ----------- |
| `/`                                              | Home and catalog entry point  | Public                      | None                | None                                              | Catalog discovery, search entry, categories                          | UI_RESET    |
| `/search`                                        | Footage search and filters    | Public                      | None                | None                                              | Search, filtering, sorting, pagination                               | UI_RESET    |
| `/footage`                                       | Legacy footage catalog URL    | Public                      | None                | None                                              | Preserve URL; catalog behavior is rebuilt through the search surface | UI_RESET    |
| `/footage/[slug]`                                | Footage detail                | Public                      | `slug`              | None                                              | Published footage lookup, preview, metadata, buy-now entry           | UI_RESET    |
| `/purchase/[slug]`                               | Single-footage purchase flow  | Public/Auth during checkout | `slug`              | Customer auth required before purchase completion | Price authority, payment verification, order, entitlement, invoice   | UI_RESET    |
| `/blog`                                          | Blog listing                  | Public                      | None                | None                                              | Published blog listing and SEO metadata                              | UI_RESET    |
| `/blog/[slug]`                                   | Blog article                  | Public                      | `slug`              | None                                              | Article lookup and SEO metadata                                      | UI_RESET    |
| `/login`                                         | Customer OTP login            | Public                      | None                | None                                              | Phone normalization, OTP request/verification, customer session      | UI_RESET    |
| `/login/continue`                                | Customer session continuation | Public/session-aware        | None                | Customer session resolution                       | Continue authenticated flow                                          | UI_RESET    |
| `/session`                                       | Legacy customer session entry | Public/session-aware        | None                | Customer session resolution                       | Preserve safe continuation redirect                                  | UI_RESET    |
| `/session/continue`                              | Legacy continuation alias     | Public/session-aware        | None                | Customer session resolution                       | Preserve continuation redirect                                       | UI_RESET    |
| `/dashboard`                                     | Customer dashboard            | Auth                        | None                | Customer session required server-side             | Account summary, library/order/profile navigation                    | IMPLEMENTED |
| `/dashboard/library`                             | Customer purchase library     | Auth                        | None                | Customer session required server-side             | Entitlements, available files, purchase history                      | IMPLEMENTED |
| `/dashboard/library/[purchaseReference]`         | Purchased footage detail      | Auth                        | `purchaseReference` | Customer session required server-side             | Ownership check, protected downloads                                 | IMPLEMENTED |
| `/dashboard/library/[purchaseReference]/invoice` | Purchase invoice              | Auth                        | `purchaseReference` | Customer session required server-side             | Invoice retrieval tied to the purchase                               | IMPLEMENTED |
| `/dashboard/orders`                              | Customer orders and invoices  | Auth                        | None                | Customer session required server-side             | Order history and invoice access                                     | IMPLEMENTED |
| `/dashboard/profile`                             | Customer profile              | Auth                        | None                | Customer session required server-side             | Customer account information                                         | IMPLEMENTED |
| `/admin/footage`                                 | Admin footage catalog         | Admin                       | None                | Admin session required server-side                | Footage management, publication, support operations                  | UI_RESET    |
| `/admin/footage/[id]/edit`                       | Admin footage editor          | Admin                       | `id`                | Admin session required server-side                | Metadata, cover, preview, originals, publication mutations           | UI_RESET    |

The inventory reflects routes that were implemented in the repository at reset
time. Planned capabilities are labeled as behavior to restore, not as currently
implemented placeholder functionality.
