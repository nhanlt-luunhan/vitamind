import { NextResponse } from "next/server";
import {
  createGoogleOauthState,
  getGoogleAuthUrl,
  hasConfiguredGoogleOAuth,
} from "@/lib/auth/google-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasConfiguredGoogleOAuth()) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "sign-up" ? "sign-up" : "sign-in";
  const state = await createGoogleOauthState(mode);

  return NextResponse.redirect(getGoogleAuthUrl(mode, state));
}
