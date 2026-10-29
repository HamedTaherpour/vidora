import "server-only";

import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { authenticateOtpChallenge } from "@/modules/auth/otp/authenticate-otp";
import { lockOtpPhone } from "@/modules/auth/otp/otp-advisory-lock";
import { OTP_MAX_VERIFICATION_ATTEMPTS } from "@/modules/auth/otp/otp-policy";
import { OTP_PURPOSE_ADMIN } from "@/modules/auth/otp/otp-purpose";
import type {
  AdminOtpVerificationStore,
  AdminSessionRecord,
  CompleteOtpAuthenticationParams,
  CompleteOtpAuthenticationResult,
} from "@/modules/auth/otp/otp-verification-store";

function verificationWriteWhere(
  challengeId: string,
  phone: string,
  now: Date,
): Prisma.OtpChallengeWhereInput {
  return {
    id: challengeId,
    phone,
    purpose: OTP_PURPOSE_ADMIN,
    consumedAt: null,
    supersededAt: null,
    sentAt: { not: null },
    expiresAt: { gt: now },
    failedAttemptCount: { lt: OTP_MAX_VERIFICATION_ATTEMPTS },
  };
}

/**
 * Resolve a provisioned Admin by canonical phone.
 * Never creates an Admin. There is no public Admin signup.
 */
export async function resolveProvisionedAdminId(
  tx: Prisma.TransactionClient,
  phone: string,
): Promise<string | null> {
  const admin = await tx.admin.findUnique({
    where: { phone },
    select: { id: true },
  });

  return admin?.id ?? null;
}

/**
 * Durable Admin OTP verification.
 * Uses the same phone advisory lock and attempt rules as customer verification.
 * Only `purpose = admin` challenges are eligible. Success writes `AdminSession`
 * and never creates `User`, `Session`, or `Admin`.
 */
export function createPrismaAdminOtpVerificationStore(
  client: PrismaClient,
): AdminOtpVerificationStore {
  return {
    async completeAuthentication(
      params: CompleteOtpAuthenticationParams,
    ): Promise<CompleteOtpAuthenticationResult> {
      if (params.purpose !== OTP_PURPOSE_ADMIN) {
        return { status: "rejected" };
      }

      return client.$transaction(async (tx) => {
        await lockOtpPhone(tx.$executeRaw.bind(tx), params.phone);
        await tx.$queryRaw`
          SELECT "id"
          FROM "OtpChallenge"
          WHERE "phone" = ${params.phone}
            AND "purpose" = CAST(${OTP_PURPOSE_ADMIN} AS "OtpPurpose")
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
                where: { phone, purpose: OTP_PURPOSE_ADMIN },
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
            async resolveAccountId(phone) {
              return resolveProvisionedAdminId(tx, phone);
            },
            async createSession(session) {
              await tx.adminSession.create({
                data: {
                  adminId: session.accountId,
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
    ): Promise<AdminSessionRecord | null> {
      const session = await client.adminSession.findUnique({
        where: { secretHash },
        select: {
          expiresAt: true,
          admin: {
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
        adminId: session.admin.id,
        phone: session.admin.phone,
        expiresAt: session.expiresAt,
      };
    },
  };
}
