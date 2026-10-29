import { describe, expect, it } from "vitest";

import { assertDirectStorageUrl } from "@/modules/media/uploads/browser-multipart-upload";

import {
  parseCompleteUploadResponse,
  parseInitiateUploadResponse,
  parseSignPartResponse,
  parseUploadKind,
  uploadFailureMessage,
} from "./admin-footage-upload-panel-helpers";

const validInitiateResponse = {
  status: "ok",
  upload: {
    uploadId: "upload-1",
    footageFileId: "file-1",
    objectKey: "footage/file-1/preview",
    kind: "PREVIEW",
    label: "Preview",
    sizeBytes: 100,
    mimeType: "video/mp4",
    partSizeBytes: 50,
    partCount: 2,
    maxUploadBytes: 1000,
  },
};

const validPartResponse = {
  status: "ok",
  part: {
    uploadId: "upload-1",
    partNumber: 1,
    url: "https://storage.example.test/upload-part",
    method: "PUT",
    expiresAt: "2026-10-24T00:00:00.000Z",
    objectKey: "footage/file-1/preview",
  },
};

const validCompleteResponse = {
  status: "ok",
  completed: {
    footageFileId: "file-1",
    objectKey: "footage/file-1/preview",
    sizeBytes: 100,
    uploadStatus: "READY",
  },
};

describe("admin footage upload response parsers", () => {
  it("accepts only the approved upload kinds", () => {
    expect(parseUploadKind("PREVIEW")).toBe("PREVIEW");
    expect(parseUploadKind("ORIGINAL")).toBe("ORIGINAL");
    expect(parseUploadKind("OTHER")).toBeNull();
  });

  it("preserves valid initiation, signing, and completion responses", () => {
    expect(parseInitiateUploadResponse(validInitiateResponse)).toEqual(
      validInitiateResponse,
    );
    expect(parseSignPartResponse(validPartResponse)).toEqual(validPartResponse);
    expect(parseCompleteUploadResponse(validCompleteResponse)).toEqual(
      validCompleteResponse,
    );
  });

  it("rejects malformed initiation responses", () => {
    expect(
      parseInitiateUploadResponse({
        ...validInitiateResponse,
        upload: { ...validInitiateResponse.upload, partCount: "2" },
      }),
    ).toEqual({ status: "invalid_response" });
  });

  it("rejects malformed part-signing responses and unsafe destinations", () => {
    expect(
      parseSignPartResponse({
        ...validPartResponse,
        part: { ...validPartResponse.part, method: "POST" },
      }),
    ).toEqual({ status: "invalid_response" });
    expect(
      parseSignPartResponse({
        ...validPartResponse,
        part: { ...validPartResponse.part, url: "javascript:alert(1)" },
      }),
    ).toEqual({ status: "invalid_response" });
    expect(
      parseSignPartResponse({
        ...validPartResponse,
        part: {
          ...validPartResponse.part,
          url: "https://user:secret@storage.example.test/upload",
        },
      }),
    ).toEqual({ status: "invalid_response" });
  });

  it("rejects malformed direct storage URLs without requiring a host allowlist", () => {
    expect(() =>
      assertDirectStorageUrl("not-a-url", "https://app.example.test"),
    ).toThrow();
    expect(() =>
      assertDirectStorageUrl("javascript:alert(1)", "https://app.example.test"),
    ).toThrow();
    expect(() =>
      assertDirectStorageUrl(
        "https://user:secret@storage.example.test/upload",
        "https://app.example.test",
      ),
    ).toThrow();
    expect(() =>
      assertDirectStorageUrl(
        "https://app.example.test/upload",
        "https://app.example.test",
      ),
    ).toThrow("object storage");
  });

  it("rejects malformed completion responses", () => {
    expect(
      parseCompleteUploadResponse({
        ...validCompleteResponse,
        completed: { ...validCompleteResponse.completed, sizeBytes: null },
      }),
    ).toEqual({ status: "invalid_response" });
  });

  it("maps expected and unknown failures to safe Persian messages", () => {
    const expected = uploadFailureMessage(
      "upload_completion_failed",
      "complete",
    );
    const unknown = uploadFailureMessage("unknown", "upload");

    expect(expected).toContain("تکمیل آپلود");
    expect(unknown).toBe("آپلود متوقف شد. دوباره تلاش کنید.");
    expect(expected).not.toContain("storage");
    expect(unknown).not.toContain("provider");
  });
});
