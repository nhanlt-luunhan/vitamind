import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isAccountRoute = createRouteMatcher(["/account(.*)", "/api/account(.*)"]);

function isLoopbackOrigin(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "127.0.0.1" || url.hostname === "localhost" || url.hostname === "::1";
  } catch {
    return false;
  }
}

function getInternalApiBaseUrl(requestUrl: string) {
  const requestOrigin = new URL(requestUrl).origin;
  const configuredBaseUrl =
    process.env.INTERNAL_API_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? "3333"}`;

  if (isLoopbackOrigin(configuredBaseUrl) && !isLoopbackOrigin(requestOrigin)) {
    return requestOrigin;
  }

  return configuredBaseUrl;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const dbSession = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null);
  const hasDbSession = Boolean(dbSession?.sub);

  if ((isAdminRoute(req) || isAccountRoute(req)) && !userId && !hasDbSession) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAdminRoute(req) && userId) {
    const role = (sessionClaims as any)?.publicMetadata?.role;
    const status = (sessionClaims as any)?.publicMetadata?.status;

    if (role) {
      const blocked = status === "blocked" || status === "disabled";
      if (role === "admin" && !blocked) {
        return NextResponse.next();
      }
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }

    const secret = process.env.INTERNAL_API_SECRET;
    if (!secret) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }

    const checkUrl = new URL("/api/internal/admin-check", getInternalApiBaseUrl(req.url));

    let res: Response | null = null;

    try {
      res = await fetch(checkUrl, {
        method: "POST",
        headers: {
          "x-internal-secret": secret,
          "x-clerk-user-id": userId,
        },
        cache: "no-store",
      });
    } catch {
      res = null;
    }

    if (!res?.ok) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/not-authorized", req.url));
    }
  }

  if (isAdminRoute(req) && !userId && hasDbSession) {
    const blocked = dbSession?.status === "blocked" || dbSession?.status === "disabled";
    if (dbSession?.role === "admin" && !blocked) {
      return NextResponse.next();
    }
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
