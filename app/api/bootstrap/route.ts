import { NextResponse } from "next/server";
import {
  createBootstrapSessionCookieValue,
  getBootstrap,
} from "@/lib/auth/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  const bootstrap = await getBootstrap();
  if (!bootstrap) {
    return NextResponse.json({ bootstrap: null }, { status: 401 });
  }

  const response = NextResponse.json({ bootstrap });
  const sessionCookie = await createBootstrapSessionCookieValue();
  if (sessionCookie) {
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.options,
    );
  }

  return response;
}
