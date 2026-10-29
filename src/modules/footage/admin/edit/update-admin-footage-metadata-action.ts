"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import { handleAdminUpdateFootageMetadata } from "@/modules/footage/admin/mutations/handle-admin-footage-mutation";
import { createPrismaAdminFootageStore } from "@/modules/footage/admin/mutations/prisma-admin-footage-store";

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * Minimal Admin edit submit path.
 * Delegates validation, authorization, and persistence to CAT-03 handlers.
 */
export async function updateAdminFootageMetadataAction(
  footageId: string,
  formData: FormData,
): Promise<void> {
  const admin = await resolveCurrentAdmin();
  const tagIds = formData
    .getAll("tagIds")
    .filter((value): value is string => typeof value === "string");

  const priceRaw = formString(formData, "priceToman");
  const priceToman = Number(priceRaw);

  const result = await handleAdminUpdateFootageMetadata({
    admin,
    footageId,
    body: {
      titleFa: formString(formData, "titleFa"),
      slug: formString(formData, "slug"),
      descriptionFa: formString(formData, "descriptionFa"),
      priceToman: Number.isFinite(priceToman) ? priceToman : priceRaw,
      categoryId: formString(formData, "categoryId"),
      tagIds,
    },
    store: createPrismaAdminFootageStore(prisma),
  });

  if (result.status === "denied") {
    redirect("/admin/footage");
  }

  if (result.status !== "ok") {
    redirect(`/admin/footage/${footageId}/edit?error=${result.status}`);
  }

  revalidatePath("/admin/footage");
  revalidatePath(`/admin/footage/${footageId}/edit`);
  redirect(`/admin/footage/${footageId}/edit?saved=1`);
}
