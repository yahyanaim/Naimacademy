import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const payload = token ? await verifyToken(token) : null;

  // Unauthenticated users are redirected to /login for all protected paths
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only paths: require "admin" role
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/course/lesson/:path*",
    "/exam/:path*",
    "/certificate",
    "/admin/:path*",
  ],
};
