import { describe, expect, it } from "vitest";
import { z } from "zod";
import { clientEnv, parseClientEnv } from "@/lib/env/client";
import { EnvironmentConfigError, parseEnv } from "@/lib/env/parse-env";

const exampleSchema = z.object({
  REQUIRED_SETTING: z.string().min(1),
  MODE: z.enum(["on", "off"]),
});

function captureConfigError(parse: () => unknown): EnvironmentConfigError {
  try {
    parse();
  } catch (error) {
    if (error instanceof EnvironmentConfigError) {
      return error;
    }

    throw error;
  }

  throw new Error("expected environment validation to fail");
}

describe("parseEnv", () => {
  it("parses valid configuration and drops undeclared keys", () => {
    expect(
      parseEnv(exampleSchema, {
        REQUIRED_SETTING: "enabled",
        MODE: "on",
        SERVER_ONLY_SECRET: "super-secret-value",
      }),
    ).toEqual({
      REQUIRED_SETTING: "enabled",
      MODE: "on",
    });
  });

  it("fails clearly when a required value is missing", () => {
    const error = captureConfigError(() =>
      parseEnv(exampleSchema, {
        MODE: "on",
      }),
    );

    expect(error.message).toContain("REQUIRED_SETTING");
    expect(error.message).toContain("Invalid environment configuration");
  });

  it("fails clearly when a value is invalid without printing it", () => {
    const secret = "super-secret-value";
    const error = captureConfigError(() =>
      parseEnv(exampleSchema, {
        REQUIRED_SETTING: "enabled",
        MODE: secret,
      }),
    );

    expect(error.message).toContain("MODE");
    expect(error.message).toContain("Invalid environment configuration");
    expect(error.message).not.toContain(secret);
  });
});

describe("client environment", () => {
  it("does not expose an undeclared server-only value", () => {
    const secret = "super-secret-value";
    const parsed = parseClientEnv(
      z.object({
        NEXT_PUBLIC_SITE_NAME: z.string().min(1),
      }),
      {
        NEXT_PUBLIC_SITE_NAME: "Vidora",
        SERVER_ONLY_SECRET: secret,
      },
    );

    expect(parsed).toEqual({
      NEXT_PUBLIC_SITE_NAME: "Vidora",
    });
    expect(parsed).not.toHaveProperty("SERVER_ONLY_SECRET");
    expect(JSON.stringify(parsed)).not.toContain(secret);
    expect(clientEnv).toEqual({});
  });

  it("rejects a client schema key without the public prefix", () => {
    const secret = "super-secret-value";
    const error = captureConfigError(() =>
      parseClientEnv(
        z.object({
          SERVER_ONLY_SECRET: z.string(),
        }),
        {
          SERVER_ONLY_SECRET: secret,
        },
      ),
    );

    expect(error.message).toContain("SERVER_ONLY_SECRET");
    expect(error.message).toContain("NEXT_PUBLIC_");
    expect(error.message).not.toContain(secret);
  });

  it("refuses to load server environment code outside the Next.js server runtime", async () => {
    await expect(import("@/lib/env/server")).rejects.toThrow(
      /Client Component/,
    );
  });
});
