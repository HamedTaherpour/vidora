import "server-only";

import { prisma } from "@/lib/db/client";
import { serverEnv } from "@/lib/env/server";
import { createPrismaAdminOtpVerificationStore } from "@/modules/auth/prisma-admin-otp-verification-store";
import { verifyAdminOtp as verifyAdminOtpChallenge } from "@/modules/auth/verify-admin-otp";
import type { VerifyOtpResult } from "@/modules/auth/verify-otp";

export type VerifyAdminOtpRequestParams = {
  phoneNumber: string;
  code: string;
  now?: Date;
};

export async function verifyAdminOtpRequest({
  phoneNumber,
  code,
  now = new Date(),
}: VerifyAdminOtpRequestParams): Promise<VerifyOtpResult> {
  return verifyAdminOtpChallenge({
    phoneNumber,
    code,
    now,
    otpHashSecret: serverEnv.OTP_HASH_SECRET,
    store: createPrismaAdminOtpVerificationStore(prisma),
  });
}
