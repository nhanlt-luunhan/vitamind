import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { syncClerkUserById } from "@/lib/auth/clerk-sync";
import { getSignedInDestination } from "@/lib/auth/admin-auth";
import {
    SESSION_COOKIE_NAME,
    createSessionToken,
    getSessionCookieOptions,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    // Get Clerk userId from the request (works in Route Handler context)
    const { userId } = getAuth(request as any);

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

    // Create a DB session cookie so Server Components can find this user via getSessionUser()
    const token = await createSessionToken(
        { sub: dbUser.id, role: dbUser.role, status: dbUser.status },
        false,
    );

    const destination = getSignedInDestination(dbUser);
    const response = NextResponse.json({ ok: true, destination });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(false));
    return response;
}
