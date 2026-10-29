import { describe, expect, it, vi } from "vitest";
import { handleOtpVerificationRequest } from "@/modules/auth/otp/handle-otp-verification-request";
import { LOCAL_DEVELOPMENT_ORIGIN } from "@/modules/auth/browser/browser-auth-origin";
import { generateSessionToken } from "@/modules/auth/sessions/session-token";
import type { VerifyOtpResult } from "@/modules/auth/otp/verify-otp";

const PHONE = "09121234567";
const CODE = "123456";
const DEPLOYED_ORIGIN = "https://shop.example";

function verificationRequest(
  origin: string | null,
  extraHeaders?: HeadersInit,
): Request {
  const headers = new Headers(extraHeaders);

  if (origin !== null) {
    headers.set("origin", origin);
  }

  return new Request("http://localhost:3000/api/auth/otp/verify", {
    method: "POST",
    headers,
    body: JSON.stringify({ phoneNumber: PHONE, code: CODE }),
  });
}

function harness(
  appOrigin: string | undefined = undefined,
  nodeEnv: string | undefined = "development",
) {
  const verify = vi.fn(async (): Promise<VerifyOtpResult> => ({
    status: "authenticated",
    sessionToken: generateSessionToken(),
    expiresAt: new Date("2026-11-01T00:00:00.000Z"),
  }));
  const setSessionCookie = vi.fn<(sessionToken: string) => Promise<void>>(
    async () => {},
  );

  return {
    verify,
    setSessionCookie,
    post(request: Request) {
      return handleOtpVerificationRequest({
        request,
        appOrigin,
        nodeEnv,
        verify,
        setSessionCookie,
      });
    },
  };
}

describe("OTP verification origin protection", () => {
  it("accepts same-origin verification and sets the session cookie", async () => {
    const { post, verify, setSessionCookie } = harness();
    const response = await post(verificationRequest(LOCAL_DEVELOPMENT_ORIGIN));
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({
      status: "authenticated",
      expiresAt: "2026-11-01T00:00:00.000Z",
    });
    expect(verify).toHaveBeenCalledOnce();
    expect(verify).toHaveBeenCalledWith({ phoneNumber: PHONE, code: CODE });
    expect(setSessionCookie).toHaveBeenCalledOnce();
    const token = setSessionCookie.mock.calls[0]?.[0];
    expect(token).toEqual(expect.any(String));
    expect(JSON.stringify(body)).not.toContain(token);
  });

  it("accepts the configured application origin and still accepts local development outside production", async () => {
    const { post, verify, setSessionCookie } = harness(DEPLOYED_ORIGIN);

    const deployed = await post(
      verificationRequest(DEPLOYED_ORIGIN, {
        referer: `${DEPLOYED_ORIGIN}/session`,
        "x-forwarded-host": "attacker.example",
      }),
    );
    const local = await post(verificationRequest(LOCAL_DEVELOPMENT_ORIGIN));

    expect(deployed.status).toBe(200);
    expect(local.status).toBe(200);
    expect(verify).toHaveBeenCalledTimes(2);
    expect(setSessionCookie).toHaveBeenCalledTimes(2);
  });

  it("accepts only the configured APP_ORIGIN in production", async () => {
    const { post, verify, setSessionCookie } = harness(
      DEPLOYED_ORIGIN,
      "production",
    );

    const deployed = await post(verificationRequest(DEPLOYED_ORIGIN));
    const local = await post(verificationRequest(LOCAL_DEVELOPMENT_ORIGIN));

    expect(deployed.status).toBe(200);
    expect(local.status).toBe(403);
    expect(await local.json()).toEqual({ status: "rejected" });
    expect(verify).toHaveBeenCalledOnce();
    expect(setSessionCookie).toHaveBeenCalledOnce();
  });

  it("rejects a cross-origin request before verification, including spoofed proxy headers", async () => {
    const { post, verify, setSessionCookie } = harness(DEPLOYED_ORIGIN);
    const response = await post(
      verificationRequest("https://attacker.example", {
        host: "localhost:3000",
        referer: `${LOCAL_DEVELOPMENT_ORIGIN}/session`,
        forwarded: "host=localhost:3000;proto=http",
        "x-forwarded-host": "localhost:3000",
        "x-forwarded-proto": "http",
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ status: "rejected" });
    expect(verify).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects a missing Origin even when Referer names this application", async () => {
    const { post, verify, setSessionCookie } = harness();
    const response = await post(
      verificationRequest(null, {
        referer: `${LOCAL_DEVELOPMENT_ORIGIN}/session`,
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ status: "rejected" });
    expect(verify).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it.each([
    "null",
    "",
    "http://localhost:3000.attacker.example",
    "http://127.0.0.1:3000",
    "http://localhost:3000/login",
    "http://user:pass@localhost:3000",
    "HTTP://localhost:3000",
    "http://localhost:3000, https://attacker.example",
  ])(
    "rejects invalid Origin %j without consuming the OTP or creating a session",
    async (origin) => {
      const { post, verify, setSessionCookie } = harness(DEPLOYED_ORIGIN);
      const response = await post(verificationRequest(origin));

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ status: "rejected" });
      expect(verify).not.toHaveBeenCalled();
      expect(setSessionCookie).not.toHaveBeenCalled();
    },
  );

  it("does not set a session cookie when verification fails", async () => {
    const { post, verify, setSessionCookie } = harness();
    verify.mockResolvedValueOnce({ status: "invalid_code" });

    const response = await post(verificationRequest(LOCAL_DEVELOPMENT_ORIGIN));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ status: "invalid_code" });
    expect(verify).toHaveBeenCalledOnce();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("fails a misconfigured APP_ORIGIN before verification", async () => {
    const { post, verify, setSessionCookie } = harness(
      "https://shop.example/login",
    );

    await expect(
      post(verificationRequest(LOCAL_DEVELOPMENT_ORIGIN)),
    ).rejects.toThrow("APP_ORIGIN must be an absolute http or https origin");
    expect(verify).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });
});
