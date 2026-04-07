import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";
import { SESSION } from "@/lib/constants";

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

type RouteHandler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>>; user: JWTPayload }
) => Promise<NextResponse>;

type AdminRouteHandler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>>; user: JWTPayload }
) => Promise<NextResponse>;

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

export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    const token = req.cookies.get(SESSION.COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return handler(req, { ...ctx, user: payload });
  };
}

export function withAdmin(handler: AdminRouteHandler) {
  return async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    const token = req.cookies.get(SESSION.COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowedIps = process.env.ALLOWED_ADMIN_IPS?.split(",").map(ip => ip.trim()) || [];
    if (allowedIps.length > 0) {
      const clientIp = getClientIp(req);
      if (!isIpAllowed(clientIp, allowedIps)) {
        return NextResponse.json({ error: "Access denied from this IP address" }, { status: 403 });
      }
    }

    return handler(req, { ...ctx, user: payload });
  };
}
