import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { PrismaClient } from "@/generated/prisma/client";
import { createPrismaPublicPreviewStore } from "@/modules/media/prisma-public-preview-store";

const FOOTAGE_ID = "11111111-1111-4111-8111-111111111111";

describe("Prisma public preview boundary", () => {
  it("queries only published Footage with a ready PREVIEW file", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      footageFiles: [
        { objectKey: "footage/preview.mp4", mimeType: "video/mp4" },
      ],
    });
    const client = {
      footage: { findFirst },
    } as unknown as PrismaClient;

    const result =
      await createPrismaPublicPreviewStore(client).findPublishedReadyPreview(
        FOOTAGE_ID,
      );

    expect(result).toEqual({
      footageId: FOOTAGE_ID,
      objectKey: "footage/preview.mp4",
      mimeType: "video/mp4",
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: FOOTAGE_ID,
        status: "PUBLISHED",
        footageFiles: {
          some: { kind: "PREVIEW", uploadStatus: "READY" },
        },
      },
      select: {
        footageFiles: {
          where: { kind: "PREVIEW", uploadStatus: "READY" },
          take: 1,
          select: { objectKey: true, mimeType: true },
        },
      },
    });
  });

  it("returns unavailable when no qualifying preview row exists", async () => {
    const client = {
      footage: { findFirst: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient;

    await expect(
      createPrismaPublicPreviewStore(client).findPublishedReadyPreview(
        FOOTAGE_ID,
      ),
    ).resolves.toBeNull();
  });
});
