import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/client", () => ({ prisma: {} }));
vi.mock("@/modules/auth/sessions/resolve-current-admin", () => ({
  resolveCurrentAdmin: async () => ({
    status: "authenticated",
    adminId: "dev-admin-bypass",
    phone: "+989000000000",
    expiresAt: new Date("2026-12-01T00:00:00.000Z"),
    isDevelopmentBypass: true,
  }),
}));
vi.mock("@/modules/media/uploads/handle-admin-media-upload", () => ({
  assertAdminMediaUploadOrigin: () => true,
}));
vi.mock("@/modules/media/covers/prisma-admin-footage-cover-store", () => ({
  createPrismaAdminFootageCoverStore: () => ({}),
}));
vi.mock("@/modules/media/covers/admin-footage-cover", () => ({
  saveAdminFootageCover: vi.fn(),
  FootageCoverStorageError: class extends Error {},
  InvalidFootageCoverError: class extends Error {},
}));
vi.mock("@/modules/media/storage/create-object-storage", () => ({
  createObjectStorage: () => ({}),
}));
vi.mock("@/modules/media/covers/public-footage-cover", () => ({
  createPublicFootageCoverAccess: vi.fn(),
  CoverNotAvailableError: class extends Error {},
}));

import { POST } from "@/app/api/admin/footage/[id]/cover/route";

describe("Admin cover write authorization", () => {
  it("denies the development page-preview identity before reading or writing the cover", async () => {
    const formData = new FormData();
    formData.set(
      "file",
      new File(["cover"], "cover.jpg", { type: "image/jpeg" }),
    );

    const response = await POST(
      new Request(
        "http://localhost:3000/api/admin/footage/11111111-1111-4111-8111-111111111111/cover",
        {
          method: "POST",
          headers: { origin: "http://localhost:3000" },
          body: formData,
        },
      ),
      {
        params: Promise.resolve({
          id: "11111111-1111-4111-8111-111111111111",
        }),
      },
    );

    expect(response.status).toBe(403);
  });
});
