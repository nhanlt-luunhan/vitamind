import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "Use Clerk client upload (user.setProfileImage)." },
    { status: 405 },
  );
}
