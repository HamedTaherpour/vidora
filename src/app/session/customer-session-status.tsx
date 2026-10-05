import { resolveCurrentCustomer } from "@/modules/auth/resolve-current-customer";

type CustomerSessionStatusProps = {
  heading: string;
  continueHref?: string;
};

export async function CustomerSessionStatus({
  heading,
  continueHref,
}: CustomerSessionStatusProps) {
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
