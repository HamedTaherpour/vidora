/**
 * Documented local development origin from the README and `next dev`.
 * Allowed only outside production. It is not derived from `Host` or
 * from forwarded headers. This process has no trusted-proxy model.
 */
export const LOCAL_DEVELOPMENT_ORIGIN = "http://localhost:3000";

/**
 * Canonical `http` or `https` origin: scheme and host, a port only when
 * it is not the default, and no path, query, userinfo, or fragment.
 * Comparison uses the raw header so a URL parser cannot fold a lookalike
 * into an allowlisted origin.
 */
export function isAbsoluteHttpOrigin(value: string): boolean {
  if (value.length === 0 || value !== value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.username === "" &&
      url.password === "" &&
      url.origin === value
    );
  } catch {
    return false;
  }
}

function requireCanonicalAppOrigin(appOrigin: string): string {
  if (!isAbsoluteHttpOrigin(appOrigin)) {
    throw new Error(
      "APP_ORIGIN must be an absolute http or https origin with no path, query, or userinfo.",
    );
  }

  return appOrigin;
}

/**
 * Origins accepted by the OTP verification route.
 *
 * Development and test allow `http://localhost:3000`. `APP_ORIGIN` may
 * optionally add one more exact origin.
 *
 * Production never implies localhost. `APP_ORIGIN` is required and is the
 * only accepted origin. An invalid value fails closed instead of being ignored.
 */
export function allowedBrowserAuthOrigins(
  appOrigin: string | undefined,
  nodeEnv: string | undefined,
): readonly string[] {
  if (nodeEnv === "production") {
    if (appOrigin === undefined) {
      throw new Error("APP_ORIGIN is required when NODE_ENV is production.");
    }

    return [requireCanonicalAppOrigin(appOrigin)];
  }

  if (appOrigin === undefined) {
    return [LOCAL_DEVELOPMENT_ORIGIN];
  }

  const configured = requireCanonicalAppOrigin(appOrigin);

  if (configured === LOCAL_DEVELOPMENT_ORIGIN) {
    return [LOCAL_DEVELOPMENT_ORIGIN];
  }

  return [LOCAL_DEVELOPMENT_ORIGIN, configured];
}

type BrowserAuthOriginCheck = {
  originHeader: string | null;
  allowedOrigins: readonly string[];
};

/**
 * Browser POST contract from Fetch and HTML: a non-GET request includes
 * one `Origin` header, or the literal `null` for an opaque origin.
 * A missing header is rejected. `Referer` is not a fallback.
 */
export function isAllowedBrowserAuthOrigin({
  originHeader,
  allowedOrigins,
}: BrowserAuthOriginCheck): boolean {
  if (originHeader === null || !isAbsoluteHttpOrigin(originHeader)) {
    return false;
  }

  return allowedOrigins.includes(originHeader);
}
