import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
};

let cachedSecret: Uint8Array | null = null;

const getSecretEncoder = () => {
  if (!cachedSecret) {
    cachedSecret = getSecret();
  }
  return cachedSecret;
};

export interface JWTPayload {
  userId: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const plainPayload = JSON.parse(JSON.stringify(payload));
  return new SignJWT(plainPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(getSecretEncoder());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretEncoder());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
