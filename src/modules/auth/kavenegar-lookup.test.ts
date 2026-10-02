import { describe, expect, it } from "vitest";

import { sendKavenegarVerifyLookup } from "@/modules/auth/kavenegar-lookup";
import { SmsSendError } from "@/modules/auth/sms-provider";

const API_KEY = "test-api-key";
const TEMPLATE = "myverification";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Kavenegar verify lookup", () => {
  it("posts the canonical phone as an Iranian receptor and keeps the token out of the URL", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];

    await sendKavenegarVerifyLookup({
      apiKey: API_KEY,
      template: TEMPLATE,
      phone: "+989121234567",
      code: "042817",
      fetchImpl: async (url, init) => {
        calls.push({ url, init });

        return jsonResponse(200, {
          return: { status: 200, message: "ok" },
          entries: [{ message: "the otp is 042817" }],
        });
      },
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(
      `https://api.kavenegar.com/v1/${API_KEY}/verify/lookup.json`,
    );
    expect(calls[0]?.url).not.toContain("042817");
    expect(calls[0]?.init?.method).toBe("POST");
    expect(calls[0]?.init?.redirect).toBe("error");

    const body = calls[0]?.init?.body;
    expect(body).toBeInstanceOf(URLSearchParams);
    expect((body as URLSearchParams).get("receptor")).toBe("09121234567");
    expect((body as URLSearchParams).get("token")).toBe("042817");
    expect((body as URLSearchParams).get("template")).toBe(TEMPLATE);
  });

  it("fails on a provider error without exposing the key or response text", async () => {
    const echoedOtp = "the otp is 042817";

    await expect(
      sendKavenegarVerifyLookup({
        apiKey: API_KEY,
        template: TEMPLATE,
        phone: "+989121234567",
        code: "042817",
        fetchImpl: async () =>
          jsonResponse(424, {
            return: { status: 424, message: "template missing" },
            entries: [{ message: echoedOtp }],
          }),
      }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(SmsSendError);
      const sendError = error as SmsSendError;
      expect(sendError.failure).toBe("http");
      expect(sendError.providerStatus).toBe(424);
      expect(sendError.message).not.toContain(API_KEY);
      expect(sendError.message).not.toContain(echoedOtp);
      expect(sendError.message).not.toContain("042817");
      return true;
    });
  });

  it("hides network failures that include the lookup URL", async () => {
    await expect(
      sendKavenegarVerifyLookup({
        apiKey: API_KEY,
        template: TEMPLATE,
        phone: "+989121234567",
        code: "042817",
        fetchImpl: async () => {
          throw new Error(
            `connect failed https://api.kavenegar.com/v1/${API_KEY}/verify/lookup.json?token=042817`,
          );
        },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(SmsSendError);
      const sendError = error as SmsSendError;
      expect(sendError.failure).toBe("network");
      expect(sendError.providerStatus).toBeNull();
      expect(sendError.message).not.toContain(API_KEY);
      expect(sendError.message).not.toContain("042817");
      return true;
    });
  });

  it("does not call the provider for a non-canonical phone", async () => {
    let called = false;

    await expect(
      sendKavenegarVerifyLookup({
        apiKey: API_KEY,
        template: TEMPLATE,
        phone: "09121234567",
        code: "042817",
        fetchImpl: async () => {
          called = true;
          return jsonResponse(200, { return: { status: 200 } });
        },
      }),
    ).rejects.toBeInstanceOf(SmsSendError);

    expect(called).toBe(false);
  });
});
