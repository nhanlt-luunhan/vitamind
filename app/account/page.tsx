import { Layout } from "@/components/layout/Layout";
import { AccountProfile, AccountUser } from "@/components/account/AccountProfile";
import { query } from "@/lib/db/admin-db";
import { requireUser } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

type AccountRow = AccountUser;

export default async function Page() {
  const sessionUser = await requireUser();
  const { rows, error } = await query<AccountRow>(
    `select id, email, name, phone, bio, location, company, website, avatar_url
     from users
     where id = $1
     limit 1`,
    [sessionUser.id],
  );

  const user = rows[0] ?? null;

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
                    <span className="blog-meta-chip">Tài khoản</span>
                    <span className="blog-meta-dot" />
                    <span className="blog-meta-count">Hồ sơ cá nhân</span>
                  </div>
                  <h2 className="color-linear d-inline-block mt-20 mb-10">Thông tin tài khoản</h2>
                </div>
                <p className="text-lg color-gray-500">
                  Quản lý thông tin cá nhân, ảnh đại diện và liên hệ của bạn.
                </p>
              </div>

              {error ? (
                <div className="admin-alert mt-30">
                  <strong>Lỗi kết nối:</strong> {error}
                </div>
              ) : null}

              {!user && !error ? (
                <div className="admin-alert mt-30">Không tìm thấy tài khoản.</div>
              ) : null}

              {user ? <AccountProfile user={user} /> : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

