import { requireCurrentAdmin } from "@/modules/auth/authorization/require-current-admin";

export default async function AdminFootagePage() {
  await requireCurrentAdmin();
  return (
    <main>
      <h1>مدیریت فوتیج‌ها</h1>
    </main>
  );
}
