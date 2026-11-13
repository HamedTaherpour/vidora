import { requireCurrentCustomer } from "@/modules/auth/authorization/require-current-customer";

export default async function LibraryInvoicePage() {
  await requireCurrentCustomer();
  return (
    <main>
      <h1>فاکتور خرید مشتری</h1>
    </main>
  );
}
