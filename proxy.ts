import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

function isAdminRoute(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/api/admin");
}

function isAccountRoute(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/api/account");
}

export default async function proxy(req: NextRequest) {
  const dbSession = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null);
  const hasDbSession = Boolean(dbSession?.sub);
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if ((isAdminRoute(req) || isAccountRoute(req)) && !hasDbSession) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAdminRoute(req) && hasDbSession) {
    const blocked = dbSession?.status === "blocked" || dbSession?.status === "disabled";
    if (dbSession?.role === "admin" && !blocked) {
      return NextResponse.next();
    }
    if (isApiRoute) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
