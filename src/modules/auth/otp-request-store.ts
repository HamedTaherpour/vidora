import type { OtpReservationDecision } from "@/modules/auth/decide-otp-request";

export type ReserveOtpRequestParams = {
  phone: string;
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
  challengeId: string;
  sentAt: Date;
};

export type SupersedePreviousChallengesParams = {
  phone: string;
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
