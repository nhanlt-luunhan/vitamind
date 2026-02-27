import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db/admin-db";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("vitamind_session")?.value;
  if (token) {
    await query("delete from user_sessions where token = $1", [token]);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("vitamind_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

