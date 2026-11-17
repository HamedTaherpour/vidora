import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/account/account-navigation";
import { requireAccountCustomer } from "@/modules/account/require-account-customer";

export default async function DashboardProfilePage() {
  const customer = await requireAccountCustomer(
    CUSTOMER_DASHBOARD_ROUTES.profile,
  );
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">پروفایل</h2>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          شمارهٔ حساب: <bdi dir="ltr">{customer.phone}</bdi>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          تغییر شمارهٔ تلفن در V1 تعریف نشده است.
        </p>
      </CardContent>
    </Card>
  );
}
