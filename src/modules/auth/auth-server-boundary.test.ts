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
    await expect(
      import("@/modules/auth/prisma-otp-verification-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(import("@/modules/auth/verify-customer-otp")).rejects.toThrow(
      /Client Component/,
    );
    await expect(
      import("@/modules/auth/verify-admin-otp-request"),
    ).rejects.toThrow(/Client Component/);
    await expect(import("@/modules/auth/request-admin-otp")).rejects.toThrow(
      /Client Component/,
    );
    await expect(
      import("@/modules/auth/resolve-current-customer"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/resolve-current-admin"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/require-current-customer"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/require-current-admin"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/customer-session-cookie-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/admin-session-cookie-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/prisma-admin-otp-verification-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(import("@/modules/auth/provision-admin")).rejects.toThrow(
      /Client Component/,
    );
  });
});
