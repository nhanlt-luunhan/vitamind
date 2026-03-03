import { NextResponse } from "next/server";
import {
  drainClerkDeletionQueue,
  syncAllClerkUsers,
  syncClerkUserById,
} from "@/lib/auth/clerk-sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing internal secret" }, { status: 500 });
  }

  const headerSecret = request.headers.get("x-internal-secret");
  if (headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const clerkUserId = String(body?.clerkUserId ?? "").trim();

  try {
    await drainClerkDeletionQueue();

    if (clerkUserId) {
      const user = await syncClerkUserById(clerkUserId);
      return NextResponse.json({
        ok: true,
        mode: "single",
        user,
      });
    }

    const result = await syncAllClerkUsers();
    return NextResponse.json({
      ok: true,
      mode: "all",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể đồng bộ Clerk.",
      },
      { status: 500 },
    );
  }
}
