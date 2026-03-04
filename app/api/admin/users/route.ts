import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/rbac";
import { fetchDecoratedUsers } from "@/lib/access-control/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? "");
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.trunc(rawLimit), 200) : null;

  const { rows, error } = await fetchDecoratedUsers(limit);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({
    users: rows,
    meta: {
      synced: false,
      limit,
      polled_at: new Date().toISOString(),
    },
  });
}

export async function POST() {
  return NextResponse.json({ error: "User creation is not supported on this endpoint." }, { status: 405 });
}
