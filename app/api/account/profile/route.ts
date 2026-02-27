import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  avatar_url: string | null;
};

const normalizeText = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<ProfileRow>(
    `select id, email, name, phone, bio, location, company, website, avatar_url
     from users
     where id = $1
     limit 1`,
    [user.id],
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  return NextResponse.json({ user: rows[0] });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const name = normalizeText(body.name);
  const phone = normalizeText(body.phone);
  const bio = normalizeText(body.bio);
  const location = normalizeText(body.location);
  const company = normalizeText(body.company);
  const website = normalizeText(body.website);

  const { rows } = await query<ProfileRow>(
    `update users
     set name = $2,
         phone = $3,
         bio = $4,
         location = $5,
         company = $6,
         website = $7,
         updated_at = now()
     where id = $1
     returning id, email, name, phone, bio, location, company, website, avatar_url`,
    [user.id, name, phone, bio, location, company, website],
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Không cập nhật được tài khoản." }, { status: 500 });
  }

  return NextResponse.json({ user: rows[0] });
}

