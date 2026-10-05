import { parseBoundedClientIp } from "@/modules/auth/bounded-client-ip";
import {
  InvalidIranianMobileNumberError,
  normalizeIranianMobile,
} from "@/modules/auth/normalize-iranian-mobile";
import {
  assertOtpHashSecret,
  generateOtpCode,
  hashOtpCode,
} from "@/modules/auth/otp-hash";
import {
  OTP_CODE_LENGTH,
  OTP_LIFETIME_MS,
  OTP_LIFETIME_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/modules/auth/otp-policy";
import type { OtpRequestStore } from "@/modules/auth/otp-request-store";
import {
  OTP_PURPOSE_CUSTOMER,
  type OtpPurpose,
} from "@/modules/auth/otp-purpose";
import { SmsSendError, type SmsProvider } from "@/modules/auth/sms-provider";

export type RequestOtpResult =
  | {
      status: "accepted";
      expiresInSeconds: number;
      resendCooldownSeconds: number;
    }
  | { status: "cooldown"; retryAfterSeconds: number }
  | {
      status: "rate_limited";
      scope: "phone" | "ip";
      retryAfterSeconds: number;
    }
  | { status: "invalid_phone" }
  | { status: "invalid_client_ip" }
  | { status: "provider_failed" };

export type OtpRequestLogEvent = {
  operation: "otp_request";
  outcome:
    | "accepted"
    | "cooldown"
    | "phone_rate_limited"
    | "ip_rate_limited"
    | "invalid_phone"
    | "invalid_client_ip"
    | "provider_failed"
    | "challenge_rollback_failed"
    | "challenge_delivery_failed"
    | "challenge_supersede_failed";
  challengeId?: string;
  providerName?: string;
  providerStatus?: number | null;
  providerFailure?: SmsSendError["failure"] | "unknown";
};

export type RequestOtpParams = {
  phoneNumber: string;
  clientIp: string;
  now: Date;
  otpHashSecret: string;
  smsProvider: SmsProvider;
  store: OtpRequestStore;
  /**
   * Authentication context for the challenge.
   * Defaults to customer. Admin requests must pass `admin`.
   */
  purpose?: OtpPurpose;
  generateCode?: () => string;
  providerName?: string;
  log?: (event: OtpRequestLogEvent) => void;
};

function defaultLog(event: OtpRequestLogEvent): void {
  console.info(JSON.stringify(event));
}

function providerFailureFields(error: unknown): {
  providerStatus: number | null;
  providerFailure: OtpRequestLogEvent["providerFailure"];
} {
  if (error instanceof SmsSendError) {
    return {
      providerStatus: error.providerStatus,
      providerFailure: error.failure,
    };
  }

  return {
    providerStatus: null,
    providerFailure: "unknown",
  };
}

/**
 * Request an OTP for a canonical Iranian mobile number.
 * Does not create a user, verify a code, or create a session.
 * SMS runs after the reservation transaction commits. The reserved row is not
 * verifiable, and while it is unexpired it blocks every older challenge for
 * that phone. If the provider fails, that reserved challenge is deleted and
 * the previous delivered challenge may become eligible again. If the provider
 * accepts the SMS, `sentAt` is committed before older challenges are
 * superseded. A failed `sentAt` write keeps the pending row, so older
 * challenges stay blocked. A failed supersede does not undo a stored
 * delivery. The request event remains either way and still counts toward the
 * hourly limits.
 */
export async function requestOtp({
  phoneNumber,
  clientIp,
  now,
  otpHashSecret,
  smsProvider,
  store,
  purpose = OTP_PURPOSE_CUSTOMER,
  generateCode = generateOtpCode,
  providerName,
  log = defaultLog,
}: RequestOtpParams): Promise<RequestOtpResult> {
  let phone: string;

  try {
    phone = normalizeIranianMobile(phoneNumber);
  } catch (error) {
    if (error instanceof InvalidIranianMobileNumberError) {
      log({
        operation: "otp_request",
        outcome: "invalid_phone",
        providerName,
      });

      return { status: "invalid_phone" };
    }

    throw error;
  }

  const boundedIp = parseBoundedClientIp(clientIp);

  if (!boundedIp.ok) {
    log({
      operation: "otp_request",
      outcome: "invalid_client_ip",
      providerName,
    });

    return { status: "invalid_client_ip" };
  }

  assertOtpHashSecret(otpHashSecret);

  const code = generateCode();

  if (!new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(code)) {
    throw new Error("OTP generator returned a code that is not 6 digits.");
  }

  const codeHash = hashOtpCode(code, otpHashSecret);
  const reserved = await store.reserve({
    phone,
    purpose,
    clientIp: boundedIp.clientIp,
    codeHash,
    expiresAt: new Date(now.getTime() + OTP_LIFETIME_MS),
    now,
  });

  if (reserved.status === "cooldown") {
    log({
      operation: "otp_request",
      outcome: "cooldown",
      providerName,
    });

    return {
      status: "cooldown",
      retryAfterSeconds: reserved.retryAfterSeconds,
    };
  }

  if (reserved.status === "rate_limited") {
    log({
      operation: "otp_request",
      outcome:
        reserved.scope === "phone" ? "phone_rate_limited" : "ip_rate_limited",
      providerName,
    });

    return reserved;
  }

  try {
    await smsProvider.sendOtp({ phone, code });
  } catch (error) {
    const failure = providerFailureFields(error);

    try {
      await store.deleteUnsentChallenge(reserved.challengeId);
    } catch {
      log({
        operation: "otp_request",
        outcome: "challenge_rollback_failed",
        challengeId: reserved.challengeId,
        providerName,
        providerStatus: failure.providerStatus,
        providerFailure: failure.providerFailure,
      });

      return { status: "provider_failed" };
    }

    log({
      operation: "otp_request",
      outcome: "provider_failed",
      challengeId: reserved.challengeId,
      providerName,
      providerStatus: failure.providerStatus,
      providerFailure: failure.providerFailure,
    });

    return { status: "provider_failed" };
  }

  try {
    await store.recordChallengeDelivery({
      phone,
      purpose,
      challengeId: reserved.challengeId,
      sentAt: now,
    });
  } catch {
    log({
      operation: "otp_request",
      outcome: "challenge_delivery_failed",
      challengeId: reserved.challengeId,
      providerName,
    });

    throw new Error(
      "OTP challenge delivery could not be recorded after the SMS was sent.",
    );
  }

  try {
    // `sentAt` is already committed in its own write. Keep supersede separate
    // so a failure here leaves that delivery in place. Selection then keeps
    // every earlier challenge ineligible.
    await store.supersedePreviousChallenges({
      phone,
      purpose,
      keptChallengeId: reserved.challengeId,
      supersededAt: now,
    });
  } catch {
    log({
      operation: "otp_request",
      outcome: "challenge_supersede_failed",
      challengeId: reserved.challengeId,
      providerName,
    });
  }

  log({
    operation: "otp_request",
    outcome: "accepted",
    challengeId: reserved.challengeId,
    providerName,
  });

  return {
    status: "accepted",
    expiresInSeconds: OTP_LIFETIME_SECONDS,
    resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
  };
}
