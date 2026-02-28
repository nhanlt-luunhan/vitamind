import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import shellStyles from "@/components/admin/AdminShell.module.css";
import { requireAdmin } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

  return (
    <AdminShell activeItem="database">
      <section className={shellStyles.top}>
        <div>
          <span className={shellStyles.topEyebrow}>Cơ sở dữ liệu</span>
          <h1 className={shellStyles.topTitle}>Buồng kỹ thuật dành cho Postgres và chẩn đoán hệ thống</h1>
          <p className={shellStyles.topDescription}>
            Khu này dùng để kiểm tra bảng dữ liệu, theo dõi schema và đối chiếu trạng thái vận
            hành. Giao diện chạy full screen cùng sidebar quản trị để không bị tách khỏi luồng điều hành.
          </p>
        </div>
        <div className={shellStyles.topActions}>
          <Link className="studio-action studio-action--secondary" href="/admin">
            Về bảng điều khiển
          </Link>
          <Link className="studio-action studio-action--primary" href="/adminer/" target="_blank">
            Mở Adminer
          </Link>
        </div>
      </section>

      <section className={`${shellStyles.metrics} ${shellStyles.metricsTriple}`}>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Truy cập</span>
          <strong className={shellStyles.metricValue}>Admin</strong>
          <p className={shellStyles.metricText}>Chỉ quản trị viên mới đi qua được route proxy `/adminer`.</p>
        </article>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Môi trường</span>
          <strong className={shellStyles.metricValue}>Proxy nội bộ</strong>
          <p className={shellStyles.metricText}>Adminer không lộ cổng trực tiếp ra ngoài, mọi truy cập đi qua ứng dụng.</p>
        </article>
        <article className={shellStyles.metricCard}>
          <span className={shellStyles.metricLabel}>Mục tiêu</span>
          <strong className={shellStyles.metricValue}>Postgres</strong>
          <p className={shellStyles.metricText}>Điểm vào duy nhất để xem bảng, chỉ mục và dữ liệu migration hiện hành.</p>
        </article>
      </section>

      <section className={`${shellStyles.grid} ${shellStyles.gridBalanced}`}>
        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Quy tắc A</span>
              <h2>Không mở cơ sở dữ liệu cho mọi vai trò</h2>
            </div>
          </div>
          <p className={shellStyles.panelCopy}>
            Database không phải menu cấp một cho người dùng thường. Chỉ quản trị viên mới được nhìn
            thấy vùng kỹ thuật và quyền này không nên lan sang các vai trò biên tập.
          </p>
        </article>

        <article className={shellStyles.panel}>
          <div className={shellStyles.panelHead}>
            <div>
              <span className={shellStyles.panelEyebrow}>Quy tắc B</span>
              <h2>Giữ ngữ cảnh quản trị trong cùng một màn hình</h2>
            </div>
          </div>
          <p className={shellStyles.panelCopy}>
            Console được đặt trong không gian full screen của admin để bạn chuyển giữa bảng điều
            khiển, nhật ký và dữ liệu mà không phải quay lại giao diện public.
          </p>
        </article>
      </section>

      <section className={`${shellStyles.panel} ${shellStyles.panelConsole}`}>
        <div className={shellStyles.panelHead}>
          <div>
            <span className={shellStyles.panelEyebrow}>Console nhúng</span>
            <h2>Bảng điều khiển Adminer</h2>
          </div>
          <Link className="studio-link-inline" href="/admin">
            Quay lại dashboard
          </Link>
        </div>

        <div className={shellStyles.consoleFrame}>
          <iframe
            title="Adminer"
            src="/adminer/"
            style={{ width: "100%", minHeight: "78vh", border: 0, background: "#fff" }}
          />
        </div>
      </section>
    </AdminShell>
  );
}
