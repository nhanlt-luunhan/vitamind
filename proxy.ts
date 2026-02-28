import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)", "/adminer(.*)"]);
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

  // In container/proxy deployments, loopback can fail from middleware even when the public origin works.
  if (isLoopbackOrigin(configuredBaseUrl) && !isLoopbackOrigin(requestOrigin)) {
    return requestOrigin;
  }

  return configuredBaseUrl;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if ((isAdminRoute(req) || isAccountRoute(req)) && !userId) {
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

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
