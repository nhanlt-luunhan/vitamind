import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { UserListPageTitle } from "./components/UserListPageTitle";
import { UserListView } from "./components/UserListView";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminShell activeItem="database">
      <UserListPageTitle title="Danh sách người dùng" subName="Cơ sở dữ liệu" />
      <UserListView />
    </AdminShell>
  );
}
