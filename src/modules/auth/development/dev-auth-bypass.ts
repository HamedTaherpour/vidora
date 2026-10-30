export const DEVELOPMENT_ADMIN_ID = "dev-admin-bypass";
export const DEVELOPMENT_ADMIN_PHONE = "+989000000000";
export const DEVELOPMENT_USER_ID = "dev-user-bypass";
export const DEVELOPMENT_USER_PHONE = "+989000000001";

export type DevelopmentAuthEnvironment = {
  NODE_ENV: string | undefined;
  DEV_AUTH_BYPASS: string | undefined;
};

export function isDevelopmentAuthBypassEnabled(
  environment: DevelopmentAuthEnvironment = {
    NODE_ENV: process.env.NODE_ENV,
    DEV_AUTH_BYPASS: process.env.DEV_AUTH_BYPASS,
  },
): boolean {
  return (
    environment.NODE_ENV === "development" &&
    environment.DEV_AUTH_BYPASS === "true"
  );
}

export function developmentIdentityExpiry(now: Date): Date {
  return new Date(now.getTime() + 60 * 60 * 1000);
}

export function isDevelopmentAuthBypassIdentity(identity: {
  isDevelopmentBypass?: boolean;
}): boolean {
  return identity.isDevelopmentBypass === true;
}
