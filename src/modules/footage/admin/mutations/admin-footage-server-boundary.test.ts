import { describe, expect, it } from "vitest";

describe("Admin Footage server boundaries", () => {
  it("keeps Prisma Admin Footage persistence out of the client runtime", async () => {
    await expect(
      import("@/modules/footage/admin/mutations/prisma-admin-footage-store"),
    ).rejects.toThrow(/Client Component/);
  });

  it("keeps Prisma Admin catalog list persistence out of the client runtime", async () => {
    await expect(
      import("@/modules/footage/admin/catalog/prisma-admin-footage-catalog-store"),
    ).rejects.toThrow(/Client Component/);
  });

  it("keeps Prisma Admin edit options persistence out of the client runtime", async () => {
    await expect(
      import("@/modules/footage/admin/edit/prisma-admin-footage-edit-options-store"),
    ).rejects.toThrow(/Client Component/);
  });
});
