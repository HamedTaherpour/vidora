import { otpCodeMatchesHash } from "@/modules/auth/otp/otp-hash";
import {
  OTP_CODE_LENGTH,
  OTP_MAX_VERIFICATION_ATTEMPTS,
} from "@/modules/auth/otp/otp-policy";
import type { OtpChallengeSelectionRow } from "@/modules/auth/otp/select-active-otp-challenge";
import { selectActiveOtpChallenge } from "@/modules/auth/otp/select-active-otp-challenge";

export type OtpVerificationChallenge = OtpChallengeSelectionRow & {
  codeHash: string;
  failedAttemptCount: number;
};

export type OtpVerificationWriteChallenge = {
  phone: string;
  consumedAt: Date | null;
  supersededAt: Date | null;
  sentAt: Date | null;
  expiresAt: Date;
  failedAttemptCount: number;
};

export type IncrementFailedAttemptParams = {
  challengeId: string;
  phone: string;
  now: Date;
};

export type ConsumeChallengeParams = IncrementFailedAttemptParams;

export type CreateOtpSessionParams = {
  accountId: string;
  secretHash: string;
  expiresAt: Date;
  createdAt: Date;
};

export type AuthenticateOtpChallengeParams = {
  phone: string;
  code: string;
  now: Date;
  otpHashSecret: string;
  sessionSecretHash: string;
  sessionExpiresAt: Date;
  mutations: AuthenticateOtpMutations;
};

export type AuthenticateOtpMutations = {
  listChallenges(phone: string): Promise<OtpVerificationChallenge[]>;
  incrementFailedAttempt(
    params: IncrementFailedAttemptParams,
  ): Promise<number | null>;
  consumeChallenge(params: ConsumeChallengeParams): Promise<boolean>;
  resolveAccountId(phone: string, now: Date): Promise<string | null>;
  createSession(params: CreateOtpSessionParams): Promise<void>;
};

export type AuthenticateOtpResult =
  | { status: "authenticated"; accountId: string; challengeId: string }
  | { status: "invalid_code"; challengeId: string }
  | { status: "attempt_limit"; challengeId: string }
  | { status: "rejected" };

/**
 * A verification write is allowed only while the selected challenge can still
 * accept a code. `failedAttemptCount >= 5` is permanent exhaustion.
 * `consumedAt` is not used for that state.
 */
export function otpChallengeAllowsVerificationWrite(
  challenge: OtpVerificationWriteChallenge,
  phone: string,
  now: Date,
): boolean {
  return (
    challenge.phone === phone &&
    challenge.consumedAt === null &&
    challenge.supersededAt === null &&
    challenge.sentAt !== null &&
    challenge.expiresAt.getTime() > now.getTime() &&
    challenge.failedAttemptCount < OTP_MAX_VERIFICATION_ATTEMPTS
  );
}

function submittedCodeMatches(
  code: string,
  codeHash: string,
  otpHashSecret: string,
): boolean {
  if (!new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(code)) {
    return false;
  }

  return otpCodeMatchesHash(code, codeHash, otpHashSecret);
}

/**
 * Verify the one selected active challenge and, on success, consume it,
 * resolve the user, and create the session.
 * Callers that talk to PostgreSQL must already hold the phone advisory lock
 * and the challenge row locks. This function does not try an older challenge
 * when the selected one does not match.
 */
export async function authenticateOtpChallenge(
  params: AuthenticateOtpChallengeParams,
): Promise<AuthenticateOtpResult> {
  const challenges = await params.mutations.listChallenges(params.phone);
  const selected = selectActiveOtpChallenge({
    challenges,
    phone: params.phone,
    now: params.now,
  });

  if (!selected) {
    return { status: "rejected" };
  }

  const challenge = challenges.find((row) => row.id === selected.id);

  if (!challenge) {
    return { status: "rejected" };
  }

  const matches = submittedCodeMatches(
    params.code,
    challenge.codeHash,
    params.otpHashSecret,
  );

  if (challenge.failedAttemptCount >= OTP_MAX_VERIFICATION_ATTEMPTS) {
    return { status: "attempt_limit", challengeId: challenge.id };
  }

  if (!matches) {
    const failedAttemptCount = await params.mutations.incrementFailedAttempt({
      challengeId: challenge.id,
      phone: params.phone,
      now: params.now,
    });

    if (failedAttemptCount === null) {
      return { status: "rejected" };
    }

    if (failedAttemptCount >= OTP_MAX_VERIFICATION_ATTEMPTS) {
      return { status: "attempt_limit", challengeId: challenge.id };
    }

    return { status: "invalid_code", challengeId: challenge.id };
  }

  // Resolve after a correct code and before consume so a missing Admin rejects
  // without burning the OTP, while a customer User is created only on success.
  const accountId = await params.mutations.resolveAccountId(
    params.phone,
    params.now,
  );

  if (accountId === null) {
    return { status: "rejected" };
  }

  const consumed = await params.mutations.consumeChallenge({
    challengeId: challenge.id,
    phone: params.phone,
    now: params.now,
  });

  if (!consumed) {
    return { status: "rejected" };
  }

  await params.mutations.createSession({
    accountId,
    secretHash: params.sessionSecretHash,
    expiresAt: params.sessionExpiresAt,
    createdAt: params.now,
  });

  return {
    status: "authenticated",
    accountId,
    challengeId: challenge.id,
  };
}
