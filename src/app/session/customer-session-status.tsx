import { resolveCurrentCustomer } from "@/modules/auth/sessions/resolve-current-customer";
import type { CustomerSessionStatusProps } from "./customer-session-status.types";

export async function CustomerSessionStatus(props: CustomerSessionStatusProps) {
  const { heading, continueHref } = props;
  const customer = await resolveCurrentCustomer();
  const label =
    customer.status === "authenticated" ? "authenticated" : "anonymous";

  return (
    <main>
      <h1>{heading}</h1>
      <p>{label}</p>
      {continueHref ? <a href={continueHref}>Continue</a> : null}
    </main>
  );
}
