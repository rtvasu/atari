import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

const enc = new TextEncoder();
export const ACCESS_TTL_SECONDS = 10 * 60;

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function accessSecret() {
  const s = process.env.ACCESS_TOKEN_SECRET;
  if (!s) throw new Error("Missing ACCESS_TOKEN_SECRET");
  return enc.encode(s);
}

export async function signAccessToken(payload: { sub: string; email: string }) {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS)
    .sign(accessSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret(), {
    algorithms: ["HS256"],
  });

  return payload;
}

