import { Layout } from "@/components/layout/Layout";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { requireUser } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireUser();

  return (
    <Layout>
      <div className="cover-home1">
        <div className="container">
          <div className="row">
            <div className="col-xl-1" />
            <div className="col-xl-10 col-lg-12">
              <div className="mt-70">
                <div className="d-flex flex-column align-items-start">
                  <div className="blog-meta-bar">
                    <span className="blog-meta-chip">Admin</span>
                    <span className="blog-meta-dot" />
                    <span className="blog-meta-count">Quản trị</span>
                  </div>
                  <h2 className="color-linear d-inline-block mt-20 mb-10">Bảng điều khiển</h2>
                </div>
                <p className="text-lg color-gray-500">
                  Quản lý dữ liệu nghiệp vụ, phân quyền và nội dung.
                </p>
              </div>

              <AdminPanel user={user} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

