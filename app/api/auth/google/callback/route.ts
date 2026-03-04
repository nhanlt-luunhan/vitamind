import { NextResponse } from "next/server";
import {
  createGoogleSessionResponse,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  hasConfiguredGoogleOAuth,
  upsertGoogleUser,
  verifyGoogleOauthState,
} from "@/lib/auth/google-oauth";

export const dynamic = "force-dynamic";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "http://localhost:3333"
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const baseUrl = getBaseUrl();
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const verifiedMode = await verifyGoogleOauthState(state);
  const fallbackMode = verifiedMode === "sign-up" ? "sign-up" : "sign-in";
  const fallbackPath = fallbackMode === "sign-up" ? "/sign-up" : "/sign-in";

  // FIX #1 & #4: Log chi tiết nguyên nhân thất bại thay vì im lặng
  if (!hasConfiguredGoogleOAuth() || error || !code || !verifiedMode) {
    const reason = !hasConfiguredGoogleOAuth()
      ? "oauth-not-configured"
      : error
        ? `google-error:${error}`
        : !code
          ? "missing-code"
          : "state-invalid";
    console.error("[google-callback] auth guard failed:", reason, {
      hasConfig: hasConfiguredGoogleOAuth(),
      googleError: error ?? null,
      hasCode: Boolean(code),
      stateValid: Boolean(verifiedMode),
    });
    return NextResponse.redirect(new URL(fallbackPath, baseUrl));
  }

  try {
    const accessToken = await exchangeGoogleCode(code);
    const profile = await fetchGoogleUserInfo(accessToken);
    const user = await upsertGoogleUser(profile);

    if (user.status && user.status !== "active") {
      console.warn("[google-callback] user not active:", {
        userId: user.id,
        status: user.status,
      });
      return NextResponse.redirect(new URL("/not-authorized", baseUrl));
    }

    const session = await createGoogleSessionResponse(user);
    console.log("[google-callback] login success:", {
      userId: user.id,
      role: user.role,
      destination: session.destination,
    });
    const response = NextResponse.redirect(new URL(session.destination, baseUrl));
    response.cookies.set(session.cookie.name, session.cookie.value, session.cookie.options);
    return response;
  } catch (err) {
    // FIX #4: Log lỗi thực sự thay vì nuốt im lặng
    console.error(
      "[google-callback] unhandled error:",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.redirect(new URL(fallbackPath, baseUrl));
  }
}
