import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";
import { GID_RULE_MESSAGE, normalizeGid, sanitizeGid } from "@/lib/utils/gid";
import { isProtectedSharedClerkMode } from "@/lib/auth/environment";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  clerk_user_id: string | null;
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

const splitName = (value: string | null) => {
  if (!value) return { firstName: null, lastName: null };
  const parts = value.split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  const lastName = parts.pop() ?? null;
  return { firstName: parts.join(" "), lastName };
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await query<ProfileRow>(
    `select id, clerk_user_id, email, contact_email, name, display_name, gid, role, status, phone, bio, location, company, website, avatar_url
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
  const contactEmail = normalizeText(body.contactEmail);
  const phone = normalizeText(body.phone);
  const rawGid = sanitizeGid(body.gid);
  const gid = normalizeGid(body.gid);
  const bio = normalizeText(body.bio);
  const location = normalizeText(body.location);
  const company = normalizeText(body.company);
  const website = normalizeText(body.website);
  const { firstName, lastName } = splitName(name);

  if (rawGid && !gid) {
    return NextResponse.json({ error: GID_RULE_MESSAGE }, { status: 400 });
  }

  if (isProtectedSharedClerkMode() && rawGid !== sanitizeGid(user.gid)) {
    return NextResponse.json(
      { error: "Shared Clerk mode is enabled. GID changes are blocked in this environment." },
      { status: 403 },
    );
  }

  const { rows, error } = await query<ProfileRow>(
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
     returning id, clerk_user_id, email, contact_email, name, display_name, gid, role, status, phone, bio, location, company, website, avatar_url`,
    [user.id, name, name, contactEmail, phone, gid, bio, location, company, website],
  );

  if (error) {
    if (error.includes("idx_users_gid_unique") || error.includes("duplicate key")) {
      return NextResponse.json({ error: "GID này đã được sử dụng." }, { status: 400 });
    }
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!rows[0]) {
    return NextResponse.json({ error: "Không cập nhật được tài khoản." }, { status: 500 });
  }

  if (!user.clerk_user_id) {
    return NextResponse.json({ user: rows[0] });
  }

  const client = await clerkClient();
  await client.users.updateUser(user.clerk_user_id, {
    firstName: firstName ?? undefined,
    lastName: lastName ?? undefined,
  });

  return NextResponse.json({ user: rows[0] });
}
