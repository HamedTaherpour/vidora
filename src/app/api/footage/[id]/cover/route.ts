import { prisma } from "@/lib/db/client";
import { createObjectStorage } from "@/modules/media/storage/create-object-storage";
import {
  CoverNotAvailableError,
  createPublicFootageCoverAccess,
} from "@/modules/media/covers/public-footage-cover";
import { createPrismaPublicFootageCoverStore } from "@/modules/media/covers/prisma-public-footage-cover-store";

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
  const { id } = await context.params;

  if (!isUuid(id)) {
    return new Response(null, { status: 404 });
  }

  try {
    const access = await createPublicFootageCoverAccess({
      footageId: id,
      store: createPrismaPublicFootageCoverStore(prisma),
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
