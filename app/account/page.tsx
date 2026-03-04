import { LayoutShell } from "@/components/layout/LayoutShell";
import { AccountProfile, AccountUser } from "@/components/account/AccountProfile";
import { query } from "@/lib/db/admin-db";
import { requireUser } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

type AccountRow = AccountUser;

function isMissingUsersColumnError(error: string | undefined) {
  return Boolean(error && /column .* does not exist/i.test(error));
}

function toLegacyAccountUser(
  row: Record<string, unknown>,
  sessionUser: Awaited<ReturnType<typeof requireUser>>,
): AccountUser {
  const email = typeof row.email === "string" ? row.email : sessionUser.email;
  const name = typeof row.name === "string" ? row.name : sessionUser.name;

  return {
    id: String(row.id ?? sessionUser.id),
    email,
    contact_email: email,
    name,
    phone: null,
    bio: null,
    location: null,
    company: null,
    website: null,
    avatar_url: null,
  };
}

export default async function Page() {
  const sessionUser = await requireUser();
  const current = await query<AccountRow>(
    `select id, email, contact_email, name, phone, bio, location, company, website, avatar_url
     from users
     where id = $1
     limit 1`,
    [sessionUser.id],
  );

  let error = current.error;
  let user = current.rows[0] ?? null;

  if (!user && isMissingUsersColumnError(current.error)) {
    const legacy = await query<Record<string, unknown>>(
      `select id, email, name
       from users
       where id = $1
       limit 1`,
      [sessionUser.id],
    );

    if (!legacy.error && legacy.rows[0]) {
      user = toLegacyAccountUser(legacy.rows[0], sessionUser);
      error = undefined;
    }
  }

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
