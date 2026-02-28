import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { requireAdmin } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireAdmin();

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
                    <span className="blog-meta-count">Database</span>
                  </div>
                  <h2 className="color-linear d-inline-block mt-20 mb-10">Adminer Dashboard</h2>
                </div>
                <p className="text-lg color-gray-500 mb-20">
                  Truy cap Postgres qua Adminer trong mot khung duoc bao ve boi quyen admin.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link className="btn btn-linear" href="/admin">
                    Quay lai admin
                  </Link>
                  <a className="btn btn-black" href="/adminer/" target="_blank" rel="noreferrer">
                    Mo Adminer tab moi
                  </a>
                </div>
              </div>

              <div className="account-card mt-30 p-0 overflow-hidden">
                <iframe
                  title="Adminer"
                  src="/adminer/"
                  style={{ width: "100%", minHeight: "80vh", border: 0, background: "#fff" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
