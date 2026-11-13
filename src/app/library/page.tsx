import { requireCurrentCustomer } from "@/modules/auth/authorization/require-current-customer";

export default async function LibraryPage() {
  await requireCurrentCustomer();
  return (
    <main>
      <h1>کتابخانه مشتری</h1>
    </main>
  );
}
