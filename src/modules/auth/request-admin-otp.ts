import "server-only";

import { prisma } from "@/lib/db/client";
import { serverEnv } from "@/lib/env/server";
import { createKavenegarSmsProvider } from "@/modules/auth/kavenegar-sms-provider";
import {
  InvalidIranianMobileNumberError,
  normalizeIranianMobile,
} from "@/modules/auth/normalize-iranian-mobile";
import { OTP_PURPOSE_ADMIN } from "@/modules/auth/otp-purpose";
import { createPrismaOtpRequestStore } from "@/modules/auth/prisma-otp-request-store";
import { requestOtp, type RequestOtpResult } from "@/modules/auth/request-otp";

export type RequestAdminOtpResult = RequestOtpResult | { status: "rejected" };

export type RequestAdminOtpParams = {
  phoneNumber: string;
  /**
   * Single client IP observed at the request boundary.
   * Do not pass `X-Forwarded-For`, `X-Real-IP`, or a `Forwarded` header.
   */
  clientIp: string;
  now?: Date;
};

/**
 * Request an Admin OTP for a provisioned Admin phone.
 * Does not create an Admin. Unprovisioned phones are rejected.
 * Challenges use purpose `admin` and cannot authenticate a customer.
 */
export async function requestAdminOtp({
  phoneNumber,
  clientIp,
  now = new Date(),
}: RequestAdminOtpParams): Promise<RequestAdminOtpResult> {
  let phone: string;

  try {
    phone = normalizeIranianMobile(phoneNumber);
  } catch (error) {
    if (error instanceof InvalidIranianMobileNumberError) {
      return { status: "invalid_phone" };
    }

    throw error;
  }

  const admin = await prisma.admin.findUnique({
    where: { phone },
    select: { id: true },
  });

  if (!admin) {
    return { status: "rejected" };
  }

  return requestOtp({
    phoneNumber: phone,
    clientIp,
    now,
    purpose: OTP_PURPOSE_ADMIN,
    otpHashSecret: serverEnv.OTP_HASH_SECRET,
    smsProvider: createKavenegarSmsProvider(),
    store: createPrismaOtpRequestStore(prisma),
    providerName: "kavenegar",
  });
}
