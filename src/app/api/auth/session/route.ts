import { resolveCurrentCustomer } from "@/modules/auth/sessions/resolve-current-customer";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const customer = await resolveCurrentCustomer();

  if (customer.status === "anonymous") {
    return Response.json(
      { status: "anonymous" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    {
      status: "authenticated",
      expiresAt: customer.expiresAt.toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
