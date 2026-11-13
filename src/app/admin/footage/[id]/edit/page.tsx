import { requireCurrentAdmin } from "@/modules/auth/authorization/require-current-admin";

export default async function AdminFootageEditPage() {
  await requireCurrentAdmin();
  return (
    <main>
      <h1>ویرایش فوتیج</h1>
    </main>
  );
}
