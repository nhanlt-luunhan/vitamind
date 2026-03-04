import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { hasConfiguredClerkPublishableKey } from "@/lib/auth/clerk-config";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isAccountRoute = createRouteMatcher(["/account(.*)", "/api/account(.*)"]);
const isClerkEnabled = hasConfiguredClerkPublishableKey();

function getInternalApiBaseUrl() {
  return process.env.INTERNAL_API_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? "3333"}`;
}

async function handleWithoutClerk(req: NextRequest) {
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
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }

  return NextResponse.next();
}

const handleWithClerk = clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const dbSession = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null);
  const hasDbSession = Boolean(dbSession?.sub);
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if ((isAdminRoute(req) || isAccountRoute(req)) && !userId && !hasDbSession) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAdminRoute(req) && userId) {
    const role = (sessionClaims as any)?.publicMetadata?.role;
    const status = (sessionClaims as any)?.publicMetadata?.status;

    if (role === "admin") {
      const blocked = status === "blocked" || status === "disabled";
      if (!blocked) {
        return NextResponse.next();
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

    const checkUrl = new URL("/api/internal/admin-check", getInternalApiBaseUrl());

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

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  if (!isClerkEnabled) {
    return handleWithoutClerk(req);
  }

  return handleWithClerk(req, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
