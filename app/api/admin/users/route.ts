import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/rbac";
import { drainClerkDeletionQueue, syncAllClerkUsers } from "@/lib/auth/clerk-sync";
import { fetchDecoratedUsers } from "@/lib/access-control/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const shouldSync = searchParams.get("sync") !== "0";
  const rawLimit = Number(searchParams.get("limit") ?? "");
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.trunc(rawLimit), 200) : null;

  if (shouldSync) {
    try {
      await drainClerkDeletionQueue();
      await syncAllClerkUsers();
    } catch {
      // Keep serving the latest internal snapshot if Clerk is unavailable.
    }
  }

  const { rows, error } = await fetchDecoratedUsers(limit);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({
    users: rows,
    meta: {
      synced: shouldSync,
      limit,
      polled_at: new Date().toISOString(),
    },
  });
}

export async function POST() {
  return NextResponse.json({ error: "Users are managed by Clerk." }, { status: 405 });
}
