import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isAccountRoute = createRouteMatcher(["/account(.*)", "/api/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if ((isAdminRoute(req) || isAccountRoute(req)) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAdminRoute(req) && userId) {
    const secret = process.env.INTERNAL_API_SECRET;
    if (secret) {
      const checkUrl = new URL("/api/internal/admin-check", req.url);
      const res = await fetch(checkUrl, {
        method: "POST",
        headers: {
          "x-internal-secret": secret,
          "x-clerk-user-id": userId,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/not-authorized", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
