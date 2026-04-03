import { cookies } from "next/headers";
import { signToken, verifyToken, JWTPayload } from "./jwt";
import { SESSION } from "@/lib/constants";

export async function setSession(payload: JWTPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";
  
  cookieStore.set(SESSION.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SESSION.MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION.COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION.COOKIE_NAME);
}
