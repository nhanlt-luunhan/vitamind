import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { query } from "@/lib/db/admin-db";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  clerk_user_id: string | null;
  email: string;
  name: string | null;
  display_name: string | null;
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
    `select id, clerk_user_id, email, name, display_name, phone, bio, location, company, website, avatar_url
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
  if (!user.clerk_user_id) {
    return NextResponse.json({ error: "Missing Clerk user" }, { status: 400 });
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

  const { firstName, lastName } = splitName(name);
  const currentClerk = await clerkClient.users.getUser(user.clerk_user_id);
  const nextPublicMetadata = {
    ...(currentClerk.publicMetadata ?? {}),
    phone: phone ?? null,
  };

  await clerkClient.users.updateUser(user.clerk_user_id, {
    firstName: firstName ?? undefined,
    lastName: lastName ?? undefined,
    publicMetadata: nextPublicMetadata,
  });

  const { rows } = await query<ProfileRow>(
    `update users
     set name = $2,
         display_name = $3,
         phone = $4,
         bio = $5,
         location = $6,
         company = $7,
         website = $8,
         updated_at = now()
     where id = $1
     returning id, clerk_user_id, email, name, display_name, phone, bio, location, company, website, avatar_url`,
    [user.id, name, name, phone, bio, location, company, website],
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Không cập nhật được tài khoản." }, { status: 500 });
  }

  return NextResponse.json({ user: rows[0] });
}
