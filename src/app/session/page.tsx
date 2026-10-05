import { CustomerSessionStatus } from "./customer-session-status";

export const dynamic = "force-dynamic";

export default function SessionPage() {
  return (
    <CustomerSessionStatus
      heading="Customer session"
      continueHref="/session/continue"
    />
  );
}
