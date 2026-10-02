import "server-only";

import { parseEnv } from "@/lib/env/parse-env";
import { kavenegarEnvSchema } from "@/lib/env/server-schema";
import { sendKavenegarVerifyLookup } from "@/modules/auth/kavenegar-lookup";
import type { SmsProvider } from "@/modules/auth/sms-provider";

/**
 * Transport bound for one lookup call. This is not an OTP lifetime.
 * The provider is constructed here so application boot and `next build`
 * do not require Kavenegar credentials.
 */
const KAVENEGAR_TIMEOUT_MS = 10_000;

export function createKavenegarSmsProvider(): SmsProvider {
  const env = parseEnv(kavenegarEnvSchema, {
    KAVENEGAR_API_KEY: process.env.KAVENEGAR_API_KEY,
    KAVENEGAR_OTP_TEMPLATE: process.env.KAVENEGAR_OTP_TEMPLATE,
  });

  return {
    async sendOtp({ phone, code }) {
      await sendKavenegarVerifyLookup({
        apiKey: env.KAVENEGAR_API_KEY,
        template: env.KAVENEGAR_OTP_TEMPLATE,
        phone,
        code,
        timeoutMs: KAVENEGAR_TIMEOUT_MS,
      });
    },
  };
}
