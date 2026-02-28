import Link from "next/link";
import { AdminPanel, type AdminTabKey } from "@/components/admin/AdminPanel";
import { AdminShell, type AdminNavKey } from "@/components/admin/AdminShell";
import shellStyles from "@/components/admin/AdminShell.module.css";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { getAllPostsAdmin } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

type CountRow = {
  total: number | string;
};

type OrderStatusRow = {
  status: string | null;
  total: number | string;
};

type AuditPreviewRow = {
  id: string;
  actor_email: string | null;
  action: string;
  table_name: string;
  created_at: string;
};

type PageProps = {
  searchParams?: Promise<{ tab?: string | string[] }> | { tab?: string | string[] };
};

const adminTabs: AdminTabKey[] = ["users", "products", "orders", "blog", "media", "audit"];

const normalizeTab = (value?: string | string[]): AdminTabKey => {
  const candidate = Array.isArray(value) ? value[0] : value;
  return adminTabs.includes(candidate as AdminTabKey) ? (candidate as AdminTabKey) : "users";
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const hasExplicitTab = Boolean(resolvedSearchParams?.tab);
  const currentTab = normalizeTab(resolvedSearchParams?.tab);
  const activeNav: AdminNavKey = hasExplicitTab ? currentTab : "dashboard";
  const user = await requireAdmin();
  const [usersCount, productsCount, ordersCount, mediaCount, auditCount, orderStatus, auditPreview] =
    await Promise.all([
      query<CountRow>(
        `select count(*)::int as total
         from users
         where coalesce(status, 'active') <> 'deleted'`,
      ),
      query<CountRow>(
        `select count(*)::int as total
         from products
         where deleted_at is null`,
      ),
      query<CountRow>(
        `select count(*)::int as total
         from orders
         where deleted_at is null`,
      ),
      query<CountRow>(
        `select count(*)::int as total
         from media
         where deleted_at is null`,
      ),
      query<CountRow>(`select count(*)::int as total from audit_log`),
      query<OrderStatusRow>(
        `select coalesce(status, 'new') as status, count(*)::int as total
         from orders
         where deleted_at is null
         group by 1
         order by 2 desc`,
      ),
      query<AuditPreviewRow>(
        `select a.id,
                u.email as actor_email,
                a.action,
                a.table_name,
                a.created_at
         from audit_log a
         left join users u on u.id = a.actor_user_id
         order by a.created_at desc
         limit 5`,
      ),
    ]);
  const posts = await getAllPostsAdmin();

  const usersTotal = Number(usersCount.rows[0]?.total ?? 0);
  const productsTotal = Number(productsCount.rows[0]?.total ?? 0);
  const ordersTotal = Number(ordersCount.rows[0]?.total ?? 0);
  const mediaTotal = Number(mediaCount.rows[0]?.total ?? 0);
  const auditTotal = Number(auditCount.rows[0]?.total ?? 0);
  const publishedPosts = posts.filter((post) => post.published).length;
  const draftPosts = posts.length - publishedPosts;
  const pendingOrders = orderStatus.rows
    .filter((row) => ["new", "paid", "shipping"].includes((row.status ?? "").toLowerCase()))
    .reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  return (
    <AdminShell activeItem={activeNav}>
      <section className={shellStyles.top}>
        <div>
          <span className={shellStyles.topEyebrow}>Bảng điều khiển</span>
          <h1 className={shellStyles.topTitle}>Tổng quan vận hành và phân quyền</h1>
          <p className={shellStyles.topDescription}>
            Giao diện quản trị được tách riêng theo hướng Lahomes: sidebar có cấu trúc rõ
            ràng, khung tổng quan ở trên và khu workbench cho thao tác chuyên sâu.
          </p>
        </div>
        <div className={shellStyles.topActions}>
          <Link className="studio-action studio-action--secondary" href="/account">
            Tài khoản
          </Link>
          <Link className="studio-action studio-action--primary" href="/admin/database">
            Cơ sở dữ liệu
          </Link>
        </div>
      </section>

      <section className={shellStyles.metrics}>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Người dùng</span>
          <strong className={shellStyles.metricValue}>{usersTotal}</strong>
          <p className={shellStyles.metricText}>Tổng số tài khoản nội bộ đang được quản lý trong hệ thống.</p>
        </article>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Đơn hàng</span>
          <strong className={shellStyles.metricValue}>{ordersTotal}</strong>
          <p className={shellStyles.metricText}>{pendingOrders} đơn hàng đang nằm trong luồng xử lý.</p>
        </article>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Bài viết</span>
          <strong className={shellStyles.metricValue}>{posts.length}</strong>
          <p className={shellStyles.metricText}>{publishedPosts} đã xuất bản, {draftPosts} đang biên tập.</p>
        </article>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Thư viện</span>
          <strong className={shellStyles.metricValue}>{mediaTotal}</strong>
          <p className={shellStyles.metricText}>{productsTotal} sản phẩm và {auditTotal} nhật ký đang được đối chiếu.</p>
        </article>
      </section>

      <section className={shellStyles.grid}>
        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Trạng thái</span>
              <h2>Điểm điều phối chính</h2>
            </div>
            <span className={shellStyles.panelPill}>Đang hoạt động</span>
          </div>
          <div className={shellStyles.snapshot}>
            <div className={shellStyles.snapshotItem}>
              <strong>{user.display_name ?? user.name ?? user.email}</strong>
              <span>Quản trị viên đang đăng nhập qua Clerk</span>
            </div>
            <div className={shellStyles.snapshotItem}>
              <strong>{user.contact_email ?? user.email}</strong>
              <span>Email liên hệ đang đồng bộ từ hồ sơ người dùng</span>
            </div>
            <div className={shellStyles.snapshotItem}>
              <strong>{user.phone ?? "Chưa thiết lập"}</strong>
              <span>Số điện thoại đồng bộ từ Clerk metadata</span>
            </div>
            <div className={shellStyles.snapshotItem}>
              <strong>{user.gid ?? "Chưa thiết lập"}</strong>
              <span>Mã GID nội bộ hiện hành</span>
            </div>
            <div className={shellStyles.snapshotItem}>
              <strong>{pendingOrders}</strong>
              <span>Đơn hàng cần theo dõi</span>
            </div>
            <div className={shellStyles.snapshotItem}>
              <strong>{auditTotal}</strong>
              <span>Bản ghi nhật ký tích lũy</span>
            </div>
            <div className={shellStyles.snapshotItem}>
              <strong>
                {user.updated_at ? new Date(user.updated_at).toLocaleString("vi-VN") : "-"}
              </strong>
              <span>Thời điểm snapshot nội bộ được làm mới gần nhất</span>
            </div>
          </div>
        </article>

        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Nhật ký gần đây</span>
              <h2>Lịch sử thao tác</h2>
            </div>
            <Link className="studio-link-inline" href="/admin/database">
              Mở console
            </Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Actor</th>
                  <th>Hành động</th>
                  <th>Bảng</th>
                </tr>
              </thead>
              <tbody>
                {!auditPreview.rows.length ? (
                  <tr>
                    <td colSpan={4}>Chưa có dữ liệu nhật ký.</td>
                  </tr>
                ) : null}
                {auditPreview.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.created_at).toLocaleString("vi-VN")}</td>
                    <td>{row.actor_email ?? "-"}</td>
                    <td>{row.action}</td>
                    <td>{row.table_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className={`${shellStyles.panel} ${shellStyles.panelWorkbench}`}>
        <div className={shellStyles.panelHead}>
          <div>
            <span className={shellStyles.panelEyebrow}>Không gian điều hành</span>
            <h2>Điều phối các phân khu quản trị</h2>
          </div>
          <Link className="studio-link-inline" href="/admin/database">
            Cơ sở dữ liệu
          </Link>
        </div>

        <AdminPanel user={user} initialTab={currentTab} showSidebar={false} />
      </section>
    </AdminShell>
  );
}
