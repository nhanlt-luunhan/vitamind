import Link from "next/link";
import { AdminPanel, type AdminTabKey } from "@/components/admin/AdminPanel";
import { AdminUsersLivePanel } from "@/components/admin/AdminUsersLivePanel";
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

type UserPreviewRow = {
  id: string;
  email: string;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
  updated_at: string | null;
  created_at: string;
};

type QuickLink = {
  href: string;
  label: string;
  note: string;
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
  const [
    usersCount,
    productsCount,
    ordersCount,
    mediaCount,
    auditCount,
    orderStatus,
    auditPreview,
    usersPreview,
  ] = await Promise.all([
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
    query<UserPreviewRow>(
      `select id,
                email,
                name,
                display_name,
                gid,
                role,
                status,
                updated_at,
                created_at
         from users
         order by coalesce(updated_at, created_at) desc, created_at desc
         limit 8`,
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
  const dbErrors = [
    usersCount.error,
    productsCount.error,
    ordersCount.error,
    mediaCount.error,
    auditCount.error,
    orderStatus.error,
    auditPreview.error,
    usersPreview.error,
  ].filter(Boolean) as string[];
  const dbHealthy = dbErrors.length === 0;
  const operatorName = user.display_name ?? user.name ?? user.email;
  const lastAuditEntry = auditPreview.rows[0] ?? null;
  const topStatus = pendingOrders > 0 ? "Đang có việc chờ xử lý" : "Luồng vận hành ổn định";
  const orderFocus =
    pendingOrders > 0
      ? `${pendingOrders} đơn đang cần theo dõi ngay trong workbench.`
      : "Không có đơn nào mắc lại trong hàng chờ hiện tại.";
  const quickLinks: QuickLink[] = [
    {
      href: "/admin?tab=orders",
      label: "Xử lý đơn hàng",
      note:
        pendingOrders > 0
          ? `${pendingOrders} đơn đang nằm trong nhóm cần thao tác.`
          : "Mở nhanh khu đơn hàng để rà trạng thái giao dịch.",
    },
    {
      href: "/admin?tab=blog",
      label: "Biên tập nội dung",
      note: `${draftPosts} bài đang ở trạng thái biên tập, ${publishedPosts} bài đã lên lịch công khai.`,
    },
    {
      href: "/admin?tab=users",
      label: "Quản lý quyền truy cập",
      note: `${usersTotal} tài khoản đang được điều phối trong lớp nội bộ.`,
    },
    {
      href: "/admin/database",
      label: "Kiểm tra Postgres",
      note: dbHealthy
        ? "Console dữ liệu sẵn sàng để đối chiếu schema và bản ghi."
        : "Có tín hiệu lỗi truy vấn, nên kiểm tra DB trước khi thao tác tiếp.",
    },
  ];

  return (
    <AdminShell activeItem={activeNav}>
      <section className={shellStyles.top}>
        <div className={shellStyles.topLayout}>
          <div>
            <span className={shellStyles.topEyebrow}>Bảng điều khiển</span>
            <h1 className={shellStyles.topTitle}>Tổng quan vận hành và phân quyền</h1>
            <p className={shellStyles.topDescription}>
              Màn hình này gom ca trực quản trị, tín hiệu dữ liệu và cửa vào workbench vào cùng một
              nhịp làm việc để bạn không phải nhảy qua nhiều tầng điều hướng.
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
        </div>

        <div className={shellStyles.topMeta}>
          <article className={shellStyles.topMetaCard}>
            <span className={shellStyles.topMetaLabel}>Ca trực hiện tại</span>
            <strong className={shellStyles.topMetaValue}>{operatorName}</strong>
            <p className={shellStyles.topMetaText}>Tài khoản điều phối đang đăng nhập qua lớp admin nội bộ.</p>
          </article>
          <article className={shellStyles.topMetaCard}>
            <span className={shellStyles.topMetaLabel}>Trạng thái DB</span>
            <strong className={shellStyles.topMetaValue}>{dbHealthy ? "Ổn định" : "Cần kiểm tra"}</strong>
            <p className={shellStyles.topMetaText}>
              {dbHealthy ? "Không có lỗi truy vấn trong snapshot đầu trang." : dbErrors[0]}
            </p>
          </article>
          <article className={shellStyles.topMetaCard}>
            <span className={shellStyles.topMetaLabel}>Đơn hàng cần theo dõi</span>
            <strong className={shellStyles.topMetaValue}>{pendingOrders}</strong>
            <p className={shellStyles.topMetaText}>{orderFocus}</p>
          </article>
          <article className={shellStyles.topMetaCard}>
            <span className={shellStyles.topMetaLabel}>Nhật ký mới nhất</span>
            <strong className={shellStyles.topMetaValue}>
              {lastAuditEntry ? new Date(lastAuditEntry.created_at).toLocaleTimeString("vi-VN") : "-"}
            </strong>
            <p className={shellStyles.topMetaText}>
              {lastAuditEntry
                ? `${lastAuditEntry.action} trên ${lastAuditEntry.table_name}`
                : "Chưa có bản ghi audit gần đây."}
            </p>
          </article>
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

      <section className={`${shellStyles.grid} ${shellStyles.gridDashboard}`}>
        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Trạng thái</span>
              <h2>Deck điều phối trong ca trực</h2>
            </div>
            <span
              className={`${shellStyles.panelPill} ${dbHealthy ? shellStyles.panelPillHealthy : shellStyles.panelPillWarning}`}
            >
              {topStatus}
            </span>
          </div>
          <div className={shellStyles.signalGrid}>
            <article className={shellStyles.signalCard}>
              <span className={shellStyles.signalEyebrow}>Người điều phối</span>
              <strong>{operatorName}</strong>
              <p>Tài khoản đang giữ quyền quản trị trên dashboard và workbench.</p>
            </article>
            <article className={shellStyles.signalCard}>
              <span className={shellStyles.signalEyebrow}>Liên hệ và định danh</span>
              <strong>{user.contact_email ?? user.email}</strong>
              <p>Tài khoản dùng để nhận thông báo và xác thực nội bộ.</p>
            </article>
            <article className={shellStyles.signalCard}>
              <span className={shellStyles.signalEyebrow}>Đồng bộ hồ sơ</span>
              <strong>{user.phone ?? "Chưa thiết lập"}</strong>
              <p>
                {user.updated_at
                  ? `Snapshot nội bộ cập nhật lúc ${new Date(user.updated_at).toLocaleString("vi-VN")}.`
                  : "Chưa có dấu mốc cập nhật gần nhất cho hồ sơ này."}
              </p>
            </article>
            <article className={shellStyles.signalCard}>
              <span className={shellStyles.signalEyebrow}>Backlog vận hành</span>
              <strong>{pendingOrders}</strong>
              <p>{orderFocus}</p>
            </article>
            <article className={shellStyles.signalCard}>
              <span className={shellStyles.signalEyebrow}>Nhịp nội dung</span>
              <strong>{publishedPosts}/{posts.length}</strong>
              <p>{draftPosts} bài đang nằm trong lớp biên tập chờ hoàn thiện.</p>
            </article>
            <article className={shellStyles.signalCard}>
              <span className={shellStyles.signalEyebrow}>Dấu vết hệ thống</span>
              <strong>{auditTotal}</strong>
              <p>{dbHealthy ? "Audit log đang phản ánh trạng thái hệ thống bình thường." : "Có lỗi truy vấn, nên kiểm tra lại schema."}</p>
            </article>
          </div>

          <div className={shellStyles.quickGrid}>
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className={shellStyles.quickCard}>
                <span>{item.label}</span>
                <strong>{item.note}</strong>
              </Link>
            ))}
          </div>
        </article>

        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Nhật ký gần đây</span>
              <h2>Dòng thao tác hệ thống</h2>
            </div>
            <Link className="studio-link-inline" href="/admin/database">
              Mở console
            </Link>
          </div>
          <div className={shellStyles.timelineSummary}>
            <div className={shellStyles.timelineSummaryCard}>
              <span>Bản ghi gần đây</span>
              <strong>{auditPreview.rows.length}</strong>
              <p>Danh sách được cắt gọn để đọc nhanh trên dashboard.</p>
            </div>
            <div className={shellStyles.timelineSummaryCard}>
              <span>Actor gần nhất</span>
              <strong>{lastAuditEntry?.actor_email ?? "Hệ thống"}</strong>
              <p>Người hoặc tiến trình vừa tạo thay đổi mới nhất.</p>
            </div>
            <div className={shellStyles.timelineSummaryCard}>
              <span>Bảng tác động</span>
              <strong>{lastAuditEntry?.table_name ?? "-"}</strong>
              <p>Mốc thao tác cuối giúp bạn định vị ngay vùng cần kiểm tra.</p>
            </div>
          </div>

          <div className={shellStyles.timelineList}>
            {!auditPreview.rows.length ? (
              <div className={shellStyles.timelineEmpty}>Chưa có dữ liệu nhật ký.</div>
            ) : null}
            {auditPreview.rows.map((row) => (
              <article key={row.id} className={shellStyles.timelineItem}>
                <div className={shellStyles.timelineStamp}>
                  <strong>{new Date(row.created_at).toLocaleTimeString("vi-VN")}</strong>
                  <span>{new Date(row.created_at).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className={shellStyles.timelineBody}>
                  <div className={shellStyles.timelineHead}>
                    <strong>{row.action}</strong>
                    <span>{row.table_name}</span>
                  </div>
                  <p>{row.actor_email ?? "Hệ thống nội bộ"} tạo ra thay đổi này.</p>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <AdminUsersLivePanel initialUsers={usersPreview.rows} />

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
