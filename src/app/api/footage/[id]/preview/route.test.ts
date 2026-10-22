import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findPublishedReadyPreview: vi.fn(),
  createReadAccess: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({ prisma: {} }));
vi.mock("@/modules/media/prisma-public-preview-store", () => ({
  createPrismaPublicPreviewStore: () => ({
    findPublishedReadyPreview: mocks.findPublishedReadyPreview,
  }),
}));
vi.mock("@/modules/media/create-object-storage", () => ({
  createObjectStorage: () => ({
    createReadAccess: mocks.createReadAccess,
  }),
}));

import { GET } from "@/app/api/footage/[id]/preview/route";

const FOOTAGE_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW = {
  footageId: FOOTAGE_ID,
  objectKey: `footage/${FOOTAGE_ID}/preview/file.mp4`,
  mimeType: "video/mp4",
};

describe("public preview route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.findPublishedReadyPreview.mockResolvedValue(PREVIEW);
    mocks.createReadAccess.mockResolvedValue({
      url: "https://storage.example.test/signed-preview",
    });
  });

  it("allows anonymous stream access only through a preview-policy signed URL", async () => {
    const response = await GET(
      new Request(`https://app.test/api/footage/${FOOTAGE_ID}/preview`),
      { params: Promise.resolve({ id: FOOTAGE_ID }) },
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://storage.example.test/signed-preview",
    );
    expect(mocks.createReadAccess).toHaveBeenCalledWith({
      objectKey: PREVIEW.objectKey,
      accessPolicy: "preview",
      responseContentType: "video/mp4",
      responseContentDisposition: "inline",
    });
  });

  it("requests attachment headers for download mode", async () => {
    await GET(
      new Request(
        `https://app.test/api/footage/${FOOTAGE_ID}/preview?mode=download`,
      ),
      { params: Promise.resolve({ id: FOOTAGE_ID }) },
    );

    expect(mocks.createReadAccess).toHaveBeenCalledWith(
      expect.objectContaining({ responseContentDisposition: "attachment" }),
    );
  });

  it("does not expose unavailable previews or provider details", async () => {
    mocks.findPublishedReadyPreview.mockResolvedValue(null);
    const unavailable = await GET(
      new Request(`https://app.test/api/footage/${FOOTAGE_ID}/preview`),
      { params: Promise.resolve({ id: FOOTAGE_ID }) },
    );
    expect(unavailable.status).toBe(404);

    mocks.findPublishedReadyPreview.mockResolvedValue(PREVIEW);
    mocks.createReadAccess.mockRejectedValue(
      new Error("Credential=secret-and-signed-url"),
    );
    const providerFailure = await GET(
      new Request(`https://app.test/api/footage/${FOOTAGE_ID}/preview`),
      { params: Promise.resolve({ id: FOOTAGE_ID }) },
    );
    expect(providerFailure.status).toBe(503);
    expect(await providerFailure.text()).not.toContain("secret-and-signed-url");
  });

  it("rejects arbitrary delivery modes and invalid IDs", async () => {
    const invalidMode = await GET(
      new Request(
        `https://app.test/api/footage/${FOOTAGE_ID}/preview?mode=original`,
      ),
      { params: Promise.resolve({ id: FOOTAGE_ID }) },
    );
    expect(invalidMode.status).toBe(400);

    const invalidId = await GET(
      new Request("https://app.test/api/footage/not-a-uuid/preview"),
      { params: Promise.resolve({ id: "not-a-uuid" }) },
    );
    expect(invalidId.status).toBe(404);
  });
});
