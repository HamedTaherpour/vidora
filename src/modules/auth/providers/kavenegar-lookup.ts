import { OTP_CODE_LENGTH } from "@/modules/auth/otp/otp-policy";
import { SmsSendError } from "@/modules/auth/providers/sms-provider";

const CANONICAL_IRANIAN_MOBILE = /^\+989\d{9}$/;
const KAVENEGAR_LOOKUP_ORIGIN = "https://api.kavenegar.com";
export const KAVENEGAR_REQUEST_TIMEOUT_MS = 10_000;

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type SendKavenegarVerifyLookupParams = {
  apiKey: string;
  template: string;
  phone: string;
  code: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

/**
 * Kavenegar documents Iranian receptors as `09...`.
 * International receptors use a `00` country-code prefix.
 * This mapping is provider formatting of an already-canonical phone.
 */
export function kavenegarReceptorFromCanonicalPhone(phone: string): string {
  if (!CANONICAL_IRANIAN_MOBILE.test(phone)) {
    throw new SmsSendError("response");
  }

  return `0${phone.slice(3)}`;
}

function readReturnStatus(body: unknown): number | null {
  if (typeof body !== "object" || body === null || !("return" in body)) {
    return null;
  }

  const responseReturn = body.return;

  if (
    typeof responseReturn !== "object" ||
    responseReturn === null ||
    !("status" in responseReturn)
  ) {
    return null;
  }

  return typeof responseReturn.status === "number"
    ? responseReturn.status
    : null;
}

/**
 * Kavenegar verify/lookup, the current OTP method.
 * Official contract: `GET` or `POST` `https://api.kavenegar.com/v1/{API-KEY}/verify/lookup.json`
 * with required `receptor`, `token`, and `template`. Default `type` is SMS.
 * POST puts the token in the body. The API key stays in the path because that
 * is the provider URL. Callers must not log this URL or the response body:
 * `entries[].message` echoes the OTP.
 */
export async function sendKavenegarVerifyLookup({
  apiKey,
  template,
  phone,
  code,
  fetchImpl = fetch,
  timeoutMs = KAVENEGAR_REQUEST_TIMEOUT_MS,
}: SendKavenegarVerifyLookupParams): Promise<void> {
  if (!new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(code)) {
    throw new SmsSendError("response");
  }

  const receptor = kavenegarReceptorFromCanonicalPhone(phone);
  const url = `${KAVENEGAR_LOOKUP_ORIGIN}/v1/${encodeURIComponent(apiKey)}/verify/lookup.json`;
  const body = new URLSearchParams({
    receptor,
    token: code,
    template,
  });

  let response: Response;

  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new SmsSendError("network");
  }

  let providerStatus: number | null = null;

  try {
    providerStatus = readReturnStatus(await response.json());
  } catch {
    providerStatus = null;
  }

  if (!response.ok || providerStatus !== 200) {
    throw new SmsSendError("http", providerStatus);
  }
}
