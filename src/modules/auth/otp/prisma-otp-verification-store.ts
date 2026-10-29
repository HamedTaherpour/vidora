import "server-only";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { authenticateOtpChallenge } from "@/modules/auth/otp/authenticate-otp";
import { lockOtpPhone } from "@/modules/auth/otp/otp-advisory-lock";
import { OTP_MAX_VERIFICATION_ATTEMPTS } from "@/modules/auth/otp/otp-policy";
import { OTP_PURPOSE_CUSTOMER } from "@/modules/auth/otp/otp-purpose";
import type {
  CompleteOtpAuthenticationParams,
  CompleteOtpAuthenticationResult,
  CustomerSessionRecord,
  OtpVerificationStore,
} from "@/modules/auth/otp/otp-verification-store";

function verificationWriteWhere(
  challengeId: string,
  phone: string,
  now: Date,
): Prisma.OtpChallengeWhereInput {
  return {
    id: challengeId,
    phone,
    purpose: OTP_PURPOSE_CUSTOMER,
    consumedAt: null,
    supersededAt: null,
    sentAt: { not: null },
    expiresAt: { gt: now },
    failedAttemptCount: { lt: OTP_MAX_VERIFICATION_ATTEMPTS },
  };
}

/**
 * Insert the customer when missing.
 * `skipDuplicates` is PostgreSQL `ON CONFLICT DO NOTHING`.
 * The unique phone constraint is the identity guarantee. A prior read is not.
 */
export async function resolveCustomerUserId(
  tx: Prisma.TransactionClient,
  phone: string,
  now: Date,
): Promise<string> {
  await tx.user.createMany({
    data: [{ phone, createdAt: now, updatedAt: now }],
    skipDuplicates: true,
  });

  const user = await tx.user.findUnique({
    where: { phone },
    select: { id: true },
  });

  if (!user) {
    throw new Error("Customer user could not be resolved.");
  }

  return user.id;
}

/**
 * Durable customer OTP verification.
 * The phone advisory lock is the same key OTP reservation uses.
 * Challenge rows for the customer purpose are locked before the code is judged
 * so a delivery update cannot change eligibility mid-check. Consumption, user
 * resolution, and session insert commit together. No network call runs here.
 */
export function createPrismaOtpVerificationStore(
  client: PrismaClient,
): OtpVerificationStore {
  return {
    async completeAuthentication(
      params: CompleteOtpAuthenticationParams,
    ): Promise<CompleteOtpAuthenticationResult> {
      if (params.purpose !== OTP_PURPOSE_CUSTOMER) {
        return { status: "rejected" };
      }

      return client.$transaction(async (tx) => {
        await lockOtpPhone(tx.$executeRaw.bind(tx), params.phone);
        await tx.$queryRaw`
          SELECT "id"
          FROM "OtpChallenge"
          WHERE "phone" = ${params.phone}
            AND "purpose" = CAST(${OTP_PURPOSE_CUSTOMER} AS "OtpPurpose")
          FOR UPDATE
        `;

        const outcome = await authenticateOtpChallenge({
          phone: params.phone,
          code: params.code,
          now: params.now,
          otpHashSecret: params.otpHashSecret,
          sessionSecretHash: params.sessionSecretHash,
          sessionExpiresAt: params.sessionExpiresAt,
          mutations: {
            listChallenges(phone) {
              return tx.otpChallenge.findMany({
                where: { phone, purpose: OTP_PURPOSE_CUSTOMER },
                select: {
                  id: true,
                  phone: true,
                  codeHash: true,
                  createdAt: true,
                  expiresAt: true,
                  failedAttemptCount: true,
                  consumedAt: true,
                  sentAt: true,
                  supersededAt: true,
                },
              });
            },
            async incrementFailedAttempt({ challengeId, phone, now }) {
              const updated = await tx.otpChallenge.updateMany({
                where: verificationWriteWhere(challengeId, phone, now),
                data: { failedAttemptCount: { increment: 1 } },
              });

              if (updated.count !== 1) {
                return null;
              }

              const row = await tx.otpChallenge.findUnique({
                where: { id: challengeId },
                select: { failedAttemptCount: true },
              });

              return row?.failedAttemptCount ?? null;
            },
            async consumeChallenge({ challengeId, phone, now }) {
              const updated = await tx.otpChallenge.updateMany({
                where: verificationWriteWhere(challengeId, phone, now),
                data: { consumedAt: now },
              });

              return updated.count === 1;
            },
            async resolveAccountId(phone, now) {
              return resolveCustomerUserId(tx, phone, now);
            },
            async createSession(session) {
              await tx.session.create({
                data: {
                  userId: session.accountId,
                  secretHash: session.secretHash,
                  expiresAt: session.expiresAt,
                  createdAt: session.createdAt,
                },
              });
            },
          },
        });

        if (outcome.status === "rejected") {
          return { status: "rejected" };
        }

        if (outcome.status === "invalid_code") {
          return { status: "invalid_code" };
        }

        if (outcome.status === "attempt_limit") {
          return { status: "attempt_limit" };
        }

        return { status: "authenticated", accountId: outcome.accountId };
      });
    },

    async findSessionBySecretHash(
      secretHash: string,
    ): Promise<CustomerSessionRecord | null> {
      const session = await client.session.findUnique({
        where: { secretHash },
        select: {
          expiresAt: true,
          user: {
            select: {
              id: true,
              phone: true,
            },
          },
        },
      });

      if (!session) {
        return null;
      }

      return {
        userId: session.user.id,
        phone: session.user.phone,
        expiresAt: session.expiresAt,
      };
    },
  };
}
