import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { reservationFromRows } from "@/modules/auth/otp/decide-otp-request";
import {
  lockOtpPhone,
  lockOtpRequest,
} from "@/modules/auth/otp/otp-advisory-lock";
import {
  OTP_REQUEST_WINDOW_MS,
  OTP_RESEND_COOLDOWN_MS,
} from "@/modules/auth/otp/otp-policy";
import type {
  OtpRequestStore,
  RecordChallengeDeliveryParams,
  ReserveOtpRequestParams,
  ReserveOtpRequestResult,
  SupersedePreviousChallengesParams,
} from "@/modules/auth/otp/otp-request-store";

/**
 * Durable cooldown and hourly limits.
 * Cooldown and supersession are scoped by phone + purpose.
 * Hourly phone and IP limits remain shared across purposes.
 * The reservation transaction commits before SMS is sent. A failed send deletes
 * only a reserved challenge (`sentAt` null) and leaves the request event.
 * After the provider accepts, delivery is committed on its own, then older
 * same-purpose challenges are superseded in a later transaction. Neither write
 * runs while SMS is in flight.
 */
export function createPrismaOtpRequestStore(
  client: PrismaClient,
): OtpRequestStore {
  return {
    async reserve(
      params: ReserveOtpRequestParams,
    ): Promise<ReserveOtpRequestResult> {
      return client.$transaction(async (tx) => {
        await lockOtpRequest(
          tx.$executeRaw.bind(tx),
          params.phone,
          params.clientIp,
        );

        const cooldownStart = new Date(
          params.now.getTime() - OTP_RESEND_COOLDOWN_MS,
        );
        const windowStart = new Date(
          params.now.getTime() - OTP_REQUEST_WINDOW_MS,
        );
        const challenges = await tx.otpChallenge.findMany({
          where: {
            phone: params.phone,
            purpose: params.purpose,
            consumedAt: null,
            supersededAt: null,
            expiresAt: { gt: params.now },
            createdAt: { gt: cooldownStart },
          },
          select: {
            createdAt: true,
            expiresAt: true,
            consumedAt: true,
            supersededAt: true,
          },
        });
        const phoneEvents = await tx.otpRequestEvent.findMany({
          where: {
            phone: params.phone,
            createdAt: { gt: windowStart },
          },
          select: { createdAt: true },
        });
        const ipEvents = await tx.otpRequestEvent.findMany({
          where: {
            clientIp: params.clientIp,
            createdAt: { gt: windowStart },
          },
          select: { createdAt: true },
        });
        const decision = reservationFromRows({
          now: params.now,
          challenges,
          phoneRequestTimes: phoneEvents.map((event) => event.createdAt),
          ipRequestTimes: ipEvents.map((event) => event.createdAt),
        });

        if (decision.status !== "accepted") {
          return decision;
        }

        const challenge = await tx.otpChallenge.create({
          data: {
            phone: params.phone,
            purpose: params.purpose,
            codeHash: params.codeHash,
            expiresAt: params.expiresAt,
            failedAttemptCount: 0,
            createdAt: params.now,
          },
          select: { id: true },
        });

        await tx.otpRequestEvent.create({
          data: {
            phone: params.phone,
            clientIp: params.clientIp,
            createdAt: params.now,
          },
        });

        return {
          status: "accepted",
          challengeId: challenge.id,
        };
      });
    },

    async deleteUnsentChallenge(challengeId: string): Promise<void> {
      await client.otpChallenge.deleteMany({
        where: {
          id: challengeId,
          sentAt: null,
          consumedAt: null,
          supersededAt: null,
        },
      });
    },

    async recordChallengeDelivery({
      phone,
      purpose,
      challengeId,
      sentAt,
    }: RecordChallengeDeliveryParams): Promise<void> {
      const updated = await client.otpChallenge.updateMany({
        where: {
          id: challengeId,
          phone,
          purpose,
          consumedAt: null,
          sentAt: null,
        },
        data: { sentAt },
      });

      if (updated.count === 1) {
        return;
      }

      const existing = await client.otpChallenge.findFirst({
        where: { id: challengeId, phone, purpose },
        select: { consumedAt: true, sentAt: true },
      });

      if (!existing) {
        throw new Error("OTP challenge to deliver was not found.");
      }

      if (existing.consumedAt) {
        throw new Error("OTP challenge to deliver was already consumed.");
      }

      if (existing.sentAt) {
        return;
      }

      throw new Error("OTP challenge delivery could not be recorded.");
    },

    async supersedePreviousChallenges({
      phone,
      purpose,
      keptChallengeId,
      supersededAt,
    }: SupersedePreviousChallengesParams): Promise<void> {
      await client.$transaction(async (tx) => {
        await lockOtpPhone(tx.$executeRaw.bind(tx), phone);

        const kept = await tx.otpChallenge.findFirst({
          where: {
            id: keptChallengeId,
            phone,
            purpose,
          },
          select: {
            id: true,
            createdAt: true,
            consumedAt: true,
            sentAt: true,
          },
        });

        if (!kept) {
          throw new Error("OTP challenge to activate was not found.");
        }

        if (kept.consumedAt) {
          throw new Error("OTP challenge to activate was already consumed.");
        }

        if (!kept.sentAt) {
          throw new Error("OTP challenge to activate was not delivered.");
        }

        await tx.otpChallenge.updateMany({
          where: {
            phone,
            purpose,
            id: { not: kept.id },
            consumedAt: null,
            supersededAt: null,
            expiresAt: { gt: supersededAt },
            createdAt: { lte: kept.createdAt },
          },
          data: { supersededAt },
        });
      });
    },
  };
}
