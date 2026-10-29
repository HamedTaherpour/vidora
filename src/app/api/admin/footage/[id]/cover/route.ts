import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import { createPrismaAdminFootageCoverStore } from "@/modules/media/covers/prisma-admin-footage-cover-store";
import {
  FootageCoverStorageError,
  InvalidFootageCoverError,
  saveAdminFootageCover,
} from "@/modules/media/covers/admin-footage-cover";
import { assertAdminMediaUploadOrigin } from "@/modules/media/uploads/handle-admin-media-upload";
import { createObjectStorage } from "@/modules/media/storage/create-object-storage";
import {
  CoverNotAvailableError,
  createPublicFootageCoverAccess,
} from "@/modules/media/covers/public-footage-cover";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const admin = await resolveCurrentAdmin();
  if (admin.status !== "authenticated") {
    return new Response(null, { status: 403 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return new Response(null, { status: 404 });
  }

  try {
    const access = await createPublicFootageCoverAccess({
      footageId: id,
      store: {
        findPublishedByFootageId: (footageId) =>
          createPrismaAdminFootageCoverStore(prisma).findByFootageId(footageId),
      },
      storage: createObjectStorage(),
    });

    return new Response(null, {
      status: 307,
      headers: { Location: access.url, "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof CoverNotAvailableError) {
      return new Response(null, { status: 404 });
    }
    return new Response(null, { status: 503 });
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (
    !assertAdminMediaUploadOrigin({
      request,
      appOrigin: process.env.APP_ORIGIN,
      nodeEnv: process.env.NODE_ENV,
    })
  ) {
    return Response.json({ status: "rejected" }, { status: 403 });
  }

  const admin = await resolveCurrentAdmin();
  if (admin.status !== "authenticated") {
    return Response.json({ status: "denied" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return Response.json({ status: "footage_not_found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ status: "invalid_input" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ status: "invalid_input" }, { status: 400 });
  }

  const footage = await prisma.footage.findUnique({
    where: { id },
    select: { id: true },
  });
  if (footage === null) {
    return Response.json({ status: "footage_not_found" }, { status: 404 });
  }

  try {
    const cover = await saveAdminFootageCover({
      footageId: id,
      bytes: new Uint8Array(await file.arrayBuffer()),
      store: createPrismaAdminFootageCoverStore(prisma),
      storage: createObjectStorage(),
    });

    return Response.json(
      {
        status: "ok",
        cover: {
          sizeBytes: Number(cover.sizeBytes),
          width: cover.width,
          height: cover.height,
          mimeType: cover.mimeType,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof InvalidFootageCoverError) {
      return Response.json({ status: "invalid_cover" }, { status: 400 });
    }
    if (error instanceof FootageCoverStorageError) {
      return Response.json({ status: "storage_failed" }, { status: 503 });
    }
    return Response.json({ status: "storage_failed" }, { status: 503 });
  }
}
