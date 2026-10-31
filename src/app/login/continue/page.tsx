import { CustomerSessionStatus } from "../../session/customer-session-status";

export const dynamic = "force-dynamic";

export default function LoginContinuePage() {
  return <CustomerSessionStatus heading="Customer session restored" />;
}
