"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import { handleAdminUpdateOriginalVariantLabel } from "@/modules/media/originals/admin-original-variants";
import { createPrismaAdminOriginalVariantStore } from "@/modules/media/originals/prisma-admin-original-variants";

export async function updateAdminOriginalVariantLabelAction(
  footageId: string,
  variantId: string,
  formData: FormData,
): Promise<void> {
  const label = formData.get("label");
  const result = await handleAdminUpdateOriginalVariantLabel({
    admin: await resolveCurrentAdmin(),
    footageId,
    variantId,
    body: { label: typeof label === "string" ? label : (label ?? undefined) },
    store: createPrismaAdminOriginalVariantStore(prisma),
  });

  if (result.status === "denied") redirect("/admin/footage");
  if (result.status !== "ok") {
    redirect(`/admin/footage/${footageId}/edit?variantError=${result.status}`);
  }

  revalidatePath(`/admin/footage/${footageId}/edit`);
  redirect(`/admin/footage/${footageId}/edit?variantSaved=1`);
}
