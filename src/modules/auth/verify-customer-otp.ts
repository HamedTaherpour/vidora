import "server-only";

import { prisma } from "@/lib/db/client";
import { serverEnv } from "@/lib/env/server";
import { createPrismaOtpVerificationStore } from "@/modules/auth/prisma-otp-verification-store";
import { verifyOtp, type VerifyOtpResult } from "@/modules/auth/verify-otp";

export type VerifyCustomerOtpParams = {
  phoneNumber: string;
  code: string;
  now?: Date;
};

export async function verifyCustomerOtp({
  phoneNumber,
  code,
  now = new Date(),
}: VerifyCustomerOtpParams): Promise<VerifyOtpResult> {
  return verifyOtp({
    phoneNumber,
    code,
    now,
    otpHashSecret: serverEnv.OTP_HASH_SECRET,
    store: createPrismaOtpVerificationStore(prisma),
  });
}
