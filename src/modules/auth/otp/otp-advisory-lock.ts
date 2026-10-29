import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Second key of `pg_advisory_xact_lock(int, int)`.
 * OTP request reservation and OTP verification share this namespace so a
 * resend and a verification for one phone cannot pass each other.
 */
export const OTP_ADVISORY_LOCK_NAMESPACE = 17003;

type ExecuteRaw = PrismaClient["$executeRaw"];

export async function lockOtpAdvisoryKeys(
  executeRaw: ExecuteRaw,
  keys: readonly string[],
): Promise<void> {
  for (const key of [...keys].sort()) {
    await executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}), ${OTP_ADVISORY_LOCK_NAMESPACE})`;
  }
}

export async function lockOtpPhone(
  executeRaw: ExecuteRaw,
  phone: string,
): Promise<void> {
  await lockOtpAdvisoryKeys(executeRaw, [`otp-phone:${phone}`]);
}

export async function lockOtpRequest(
  executeRaw: ExecuteRaw,
  phone: string,
  clientIp: string,
): Promise<void> {
  await lockOtpAdvisoryKeys(executeRaw, [
    `otp-phone:${phone}`,
    `otp-ip:${clientIp}`,
  ]);
}
