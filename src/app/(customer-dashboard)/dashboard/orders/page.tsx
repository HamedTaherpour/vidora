import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/account/account-navigation";
import { requireAccountCustomer } from "@/modules/account/require-account-customer";

export default async function DashboardOrdersPage() {
  await requireAccountCustomer(CUSTOMER_DASHBOARD_ROUTES.orders);
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">سفارش‌ها و فاکتورها</h2>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          سوابق سفارش و فاکتور پس از آماده‌شدن دادهٔ واقعی خرید در این بخش نمایش
          داده می‌شود.
        </p>
      </CardContent>
    </Card>
  );
}
