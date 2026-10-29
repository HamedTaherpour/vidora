import type { OtpReservationDecision } from "@/modules/auth/otp/decide-otp-request";
import type { OtpPurpose } from "@/modules/auth/otp/otp-purpose";

export type ReserveOtpRequestParams = {
  phone: string;
  purpose: OtpPurpose;
  clientIp: string;
  codeHash: string;
  expiresAt: Date;
  now: Date;
};

export type ReserveOtpRequestResult =
  | { status: "accepted"; challengeId: string }
  | Exclude<OtpReservationDecision, { status: "accepted" }>;

export type RecordChallengeDeliveryParams = {
  phone: string;
  purpose: OtpPurpose;
  challengeId: string;
  sentAt: Date;
};

export type SupersedePreviousChallengesParams = {
  phone: string;
  purpose: OtpPurpose;
  keptChallengeId: string;
  supersededAt: Date;
};

/**
 * Persistence for one OTP request.
 * Implementations must apply cooldown and both hourly limits atomically.
 * Delivery is recorded in its own write after SMS succeeds and before
 * previous challenges are superseded. Those writes are not one transaction,
 * and neither runs while the SMS request is open.
 * The plaintext OTP is not part of this contract.
 */
export type OtpRequestStore = {
  reserve(params: ReserveOtpRequestParams): Promise<ReserveOtpRequestResult>;
  deleteUnsentChallenge(challengeId: string): Promise<void>;
  recordChallengeDelivery(params: RecordChallengeDeliveryParams): Promise<void>;
  supersedePreviousChallenges(
    params: SupersedePreviousChallengesParams,
  ): Promise<void>;
};
