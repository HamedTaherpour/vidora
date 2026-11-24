import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/dashboard/dashboard-navigation";
import { requireDashboardCustomer } from "@/modules/dashboard/require-dashboard-customer";

export default async function DashboardPurchasePage() {
  await requireDashboardCustomer(CUSTOMER_DASHBOARD_ROUTES.library);
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
