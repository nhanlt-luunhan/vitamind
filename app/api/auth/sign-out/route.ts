import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const cookieNames = new Set<string>([SESSION_COOKIE_NAME, "__session"]);

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("__clerk")) {
      cookieNames.add(cookie.name);
    }
  }

  for (const cookieName of cookieNames) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });
  }

  return response;
}
