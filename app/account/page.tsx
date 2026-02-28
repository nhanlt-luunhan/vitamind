import { LayoutShell } from "@/components/layout/LayoutShell";
import { AccountProfile, AccountUser } from "@/components/account/AccountProfile";
import { query } from "@/lib/db/admin-db";
import { requireUser } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

type AccountRow = AccountUser;

export default async function Page() {
  const sessionUser = await requireUser();
  const { rows, error } = await query<AccountRow>(
    `select id, email, contact_email, name, gid, phone, bio, location, company, website, avatar_url
     from users
     where id = $1
     limit 1`,
    [sessionUser.id],
  );

  const user = rows[0] ?? null;

  return (
    <>
      <LayoutShell />
      <main className="main account-main">
        <div className="cover-home1 account-screen">
          <div className="container">
            <div className="account-page">
              {error ? (
                <div className="admin-alert mt-20">
                  <strong>Lỗi kết nối:</strong> {error}
                </div>
              ) : null}

              {!user && !error ? (
                <div className="admin-alert mt-20">Không tìm thấy tài khoản.</div>
              ) : null}

              {user ? <AccountProfile user={user} /> : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
