import { requireCurrentCustomer } from "@/modules/auth/authorization/require-current-customer";

export default async function LibraryPurchasePage() {
  await requireCurrentCustomer();
  return (
    <main>
      <h1>جزئیات خرید مشتری</h1>
    </main>
  );
}
