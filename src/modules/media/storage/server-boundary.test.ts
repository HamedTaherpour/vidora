import { describe, expect, it } from "vitest";

describe("media server boundaries", () => {
  it("keeps storage provider and signed-access policy out of Client Components", async () => {
    await expect(
      import("@/modules/media/storage/liara-s3-object-storage"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/media/storage/storage-access-policy"),
    ).rejects.toThrow(/Client Component/);
  });
});
