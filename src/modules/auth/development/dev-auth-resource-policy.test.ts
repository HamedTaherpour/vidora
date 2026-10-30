import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/client", () => ({ prisma: {} }));
vi.mock("@/modules/auth/sessions/admin-session-cookie-store", () => ({
  readAdminSessionToken: async () => null,
}));
vi.mock("@/modules/auth/sessions/customer-session-cookie-store", () => ({
  readCustomerSessionToken: async () => null,
}));
vi.mock("@/modules/auth/otp/prisma-admin-otp-verification-store", () => ({
  createPrismaAdminOtpVerificationStore: () => ({
    findSessionBySecretHash: async () => null,
  }),
}));
vi.mock("@/modules/auth/otp/prisma-otp-verification-store", () => ({
  createPrismaOtpVerificationStore: () => ({
    findSessionBySecretHash: async () => null,
  }),
}));

import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import { resolveCurrentCustomer } from "@/modules/auth/sessions/resolve-current-customer";
import {
  DevelopmentAuthIsolationError,
  resolveDatabaseConnectionString,
  resolveStorageEnvironment,
} from "@/modules/auth/development/dev-auth-resource-policy";

const NORMAL_DATABASE_URL = "postgresql://normal.example/app";
const DEVELOPMENT_DATABASE_URL = "postgresql://development.example/app";

function developmentEnvironment() {
  return {
    NODE_ENV: "development",
    DEV_AUTH_BYPASS: "true",
    DEV_AUTH_BYPASS_RESOURCE: "local",
    DATABASE_URL: NORMAL_DATABASE_URL,
    DEV_DATABASE_URL: DEVELOPMENT_DATABASE_URL,
    DEV_STORAGE_ENDPOINT: "https://development-storage.example",
    DEV_STORAGE_REGION: "default",
    DEV_STORAGE_BUCKET: "development-bucket",
    DEV_STORAGE_ACCESS_KEY: "development-access-key",
    DEV_STORAGE_SECRET_KEY: "development-secret-key",
    DEV_STORAGE_FORCE_PATH_STYLE: "true",
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("development resource isolation", () => {
  it("uses dedicated development database configuration when bypass is active", () => {
    expect(resolveDatabaseConnectionString(developmentEnvironment())).toBe(
      DEVELOPMENT_DATABASE_URL,
    );
  });

  it("fails closed when the local resource marker or development database is missing", () => {
    expect(() =>
      resolveDatabaseConnectionString({
        NODE_ENV: "development",
        DEV_AUTH_BYPASS: "true",
        DATABASE_URL: NORMAL_DATABASE_URL,
      }),
    ).toThrow(DevelopmentAuthIsolationError);

    expect(() =>
      resolveDatabaseConnectionString({
        ...developmentEnvironment(),
        DEV_DATABASE_URL: undefined,
      }),
    ).toThrow(DevelopmentAuthIsolationError);

    expect(() =>
      resolveDatabaseConnectionString({
        ...developmentEnvironment(),
        DEV_DATABASE_URL: NORMAL_DATABASE_URL,
      }),
    ).toThrow(DevelopmentAuthIsolationError);
  });

  it("uses dedicated development storage configuration and fails closed when incomplete", () => {
    const resolved = resolveStorageEnvironment(developmentEnvironment());

    expect(resolved).toMatchObject({
      STORAGE_ENDPOINT: "https://development-storage.example",
      STORAGE_BUCKET: "development-bucket",
      STORAGE_ACCESS_KEY: "development-access-key",
    });

    expect(() =>
      resolveStorageEnvironment({
        ...developmentEnvironment(),
        DEV_STORAGE_SECRET_KEY: undefined,
      }),
    ).toThrow(DevelopmentAuthIsolationError);

    expect(() =>
      resolveStorageEnvironment({
        ...developmentEnvironment(),
        DEV_STORAGE_ENDPOINT: "https://normal-storage.example",
        STORAGE_ENDPOINT: "https://normal-storage.example",
        STORAGE_BUCKET: "development-bucket",
      }),
    ).toThrow(DevelopmentAuthIsolationError);
  });

  it("does not switch normal resources when bypass is disabled or outside development", () => {
    expect(
      resolveDatabaseConnectionString({
        NODE_ENV: "test",
        DEV_AUTH_BYPASS: "true",
        DATABASE_URL: NORMAL_DATABASE_URL,
        DEV_DATABASE_URL: DEVELOPMENT_DATABASE_URL,
      }),
    ).toBe(NORMAL_DATABASE_URL);

    expect(
      resolveDatabaseConnectionString({
        NODE_ENV: "production",
        DEV_AUTH_BYPASS: "true",
        DATABASE_URL: NORMAL_DATABASE_URL,
        DEV_DATABASE_URL: DEVELOPMENT_DATABASE_URL,
      }),
    ).toBe(NORMAL_DATABASE_URL);
  });
});

describe("current-session development bypass", () => {
  it("resolves deterministic development identities without a session cookie", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS", "true");

    await expect(resolveCurrentAdmin()).resolves.toMatchObject({
      status: "authenticated",
      adminId: "dev-admin-bypass",
      phone: "+989000000000",
      isDevelopmentBypass: true,
    });
    await expect(resolveCurrentCustomer()).resolves.toMatchObject({
      status: "authenticated",
      userId: "dev-user-bypass",
      phone: "+989000000001",
      isDevelopmentBypass: true,
    });
  });

  it("preserves anonymous resolution when bypass is disabled", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("DEV_AUTH_BYPASS", "false");

    await expect(resolveCurrentAdmin()).resolves.toEqual({
      status: "anonymous",
    });
    await expect(resolveCurrentCustomer()).resolves.toEqual({
      status: "anonymous",
    });
  });

  it("rejects the bypass in production even when the flag is true", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEV_AUTH_BYPASS", "true");

    await expect(resolveCurrentAdmin()).resolves.toEqual({
      status: "anonymous",
    });
    await expect(resolveCurrentCustomer()).resolves.toEqual({
      status: "anonymous",
    });
  });
});
