import { prisma } from "@/lib/db/client";
import { createObjectStorage } from "@/modules/media/create-object-storage";
import {
  createPublicPreviewAccess,
  PreviewNotAvailableError,
} from "@/modules/media/public-preview";
import { createPrismaPublicPreviewStore } from "@/modules/media/prisma-public-preview-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/**
 * Public preview delivery. The response redirects the browser to a
 * short-lived preview-policy URL; Next.js never proxies the video bytes.
 */
export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: footageId } = await context.params;

  if (!isUuid(footageId)) {
    return new Response(null, { status: 404 });
  }

  const mode = new URL(request.url).searchParams.get("mode");

  if (mode !== null && mode !== "stream" && mode !== "download") {
    return new Response(null, { status: 400 });
  }

  try {
    const access = await createPublicPreviewAccess({
      footageId,
      store: createPrismaPublicPreviewStore(prisma),
      storage: createObjectStorage(),
      mode: mode === "download" ? "download" : "stream",
    });

    return new Response(null, {
      status: 307,
      headers: {
        Location: access.url,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof PreviewNotAvailableError) {
      return new Response(null, { status: 404 });
    }

    return new Response(null, { status: 503 });
  }
}
