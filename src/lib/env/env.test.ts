import { describe, expect, it } from "vitest";
import { z } from "zod";
import { clientEnv, parseClientEnv } from "@/lib/env/client";
import { EnvironmentConfigError, parseEnv } from "@/lib/env/parse-env";
import {
  databaseUrlForPrismaCli,
  kavenegarEnvSchema,
  parseServerEnv,
  serverEnvSchema,
  storageEnvSchema,
  storageSignedReadTtlEnvSchema,
  storageSignedUploadTtlEnvSchema,
} from "@/lib/env/server-schema";

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

describe("server environment schema", () => {
  const validUrl = "postgresql://USER:PASSWORD@HOST:5432/DATABASE";
  const otpHashSecret = "a".repeat(32);

  it("accepts a postgresql connection URL and the OTP hash secret", () => {
    expect(
      parseEnv(serverEnvSchema, {
        DATABASE_URL: validUrl,
        OTP_HASH_SECRET: otpHashSecret,
        SERVER_ONLY_SECRET: "super-secret-value",
        KAVENEGAR_API_KEY: "live-provider-key",
      }),
    ).toEqual({
      DATABASE_URL: validUrl,
      OTP_HASH_SECRET: otpHashSecret,
      DEV_AUTH_BYPASS: "false",
    });
  });

  it("accepts a postgres connection URL", () => {
    const postgresUrl = "postgres://USER:PASSWORD@HOST:5432/DATABASE";

    expect(
      parseEnv(serverEnvSchema, {
        DATABASE_URL: postgresUrl,
        OTP_HASH_SECRET: otpHashSecret,
      }).DATABASE_URL,
    ).toBe(postgresUrl);
  });

  it("requires an OTP hash secret of at least 32 characters", () => {
    const shortSecret = "short-secret-value";
    const error = captureConfigError(() =>
      parseEnv(serverEnvSchema, {
        DATABASE_URL: validUrl,
        OTP_HASH_SECRET: shortSecret,
      }),
    );

    expect(error.message).toContain("OTP_HASH_SECRET");
    expect(error.message).not.toContain(shortSecret);
    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "KAVENEGAR_API_KEY",
    );
    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "KAVENEGAR_OTP_TEMPLATE",
    );
  });

  it("fails clearly when DATABASE_URL is missing", () => {
    const error = captureConfigError(() => parseEnv(serverEnvSchema, {}));

    expect(error.message).toContain("DATABASE_URL");
    expect(error.message).toContain("Invalid environment configuration");
  });

  it("rejects a non-PostgreSQL URL without printing it", () => {
    const secret = "super-secret-value";
    const error = captureConfigError(() =>
      parseEnv(serverEnvSchema, {
        DATABASE_URL: `mysql://user:${secret}@HOST:3306/DATABASE`,
      }),
    );

    expect(error.message).toContain("DATABASE_URL");
    expect(error.message).toContain("postgresql://");
    expect(error.message).not.toContain(secret);
  });

  it("accepts an omitted APP_ORIGIN outside production and one canonical origin", () => {
    expect(
      parseServerEnv({
        DATABASE_URL: validUrl,
        OTP_HASH_SECRET: otpHashSecret,
        NODE_ENV: "development",
      }).APP_ORIGIN,
    ).toBeUndefined();

    expect(
      parseServerEnv({
        DATABASE_URL: validUrl,
        OTP_HASH_SECRET: otpHashSecret,
        NODE_ENV: "test",
      }).APP_ORIGIN,
    ).toBeUndefined();

    expect(
      parseServerEnv({
        DATABASE_URL: validUrl,
        OTP_HASH_SECRET: otpHashSecret,
        NODE_ENV: "production",
        APP_ORIGIN: "https://shop.example",
      }).APP_ORIGIN,
    ).toBe("https://shop.example");
  });

  it("accepts the development auth bypass only as a server-only setting", () => {
    expect(
      parseServerEnv({
        DATABASE_URL: validUrl,
        OTP_HASH_SECRET: otpHashSecret,
        NODE_ENV: "development",
        DEV_AUTH_BYPASS: "true",
      }).DEV_AUTH_BYPASS,
    ).toBe("true");
    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "NEXT_PUBLIC_DEV_AUTH_BYPASS",
    );
  });

  it("requires APP_ORIGIN when NODE_ENV is production", () => {
    const error = captureConfigError(() =>
      parseServerEnv({
        DATABASE_URL: validUrl,
        OTP_HASH_SECRET: otpHashSecret,
        NODE_ENV: "production",
      }),
    );

    expect(error.message).toContain("APP_ORIGIN");
    expect(error.message).toContain("required when NODE_ENV is production");
    expect(error.message).toContain("Invalid environment configuration");
  });

  it("rejects an APP_ORIGIN that is not a canonical origin", () => {
    const error = captureConfigError(() =>
      parseServerEnv({
        DATABASE_URL: validUrl,
        OTP_HASH_SECRET: otpHashSecret,
        APP_ORIGIN: "https://shop.example/login",
      }),
    );

    expect(error.message).toContain("APP_ORIGIN");
    expect(error.message).toContain("absolute http or https origin");
    expect(error.message).not.toContain("https://shop.example/login");
  });

  it("rejects an empty DATABASE_URL without using it as a default", () => {
    const error = captureConfigError(() =>
      parseEnv(serverEnvSchema, {
        DATABASE_URL: "",
      }),
    );

    expect(error.message).toContain("DATABASE_URL");
    expect(error.message).toContain("postgresql://");
  });
});

describe("kavenegar environment schema", () => {
  it("accepts the lookup credentials without exposing them through boot config", () => {
    expect(
      parseEnv(kavenegarEnvSchema, {
        KAVENEGAR_API_KEY: "test-api-key",
        KAVENEGAR_OTP_TEMPLATE: "myverification",
        OTP_HASH_SECRET: "a".repeat(32),
      }),
    ).toEqual({
      KAVENEGAR_API_KEY: "test-api-key",
      KAVENEGAR_OTP_TEMPLATE: "myverification",
    });
  });

  it("rejects a missing API key and an underscored template without printing them", () => {
    const apiKey = "live-provider-key";
    const missingKey = captureConfigError(() =>
      parseEnv(kavenegarEnvSchema, {
        KAVENEGAR_OTP_TEMPLATE: "myverification",
      }),
    );
    const badTemplate = captureConfigError(() =>
      parseEnv(kavenegarEnvSchema, {
        KAVENEGAR_API_KEY: apiKey,
        KAVENEGAR_OTP_TEMPLATE: "my_verification",
      }),
    );

    expect(missingKey.message).toContain("KAVENEGAR_API_KEY");
    expect(badTemplate.message).toContain("KAVENEGAR_OTP_TEMPLATE");
    expect(badTemplate.message).not.toContain(apiKey);
    expect(badTemplate.message).not.toContain("my_verification");
  });
});

describe("storage environment schema", () => {
  const validStorageEnv = {
    STORAGE_ENDPOINT: "https://storage.c2.liara.site",
    STORAGE_REGION: "default",
    STORAGE_BUCKET: "example-bucket",
    STORAGE_ACCESS_KEY: "example-access-key",
    STORAGE_SECRET_KEY: "example-secret-key",
    STORAGE_FORCE_PATH_STYLE: "true",
  };

  it("accepts storage credentials without exposing them through boot config", () => {
    expect(parseEnv(storageEnvSchema, validStorageEnv)).toEqual(
      validStorageEnv,
    );
    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "STORAGE_ACCESS_KEY",
    );
    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "STORAGE_SECRET_KEY",
    );
  });

  it("rejects a missing access key without printing the secret", () => {
    const secret = "example-secret-key";
    const error = captureConfigError(() =>
      parseEnv(storageEnvSchema, {
        ...validStorageEnv,
        STORAGE_ACCESS_KEY: undefined,
        STORAGE_SECRET_KEY: secret,
      }),
    );

    expect(error.message).toContain("STORAGE_ACCESS_KEY");
    expect(error.message).not.toContain(secret);
  });

  it("keeps signed-access TTL variables out of storage construction schema", () => {
    expect(Object.keys(storageEnvSchema.shape)).not.toContain(
      "STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS",
    );
    expect(Object.keys(storageEnvSchema.shape)).not.toContain(
      "STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS",
    );
    expect(Object.keys(storageEnvSchema.shape)).not.toContain(
      "STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS",
    );
    expect(Object.keys(storageEnvSchema.shape)).not.toContain(
      "STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS",
    );
    expect(
      parseEnv(storageSignedReadTtlEnvSchema, {
        STORAGE_SIGNED_COVER_READ_TTL_SECONDS: "90",
        STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS: "120",
        STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS: "30",
      }),
    ).toEqual({
      STORAGE_SIGNED_COVER_READ_TTL_SECONDS: 90,
      STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS: 120,
      STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS: 30,
    });
    expect(
      parseEnv(storageSignedUploadTtlEnvSchema, {
        STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS: "180",
        STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS: "60",
      }),
    ).toEqual({
      STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS: 180,
      STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS: 60,
    });
  });
});

describe("databaseUrlForPrismaCli", () => {
  it("allows Prisma Client generation when DATABASE_URL is absent", () => {
    expect(databaseUrlForPrismaCli({})).toBe("");
  });

  it("returns a valid URL unchanged without requiring the OTP hash secret", () => {
    const databaseUrl = "postgresql://USER:PASSWORD@HOST:5432/DATABASE";

    expect(
      databaseUrlForPrismaCli({
        DATABASE_URL: databaseUrl,
      }),
    ).toBe(databaseUrl);
  });

  it("rejects an invalid URL without printing it", () => {
    const secret = "super-secret-value";
    const error = captureConfigError(() =>
      databaseUrlForPrismaCli({
        DATABASE_URL: secret,
      }),
    );

    expect(error.message).toContain("DATABASE_URL");
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
        OTP_HASH_SECRET: "a".repeat(32),
        KAVENEGAR_API_KEY: secret,
        STORAGE_ACCESS_KEY: secret,
        STORAGE_SECRET_KEY: secret,
      },
    );

    expect(parsed).toEqual({
      NEXT_PUBLIC_SITE_NAME: "Vidora",
    });
    expect(parsed).not.toHaveProperty("SERVER_ONLY_SECRET");
    expect(parsed).not.toHaveProperty("OTP_HASH_SECRET");
    expect(parsed).not.toHaveProperty("KAVENEGAR_API_KEY");
    expect(parsed).not.toHaveProperty("STORAGE_ACCESS_KEY");
    expect(parsed).not.toHaveProperty("STORAGE_SECRET_KEY");
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
