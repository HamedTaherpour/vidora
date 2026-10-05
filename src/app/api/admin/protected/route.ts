import {
  AdminAuthorizationError,
  requireCurrentAdmin,
} from "@/modules/auth/require-current-admin";

export const dynamic = "force-dynamic";

/**
 * Minimal Admin-protected surface for authorization boundary checks.
 * Not an Admin dashboard.
 */
export async function GET(): Promise<Response> {
  try {
    const admin = await requireCurrentAdmin();

    return Response.json(
      {
        status: "allowed",
        adminId: admin.adminId,
        expiresAt: admin.expiresAt.toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return Response.json(
        { status: "denied" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    throw error;
  }
}
