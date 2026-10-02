export type OtpChallengeSelectionRow = {
  id: string;
  phone: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
  sentAt: Date | null;
  supersededAt: Date | null;
};

export type SelectActiveOtpChallengeParams = {
  challenges: readonly OtpChallengeSelectionRow[];
  phone: string;
  now: Date;
};

function isNewerChallenge(
  other: OtpChallengeSelectionRow,
  challenge: OtpChallengeSelectionRow,
): boolean {
  if (other.id === challenge.id || other.phone !== challenge.phone) {
    return false;
  }

  const byCreatedAt = other.createdAt.getTime() - challenge.createdAt.getTime();

  if (byCreatedAt > 0) {
    return true;
  }

  if (byCreatedAt < 0) {
    return false;
  }

  return other.id > challenge.id;
}

/**
 * A delivered newer row blocks permanently.
 * A pending newer row (`sentAt` null) blocks only while it is unexpired.
 * Explicit provider failure deletes that pending row, so it is absent here.
 */
function blocksOlderChallenge(
  other: OtpChallengeSelectionRow,
  now: Date,
): boolean {
  if (other.sentAt !== null) {
    return true;
  }

  return other.expiresAt.getTime() > now.getTime();
}

function isEligible(
  challenge: OtpChallengeSelectionRow,
  challenges: readonly OtpChallengeSelectionRow[],
  phone: string,
  now: Date,
): boolean {
  return (
    challenge.phone === phone &&
    challenge.sentAt !== null &&
    challenge.supersededAt === null &&
    challenge.consumedAt === null &&
    challenge.expiresAt.getTime() > now.getTime() &&
    !challenges.some((other) => {
      return (
        isNewerChallenge(other, challenge) && blocksOlderChallenge(other, now)
      );
    })
  );
}

/**
 * The one challenge AUTH-04 may verify for a canonical phone.
 * A row is eligible only after `sentAt` is stored. A pending row is never
 * eligible. A newer non-failed row blocks every older row for that phone:
 * a delivered row blocks permanently, and a pending row blocks until it
 * expires. When more than one row is eligible, the latest `createdAt` wins.
 * An equal `createdAt` picks the greater id and does not fall back. Compare
 * a submitted code only with the selected row.
 */
export function selectActiveOtpChallenge({
  challenges,
  phone,
  now,
}: SelectActiveOtpChallengeParams): OtpChallengeSelectionRow | null {
  const eligible = challenges.filter((challenge) => {
    return isEligible(challenge, challenges, phone, now);
  });

  eligible.sort((left, right) => {
    const byCreatedAt = right.createdAt.getTime() - left.createdAt.getTime();

    if (byCreatedAt !== 0) {
      return byCreatedAt;
    }

    if (left.id === right.id) {
      return 0;
    }

    return left.id < right.id ? 1 : -1;
  });

  return eligible[0] ?? null;
}
