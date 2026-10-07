import { describe, expect, it } from "vitest";

describe("Admin Footage server boundaries", () => {
  it("keeps Prisma Admin Footage persistence out of the client runtime", async () => {
    await expect(
      import("@/modules/footage/prisma-admin-footage-store"),
    ).rejects.toThrow(/Client Component/);
  });
});
