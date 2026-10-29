/**
 * Safe Admin catalog application errors.
 * Do not expose Prisma codes, SQLSTATE, or constraint names at HTTP boundaries.
 */

export class AdminFootageValidationError extends Error {
  readonly code = "invalid_input" as const;

  constructor() {
    super("Admin Footage input is invalid.");
    this.name = "AdminFootageValidationError";
  }
}

export class FootageSlugConflictError extends Error {
  readonly code = "footage_slug_conflict" as const;

  constructor() {
    super("Footage slug is already in use.");
    this.name = "FootageSlugConflictError";
  }
}

export class CategoryNotFoundError extends Error {
  readonly code = "category_not_found" as const;

  constructor() {
    super("Category does not exist.");
    this.name = "CategoryNotFoundError";
  }
}

export class TagNotFoundError extends Error {
  readonly code = "tag_not_found" as const;

  constructor() {
    super("One or more Tags do not exist.");
    this.name = "TagNotFoundError";
  }
}

export class FootageNotFoundError extends Error {
  readonly code = "footage_not_found" as const;

  constructor() {
    super("Footage does not exist.");
    this.name = "FootageNotFoundError";
  }
}

export class FootageNotReadyToPublishError extends Error {
  readonly code = "footage_not_ready_to_publish" as const;

  constructor() {
    super("Footage metadata is not ready to publish.");
    this.name = "FootageNotReadyToPublishError";
  }
}

export class FootagePreviewNotReadyError extends Error {
  readonly code = "footage_preview_not_ready" as const;

  constructor() {
    super("Footage requires a ready preview before publication.");
    this.name = "FootagePreviewNotReadyError";
  }
}

export class FootageCoverNotReadyError extends Error {
  readonly code = "footage_cover_not_ready" as const;

  constructor() {
    super("Footage requires a stored cover before publication.");
    this.name = "FootageCoverNotReadyError";
  }
}
