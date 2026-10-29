import {
  CustomerAuthorizationError,
  requireCurrentCustomer,
} from "@/modules/auth/authorization/require-current-customer";

export const dynamic = "force-dynamic";

/**
 * Minimal customer-protected surface for authorization boundary checks.
 * Not a customer account UI.
 */
export async function GET(): Promise<Response> {
  try {
    const customer = await requireCurrentCustomer();

    return Response.json(
      {
        status: "allowed",
        userId: customer.userId,
        expiresAt: customer.expiresAt.toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof CustomerAuthorizationError) {
      return Response.json(
        { status: "denied" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    throw error;
  }
}
