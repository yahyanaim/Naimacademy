import { NextRequest, NextResponse } from "next/server";

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
  return allowedIps.some(allowed => {
    if (allowed.includes("/")) {
      return false;
    }
    return allowed === ip || allowed === "*";
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const allowedIps = process.env.ALLOWED_ADMIN_IPS?.split(",").map(ip => ip.trim()) || [];
    
    if (allowedIps.length > 0) {
      const clientIp = getClientIp(req);
      
      if (!isIpAllowed(clientIp, allowedIps)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Access denied from this IP address" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/access-denied", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
