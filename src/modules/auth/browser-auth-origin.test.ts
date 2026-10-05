import { describe, expect, it } from "vitest";
import {
  LOCAL_DEVELOPMENT_ORIGIN,
  allowedBrowserAuthOrigins,
  isAbsoluteHttpOrigin,
  isAllowedBrowserAuthOrigin,
} from "@/modules/auth/browser-auth-origin";

const DEPLOYED_ORIGIN = "https://shop.example";

describe("browser auth origin allowlist", () => {
  it("allows the documented local development origin when APP_ORIGIN is omitted outside production", () => {
    expect(allowedBrowserAuthOrigins(undefined, "development")).toEqual([
      LOCAL_DEVELOPMENT_ORIGIN,
    ]);
    expect(allowedBrowserAuthOrigins(undefined, "test")).toEqual([
      LOCAL_DEVELOPMENT_ORIGIN,
    ]);
    expect(LOCAL_DEVELOPMENT_ORIGIN).toBe("http://localhost:3000");
  });

  it("adds one configured origin and keeps local development outside production", () => {
    expect(allowedBrowserAuthOrigins(DEPLOYED_ORIGIN, "development")).toEqual([
      LOCAL_DEVELOPMENT_ORIGIN,
      DEPLOYED_ORIGIN,
    ]);
  });

  it("lists the local development origin once when it is also APP_ORIGIN outside production", () => {
    expect(
      allowedBrowserAuthOrigins(LOCAL_DEVELOPMENT_ORIGIN, "development"),
    ).toEqual([LOCAL_DEVELOPMENT_ORIGIN]);
  });

  it("accepts only the configured APP_ORIGIN in production", () => {
    expect(allowedBrowserAuthOrigins(DEPLOYED_ORIGIN, "production")).toEqual([
      DEPLOYED_ORIGIN,
    ]);
  });

  it("rejects localhost implicitly in production even when APP_ORIGIN is set", () => {
    const allowedOrigins = allowedBrowserAuthOrigins(
      DEPLOYED_ORIGIN,
      "production",
    );

    expect(allowedOrigins).not.toContain(LOCAL_DEVELOPMENT_ORIGIN);
    expect(
      isAllowedBrowserAuthOrigin({
        originHeader: LOCAL_DEVELOPMENT_ORIGIN,
        allowedOrigins,
      }),
    ).toBe(false);
    expect(
      isAllowedBrowserAuthOrigin({
        originHeader: DEPLOYED_ORIGIN,
        allowedOrigins,
      }),
    ).toBe(true);
  });

  it("requires APP_ORIGIN in production", () => {
    expect(() => allowedBrowserAuthOrigins(undefined, "production")).toThrow(
      "APP_ORIGIN is required when NODE_ENV is production",
    );
  });

  it("rejects an APP_ORIGIN that is not a canonical origin", () => {
    expect(() =>
      allowedBrowserAuthOrigins("https://shop.example/login", "development"),
    ).toThrow("APP_ORIGIN must be an absolute http or https origin");
    expect(() => allowedBrowserAuthOrigins("", "development")).toThrow(
      "APP_ORIGIN must be an absolute http or https origin",
    );
    expect(() =>
      allowedBrowserAuthOrigins("https://shop.example/login", "production"),
    ).toThrow("APP_ORIGIN must be an absolute http or https origin");
  });
});

describe("absolute http origin", () => {
  it("accepts a canonical http or https origin", () => {
    expect(isAbsoluteHttpOrigin("http://localhost:3000")).toBe(true);
    expect(isAbsoluteHttpOrigin("https://shop.example")).toBe(true);
    expect(isAbsoluteHttpOrigin("http://[::1]:3000")).toBe(true);
  });

  it("rejects paths, userinfo, opaque origins, and default ports written out", () => {
    expect(isAbsoluteHttpOrigin("null")).toBe(false);
    expect(isAbsoluteHttpOrigin("http://localhost:3000/login")).toBe(false);
    expect(isAbsoluteHttpOrigin("http://localhost:3000/")).toBe(false);
    expect(isAbsoluteHttpOrigin("http://user:pass@localhost:3000")).toBe(false);
    expect(isAbsoluteHttpOrigin("https://shop.example:443")).toBe(false);
    expect(isAbsoluteHttpOrigin("HTTP://localhost:3000")).toBe(false);
    expect(
      isAbsoluteHttpOrigin("http://localhost:3000, https://shop.example"),
    ).toBe(false);
  });
});

describe("browser Origin header contract", () => {
  const developmentOrigins = allowedBrowserAuthOrigins(
    DEPLOYED_ORIGIN,
    "development",
  );

  it("allows an exact allowlisted Origin outside production", () => {
    expect(
      isAllowedBrowserAuthOrigin({
        originHeader: LOCAL_DEVELOPMENT_ORIGIN,
        allowedOrigins: developmentOrigins,
      }),
    ).toBe(true);
    expect(
      isAllowedBrowserAuthOrigin({
        originHeader: DEPLOYED_ORIGIN,
        allowedOrigins: developmentOrigins,
      }),
    ).toBe(true);
  });

  it.each([
    null,
    "null",
    "",
    "https://attacker.example",
    "http://localhost:3000.attacker.example",
    "http://127.0.0.1:3000",
    "http://localhost:3000/login",
    "http://user:pass@localhost:3000",
    "HTTP://localhost:3000",
    "http://localhost:3000, https://attacker.example",
  ])("rejects Origin %j", (originHeader) => {
    expect(
      isAllowedBrowserAuthOrigin({
        originHeader,
        allowedOrigins: developmentOrigins,
      }),
    ).toBe(false);
  });
});
