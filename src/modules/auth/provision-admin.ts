import "server-only";

import { prisma } from "@/lib/db/client";
import {
  InvalidIranianMobileNumberError,
  normalizeIranianMobile,
} from "@/modules/auth/normalize-iranian-mobile";

export type ProvisionAdminResult =
  | { status: "created"; adminId: string; phone: string }
  | { status: "already_exists"; adminId: string; phone: string };

/**
 * Manually provision an Admin identity.
 * Idempotent for an already-normalized phone. Does not create a Customer User
 * or session. There is no public Admin signup path.
 */
export async function provisionAdmin(
  phoneNumber: string,
  now = new Date(),
): Promise<ProvisionAdminResult> {
  const phone = normalizeIranianMobile(phoneNumber);

  const existing = await prisma.admin.findUnique({
    where: { phone },
    select: { id: true },
  });

  if (existing) {
    return {
      status: "already_exists",
      adminId: existing.id,
      phone,
    };
  }

  try {
    const created = await prisma.admin.create({
      data: {
        phone,
        createdAt: now,
        updatedAt: now,
      },
      select: { id: true },
    });

    return {
      status: "created",
      adminId: created.id,
      phone,
    };
  } catch (error) {
    // Concurrent provision of the same phone: unique constraint wins.
    const raced = await prisma.admin.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (raced) {
      return {
        status: "already_exists",
        adminId: raced.id,
        phone,
      };
    }

    throw error;
  }
}

export { InvalidIranianMobileNumberError };
