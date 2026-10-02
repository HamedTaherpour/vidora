import { describe, expect, it } from "vitest";

describe("auth server boundaries", () => {
  it("keeps OTP persistence and the Kavenegar provider out of the client runtime", async () => {
    await expect(import("@/modules/auth/request-customer-otp")).rejects.toThrow(
      /Client Component/,
    );
    await expect(
      import("@/modules/auth/kavenegar-sms-provider"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/prisma-otp-request-store"),
    ).rejects.toThrow(/Client Component/);
  });
});
