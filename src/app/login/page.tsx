import { resolveSafeReturnDestination } from "@/modules/ui-mock/fixtures/customer-auth";
import { CustomerLoginForm } from "./customer-login-form";

export const dynamic = "force-dynamic";

type LoginSearchParams = Promise<{
  returnTo?: string | string[];
  continue?: string | string[];
}>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const params = await searchParams;
  const returnTo = resolveSafeReturnDestination(
    firstParam(params.returnTo) ?? firstParam(params.continue),
  );

  return <CustomerLoginForm returnTo={returnTo} />;
}
