import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

function isIpAllowed(ip: string, allowedIps: string[]): boolean {
  if (allowedIps.length === 0) return true;
  return allowedIps.some(allowed => allowed === ip || allowed === "*");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const payload = token ? await verifyToken(token) : null;

  // Admin-only paths: check IP restriction first
  if (pathname.startsWith("/admin")) {
    const allowedIps = process.env.ALLOWED_ADMIN_IPS?.split(",").map(ip => ip.trim()) || [];
    
    if (allowedIps.length > 0) {
      const clientIp = getClientIp(request);
      if (!isIpAllowed(clientIp, allowedIps)) {
        return NextResponse.redirect(new URL("/access-denied", request.url));
      }
    }

    // Redirect non-admins
    if (!payload || payload.role !== "admin") {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Unauthenticated users are redirected to /login for all protected paths
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
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
