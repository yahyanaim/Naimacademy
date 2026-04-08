import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const globalRateLimit = new Map<string, { count: number; resetTime: number }>();
const GLOBAL_RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60000;

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

function checkGlobalRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `global:${ip}`;
  const current = globalRateLimit.get(key);

  if (!current || now > current.resetTime) {
    globalRateLimit.set(key, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (current.count >= GLOBAL_RATE_LIMIT) {
    return false;
  }

  current.count += 1;
  globalRateLimit.set(key, current);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of globalRateLimit.entries()) {
    if (now > value.resetTime) {
      globalRateLimit.delete(key);
    }
  }
}, RATE_WINDOW_MS);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  if (pathname.startsWith("/api/")) {
    if (!checkGlobalRateLimit(ip)) {
      if (request.headers.get("accept")?.includes("application/json")) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  const token = request.cookies.get("auth-token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (pathname.startsWith("/admin")) {
    const allowedIps = process.env.ALLOWED_ADMIN_IPS?.split(",").map(ip => ip.trim()) || [];
    
    if (allowedIps.length > 0) {
      if (!isIpAllowed(ip, allowedIps)) {
        return NextResponse.redirect(new URL("/access-denied", request.url));
      }
    }

    if (!payload || payload.role !== "admin") {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  if (!payload && !pathname.startsWith("/api/")) {
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
