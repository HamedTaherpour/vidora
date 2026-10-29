import { describe, expect, it } from "vitest";

describe("auth server boundaries", () => {
  it("keeps OTP persistence and the Kavenegar provider out of the client runtime", async () => {
    await expect(
      import("@/modules/auth/otp/request-customer-otp"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/providers/kavenegar-sms-provider"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/otp/prisma-otp-request-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/otp/prisma-otp-verification-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/otp/verify-customer-otp"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/otp/verify-admin-otp-request"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/otp/request-admin-otp"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/sessions/resolve-current-customer"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/sessions/resolve-current-admin"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/authorization/require-current-customer"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/authorization/require-current-admin"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/sessions/customer-session-cookie-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/sessions/admin-session-cookie-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/otp/prisma-admin-otp-verification-store"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/auth/provisioning/provision-admin"),
    ).rejects.toThrow(/Client Component/);
  });
});
