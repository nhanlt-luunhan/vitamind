import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { queryUsersWithProfileColumns } from "@/lib/db/users-profile-schema";
import { GID_RULE_MESSAGE, normalizeGid, sanitizeGid } from "@/lib/utils/gid";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string;
  contact_email: string | null;
  name: string | null;
  display_name: string | null;
  gid: string | null;
  role: string | null;
  status: string | null;
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

  const { rows, error } = await queryUsersWithProfileColumns<ProfileRow>(
    `select id, email, contact_email, name, display_name, gid, role, status, phone, bio, location, company, website, avatar_url
     from users
     where id = $1
     limit 1`,
    [user.id],
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!rows[0]) {
    return NextResponse.json({ error: "Khong tim thay tai khoan." }, { status: 404 });
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
    return NextResponse.json({ error: "Du lieu khong hop le." }, { status: 400 });
  }

  const name = normalizeText(body.name);
  const contactEmail = normalizeText(body.contactEmail);
  const phone = normalizeText(body.phone);
  const rawGid = sanitizeGid(body.gid);
  const gid = normalizeGid(body.gid);
  const bio = normalizeText(body.bio);
  const location = normalizeText(body.location);
  const company = normalizeText(body.company);
  const website = normalizeText(body.website);

  if (rawGid && !gid) {
    return NextResponse.json({ error: GID_RULE_MESSAGE }, { status: 400 });
  }

  const { rows, error } = await queryUsersWithProfileColumns<ProfileRow>(
    `update users
     set name = $2,
         display_name = $3,
         contact_email = $4,
         phone = $5,
         gid = $6,
         bio = $7,
         location = $8,
         company = $9,
         website = $10,
         updated_at = now()
     where id = $1
     returning id, email, contact_email, name, display_name, gid, role, status, phone, bio, location, company, website, avatar_url`,
    [user.id, name, name, contactEmail, phone, gid, bio, location, company, website],
  );

  if (error) {
    if (error.includes("idx_users_gid_unique") || error.includes("duplicate key")) {
      return NextResponse.json({ error: "GID nay da duoc su dung." }, { status: 400 });
    }
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!rows[0]) {
    return NextResponse.json({ error: "Khong cap nhat duoc tai khoan." }, { status: 500 });
  }

  return NextResponse.json({ user: rows[0] });
}
