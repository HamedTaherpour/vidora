import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/account/account-navigation";
import { requireAccountCustomer } from "@/modules/account/require-account-customer";

export default async function DashboardInvoicePage() {
  await requireAccountCustomer(CUSTOMER_DASHBOARD_ROUTES.library);
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">فاکتور خرید</h2>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          فاکتور فقط برای خرید تأییدشده و پس از آماده‌شدن دادهٔ واقعی در دسترس
          خواهد بود.
        </p>
      </CardContent>
    </Card>
  );
}
