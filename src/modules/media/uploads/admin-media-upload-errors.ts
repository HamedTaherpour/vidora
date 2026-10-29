export class AdminMediaUploadValidationError extends Error {
  readonly code = "invalid_input" as const;

  constructor(message = "Invalid Admin media upload input.") {
    super(message);
    this.name = "AdminMediaUploadValidationError";
  }
}

export class FootageNotFoundForUploadError extends Error {
  readonly code = "footage_not_found" as const;

  constructor() {
    super("Footage not found for media upload.");
    this.name = "FootageNotFoundForUploadError";
  }
}

export class PreviewAlreadyReadyError extends Error {
  readonly code = "preview_already_ready" as const;

  constructor() {
    super(
      "This Footage already has a ready preview. Replacement is not defined.",
    );
    this.name = "PreviewAlreadyReadyError";
  }
}

export class UploadSessionNotFoundError extends Error {
  readonly code = "upload_not_found" as const;

  constructor() {
    super("Upload session not found.");
    this.name = "UploadSessionNotFoundError";
  }
}

export class UploadSessionNotActiveError extends Error {
  readonly code = "upload_not_active" as const;

  constructor() {
    super("Upload session is not active.");
    this.name = "UploadSessionNotActiveError";
  }
}

export class UploadCompletionFailedError extends Error {
  readonly code = "upload_completion_failed" as const;

  constructor() {
    super("Upload completion failed.");
    this.name = "UploadCompletionFailedError";
  }
}
