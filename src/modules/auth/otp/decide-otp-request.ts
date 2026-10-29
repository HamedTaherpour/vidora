import {
  OTP_IP_REQUEST_LIMIT,
  OTP_PHONE_REQUEST_LIMIT,
  OTP_REQUEST_WINDOW_MS,
  OTP_RESEND_COOLDOWN_MS,
} from "@/modules/auth/otp/otp-policy";

export type OtpChallengeWindowRow = {
  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
  supersededAt: Date | null;
};

export type OtpReservationDecision =
  | { status: "accepted" }
  | { status: "cooldown"; retryAfterSeconds: number }
  | {
      status: "rate_limited";
      scope: "phone" | "ip";
      retryAfterSeconds: number;
    };

export type ReservationFromRowsParams = {
  now: Date;
  challenges: readonly OtpChallengeWindowRow[];
  phoneRequestTimes: readonly Date[];
  ipRequestTimes: readonly Date[];
};

function retryAfterSeconds(now: Date, until: Date): number {
  const remainingMs = until.getTime() - now.getTime();

  return Math.max(1, Math.ceil(remainingMs / 1000));
}

function activeRequestTimes(
  now: Date,
  requestTimes: readonly Date[],
): number[] {
  const windowStart = now.getTime() - OTP_REQUEST_WINDOW_MS;

  return requestTimes
    .map((time) => time.getTime())
    .filter((time) => time > windowStart)
    .sort((left, right) => left - right);
}

function rateLimitRetryAfterSeconds(
  now: Date,
  requestTimes: readonly number[],
  limit: number,
): number {
  const blockingIndex = requestTimes.length - limit;
  const blockingTime = requestTimes[blockingIndex];

  if (blockingTime === undefined) {
    return 1;
  }

  return retryAfterSeconds(now, new Date(blockingTime + OTP_REQUEST_WINDOW_MS));
}

/**
 * Cooldown is an unconsumed, unexpired, non-superseded challenge younger than
 * 60 seconds. Hourly limits count send attempts. A time exactly on the window
 * boundary is outside that window.
 */
export function reservationFromRows({
  now,
  challenges,
  phoneRequestTimes,
  ipRequestTimes,
}: ReservationFromRowsParams): OtpReservationDecision {
  const cooldownStart = now.getTime() - OTP_RESEND_COOLDOWN_MS;
  const blockingChallenge = challenges
    .filter((challenge) => {
      return (
        challenge.consumedAt === null &&
        challenge.supersededAt === null &&
        challenge.expiresAt.getTime() > now.getTime() &&
        challenge.createdAt.getTime() > cooldownStart
      );
    })
    .sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    )[0];

  if (blockingChallenge) {
    return {
      status: "cooldown",
      retryAfterSeconds: retryAfterSeconds(
        now,
        new Date(
          blockingChallenge.createdAt.getTime() + OTP_RESEND_COOLDOWN_MS,
        ),
      ),
    };
  }

  const phoneTimes = activeRequestTimes(now, phoneRequestTimes);

  if (phoneTimes.length >= OTP_PHONE_REQUEST_LIMIT) {
    return {
      status: "rate_limited",
      scope: "phone",
      retryAfterSeconds: rateLimitRetryAfterSeconds(
        now,
        phoneTimes,
        OTP_PHONE_REQUEST_LIMIT,
      ),
    };
  }

  const ipTimes = activeRequestTimes(now, ipRequestTimes);

  if (ipTimes.length >= OTP_IP_REQUEST_LIMIT) {
    return {
      status: "rate_limited",
      scope: "ip",
      retryAfterSeconds: rateLimitRetryAfterSeconds(
        now,
        ipTimes,
        OTP_IP_REQUEST_LIMIT,
      ),
    };
  }

  return { status: "accepted" };
}
