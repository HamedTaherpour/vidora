import { describe, expect, it } from "vitest";

describe("Prisma client", () => {
  it("refuses to load outside the Next.js server runtime", async () => {
    await expect(import("@/lib/db/client")).rejects.toThrow(/Client Component/);
  });
});
