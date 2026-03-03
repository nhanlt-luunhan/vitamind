import Link from "next/link";
import { DatabaseAccessWorkbench } from "@/components/admin/DatabaseAccessWorkbench";
import { AdminShell } from "@/components/admin/AdminShell";
import shellStyles from "@/components/admin/AdminShell.module.css";
import { fetchAccessGroups, fetchAccessPermissions } from "@/lib/access-control/admin";
import { requireAdmin } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();
  const pgAdminPort = process.env.PGADMIN_PORT ?? "35050";
  const [permissionsResult, groupsResult] = await Promise.all([
    fetchAccessPermissions(),
    fetchAccessGroups(),
  ]);
  const initialPermissions = permissionsResult.error ? [] : permissionsResult.rows;
  const initialGroups = groupsResult.error ? [] : groupsResult.rows;

  return (
    <AdminShell activeItem="database">
      <section className={shellStyles.top}>
        <div>
          <span className={shellStyles.topEyebrow}>Cơ sở dữ liệu</span>
          <h1 className={shellStyles.topTitle}>Buồng kỹ thuật dành cho Postgres và pgAdmin</h1>
          <p className={shellStyles.topDescription}>
            Adminer đã được gỡ khỏi hệ thống. Việc quản trị database giờ đi qua pgAdmin chạy riêng
            theo IP và cổng của máy chủ để tránh proxy nội bộ và tránh thiếu thông tin thao tác.
          </p>
        </div>
        <div className={shellStyles.topActions}>
          <Link className="studio-action studio-action--secondary" href="/admin/users/list-view">
            Người dùng
          </Link>
          <Link className="studio-action studio-action--secondary" href="/admin/database#permissions">
            Quyền
          </Link>
          <Link className="studio-action studio-action--secondary" href="/admin">
            Về bảng điều khiển
          </Link>
        </div>
      </section>

      <section className={`${shellStyles.metrics} ${shellStyles.metricsTriple}`}>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Truy cập</span>
          <strong className={shellStyles.metricValue}>Qua IP</strong>
          <p className={shellStyles.metricText}>Mở pgAdmin từ trình duyệt bằng IP máy chủ và cổng riêng.</p>
        </article>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Môi trường</span>
          <strong className={shellStyles.metricValue}>pgAdmin</strong>
          <p className={shellStyles.metricText}>Không còn iframe hay proxy nội bộ trong app cho database admin.</p>
        </article>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Mục tiêu</span>
          <strong className={shellStyles.metricValue}>Postgres</strong>
          <p className={shellStyles.metricText}>Điểm vào duy nhất để xem bảng, chỉ mục và dữ liệu migration hiện hành.</p>
        </article>
      </section>

      <section id="users" className={`${shellStyles.panel} ${shellStyles.anchorTarget}`}>
        <div className={shellStyles.panelHead}>
          <div>
            <span className={shellStyles.panelEyebrow}>Người dùng</span>
            <h2>Danh sách người dùng đã tách thành list view theo tham chiếu Lahomes</h2>
          </div>
          <Link className="studio-action studio-action--secondary" href="/admin/users/list-view">
            Mở danh sách người dùng
          </Link>
        </div>
        <p className={shellStyles.panelCopy}>
          Khu vực chỉnh sửa user giờ đi theo cây thư mục kiểu Lahomes tại
          {" "}
          <code>app/admin/users/list-view</code>
          {" "}
          để tách riêng list view, form chỉnh sửa và lịch sử thao tác khỏi trang điều phối database.
        </p>
        <div className={`${shellStyles.metrics} ${shellStyles.metricsTriple}`}>
          <article className={shellStyles.metricCard}>
            <span className={shellStyles.metricLabel}>Route</span>
            <strong className={shellStyles.metricValue}>/admin/users/list-view</strong>
            <p className={shellStyles.metricText}>
              Danh sách user dùng bố cục card và table theo customer list view của Lahomes.
            </p>
          </article>
          <article className={shellStyles.metricCard}>
            <span className={shellStyles.metricLabel}>Nhóm</span>
            <strong className={shellStyles.metricValue}>{initialGroups.length}</strong>
            <p className={shellStyles.metricText}>
              Group được tạo trước, sau đó mới gán lại cho user trong màn hình chi tiết.
            </p>
          </article>
          <article className={shellStyles.metricCard}>
            <span className={shellStyles.metricLabel}>Quyền</span>
            <strong className={shellStyles.metricValue}>{initialPermissions.length}</strong>
            <p className={shellStyles.metricText}>
              Permission riêng và permission kế thừa theo group đều hiển thị ngay trong list view mới.
            </p>
          </article>
        </div>
      </section>

      <section className={`${shellStyles.grid} ${shellStyles.gridBalanced}`}>
        <article id="permissions" className={`${shellStyles.panel} ${shellStyles.anchorTarget}`}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Quyền</span>
              <h2>Tạo quyền, gom quyền vào nhóm rồi áp dụng lại cho user</h2>
            </div>
          </div>
          <DatabaseAccessWorkbench
            initialPermissions={initialPermissions}
            initialGroups={initialGroups}
          />
        </article>
      </section>

      <section className={`${shellStyles.grid} ${shellStyles.gridBalanced}`}>
        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Quy tắc A</span>
              <h2>Không nhúng console DB vào ứng dụng</h2>
            </div>
          </div>
          <p className={shellStyles.panelCopy}>
            Công cụ quản trị database chạy tách riêng khỏi app để tránh mở rộng bề mặt tấn công,
            tránh lỗi proxy và giữ app chỉ làm đúng vai trò điều hành nghiệp vụ.
          </p>
        </article>

        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Quy tắc B</span>
              <h2>Dùng pgAdmin qua IP máy chủ</h2>
            </div>
          </div>
          <p className={shellStyles.panelCopy}>
            Nếu đã bind `PGADMIN_BIND_IP=0.0.0.0`, bạn có thể truy cập trực tiếp bằng
            `http://IP_MAY_CHU:{pgAdminPort}` và đăng nhập bằng tài khoản pgAdmin đã cấu hình.
          </p>
        </article>
      </section>

      <section className={`${shellStyles.grid} ${shellStyles.gridBalanced}`}>
        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Sync schema</span>
              <h2>Dùng một lệnh để áp SQL hiện hành</h2>
            </div>
          </div>
          <p className={shellStyles.panelCopy}>
            Repo này đang sync Postgres bằng các file trong `docker/db-init`, không phải Prisma
            migration đang chạy thực tế. Khi schema đổi, chạy `npm run db:sync` để áp lại toàn bộ
            file SQL theo thứ tự tên.
          </p>
        </article>

        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Volume cũ</span>
              <h2>Không chờ bootstrap tự chạy lại</h2>
            </div>
          </div>
          <p className={shellStyles.panelCopy}>
            `docker-entrypoint-initdb.d` chỉ chạy khi Postgres tạo volume mới. Nếu DB đã tồn tại,
            `docker compose up -d db` sẽ không tự áp schema mới. Lúc đó phải chạy script sync hoặc
            chủ động reset volume nếu chấp nhận mất dữ liệu local.
          </p>
        </article>
      </section>

      <section className={`${shellStyles.panel} ${shellStyles.panelConsole}`}>
        <div className={shellStyles.panelHead}>
          <div>
            <span className={shellStyles.panelEyebrow}>Cách truy cập</span>
            <h2>Thông số pgAdmin hiện hành</h2>
          </div>
          <Link className="studio-link-inline" href="/admin">
            Quay lại dashboard
          </Link>
        </div>

        <div className={shellStyles.consoleFrame} style={{ padding: "24px 28px", color: "#fff" }}>
          <p className={shellStyles.panelCopy}>
            URL truy cập mẫu: <strong>{`http://IP_MAY_CHU:${pgAdminPort}`}</strong>
          </p>
          <p className={shellStyles.panelCopy}>
            Server name trong pgAdmin: <strong>vitamind-db</strong>
          </p>
          <p className={shellStyles.panelCopy}>
            Host: <strong>db</strong> nếu pgAdmin chạy cùng Docker network, hoặc IP/host của Postgres nếu đi từ ngoài.
          </p>
          <p className={shellStyles.panelCopy}>
            Port: <strong>5432</strong> trong Docker network, hoặc cổng publish Postgres nếu bạn mở ra ngoài.
          </p>
          <p className={shellStyles.panelCopy}>
            Database: <strong>vitamind</strong>, Username: <strong>vitamind</strong>
          </p>
        </div>
      </section>
    </AdminShell>
  );
}
