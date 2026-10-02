import "server-only";

import { prisma } from "@/lib/db/client";
import { serverEnv } from "@/lib/env/server";
import { createKavenegarSmsProvider } from "@/modules/auth/kavenegar-sms-provider";
import { createPrismaOtpRequestStore } from "@/modules/auth/prisma-otp-request-store";
import { requestOtp, type RequestOtpResult } from "@/modules/auth/request-otp";

export type RequestCustomerOtpParams = {
  phoneNumber: string;
  /**
   * Single client IP observed at the request boundary.
   * Do not pass `X-Forwarded-For`, `X-Real-IP`, or a `Forwarded` header.
   * There is no documented trusted proxy yet.
   */
  clientIp: string;
  now?: Date;
};

export async function requestCustomerOtp({
  phoneNumber,
  clientIp,
  now = new Date(),
}: RequestCustomerOtpParams): Promise<RequestOtpResult> {
  return requestOtp({
    phoneNumber,
    clientIp,
    now,
    otpHashSecret: serverEnv.OTP_HASH_SECRET,
    smsProvider: createKavenegarSmsProvider(),
    store: createPrismaOtpRequestStore(prisma),
    providerName: "kavenegar",
  });
}
