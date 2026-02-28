import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/admin-auth";
import { hasRole } from "@/lib/auth/rbac";

const adminerBaseUrl =
  process.env.ADMINER_INTERNAL_URL ??
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:33808" : "http://adminer:8080");

function buildTargetUrl(request: NextRequest, adminerPath?: string[]) {
  const path = adminerPath?.length ? `/${adminerPath.join("/")}` : "/";
  const baseUrl = adminerBaseUrl.endsWith("/") ? adminerBaseUrl : `${adminerBaseUrl}/`;
  const target = new URL(path, baseUrl);
  target.search = request.nextUrl.search;
  return target;
}

function rewriteLocationHeader(location: string | null) {
  if (!location) return null;

  try {
    const resolved = new URL(location, adminerBaseUrl);
    if (resolved.origin !== new URL(adminerBaseUrl).origin) return location;
    const path = resolved.pathname === "/" ? "/adminer/" : `/adminer${resolved.pathname}`;
    return `${path}${resolved.search}`;
  } catch {
    return location;
  }
}

async function proxyToAdminer(
  request: NextRequest,
  context: { params: Promise<{ adminerPath?: string[] }> },
) {
  const user = await getSessionUser();
  if (!hasRole(user, "admin")) {
    return NextResponse.redirect(new URL("/not-authorized", request.url));
  }

  const { adminerPath } = await context.params;
  const targetUrl = buildTargetUrl(request, adminerPath);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  const location = rewriteLocationHeader(responseHeaders.get("location"));
  if (location) {
    responseHeaders.set("location", location);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ adminerPath?: string[] }> },
) {
  return proxyToAdminer(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ adminerPath?: string[] }> },
) {
  return proxyToAdminer(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ adminerPath?: string[] }> },
) {
  return proxyToAdminer(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ adminerPath?: string[] }> },
) {
  return proxyToAdminer(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ adminerPath?: string[] }> },
) {
  return proxyToAdminer(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ adminerPath?: string[] }> },
) {
  return proxyToAdminer(request, context);
}
