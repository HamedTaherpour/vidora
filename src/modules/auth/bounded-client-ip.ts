import { isIP } from "node:net";

const MAX_CLIENT_IP_LENGTH = 45;

/**
 * Accept only a single IP address observed by the caller.
 * `Forwarded`, `X-Forwarded-For`, and `X-Real-IP` are not read here.
 * The application has no documented trusted proxy, so a header list is rejected.
 * The IP limit is only as strong as the address the request boundary supplies.
 */
export function parseBoundedClientIp(
  value: string,
): { ok: true; clientIp: string } | { ok: false } {
  if (typeof value !== "string") {
    return { ok: false };
  }

  if (value.length === 0 || value.length > MAX_CLIENT_IP_LENGTH) {
    return { ok: false };
  }

  if (value !== value.trim()) {
    return { ok: false };
  }

  if (isIP(value) === 0) {
    return { ok: false };
  }

  return { ok: true, clientIp: value };
}
