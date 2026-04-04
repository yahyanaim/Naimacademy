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

    return handler(req, { ...ctx, user: payload });
  };
}
