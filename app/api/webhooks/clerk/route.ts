import { NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/backend/webhooks";
import {
  drainClerkDeletionQueue,
  markClerkDeletionProcessed,
  upsertClerkUser,
} from "@/lib/auth/clerk-sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  let event: { type: string; data: any };
  try {
    event = await verifyWebhook(request);
  } catch (error) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  await drainClerkDeletionQueue().catch(() => null);

  if (event.type === "user.created" || event.type === "user.updated") {
    await upsertClerkUser(event.data);
  }

  if (event.type === "user.deleted") {
    await markClerkDeletionProcessed(event.data?.id);
  }

  return NextResponse.json({ ok: true });
}
