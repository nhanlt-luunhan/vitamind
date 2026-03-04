import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { syncClerkUserById } from "@/lib/auth/clerk-sync";
import { getSignedInDestination } from "@/lib/auth/admin-auth";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let dbUser = null;
  try {
    dbUser = await syncClerkUserById(userId);
  } catch {
    // Clerk API unreachable
  }

  if (!dbUser) {
    return NextResponse.json({ error: "User not found in database" }, { status: 404 });
  }

  if (dbUser.status && dbUser.status !== "active") {
    return NextResponse.json({ error: "Account is not active" }, { status: 403 });
  }

  const token = await createSessionToken(
    { sub: dbUser.id, role: dbUser.role, status: dbUser.status },
    false,
  );

  const destination = getSignedInDestination(dbUser);
  const response = NextResponse.json({ ok: true, destination });
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(false));
  return response;
}
