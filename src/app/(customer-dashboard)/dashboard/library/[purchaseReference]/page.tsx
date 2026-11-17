import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/account/account-navigation";
import { requireAccountCustomer } from "@/modules/account/require-account-customer";

export default async function DashboardPurchasePage() {
  await requireAccountCustomer(CUSTOMER_DASHBOARD_ROUTES.library);
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">جزئیات خرید</h2>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          جزئیات خرید و فایل‌های آن پس از اتصال منبع معتبر خرید نمایش داده
          می‌شود.
        </p>
      </CardContent>
    </Card>
  );
}
