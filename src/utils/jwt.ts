import jwt from "jsonwebtoken";
import crypto from "crypto";

export const createAccessToken = (user: any) => {
  return jwt.sign(
    {
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET || "access_secret",
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" } as any
  );
};

export const createRefreshToken = (user: any) => {
  return jwt.sign(
    {
      userId: user.id
    },
    process.env.JWT_REFRESH_SECRET || "refresh_secret",
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" } as any
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || "access_secret");
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refresh_secret");
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};