import prisma from "../config/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken
} from "../utils/jwt";

const createError = (status: number, code: string, message: string) => {
  return { status, code, message };
};

const refreshExpiryDate = () => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};

export const registerUser = async (data: any) => {
  const { organizationName, name, email, password } = data;

  if (!organizationName || !name || !email || !password) {
    throw createError(400, "VALIDATION_ERROR", "organizationName, name, email and password are required");
  }

  if (password.length < 6) {
    throw createError(400, "VALIDATION_ERROR", "password must be at least 6 characters");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError(409, "CONFLICT", "email already exists");
  }

  const passwordHash = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: organizationName
      }
    });

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        name,
        email,
        passwordHash,
        role: "ADMIN"
      }
    });

    return { organization, user };
  });

  const accessToken = createAccessToken(result.user);
  const refreshToken = createRefreshToken(result.user);

  await prisma.refreshToken.create({
    data: {
      userId: result.user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate()
    }
  });

  return {
    user: {
      id: result.user.id,
      organizationId: result.user.organizationId,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role
    },
    accessToken,
    refreshToken
  };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  if (!email || !password) {
    throw createError(400, "VALIDATION_ERROR", "email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError(401, "UNAUTHORIZED", "invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createError(401, "UNAUTHORIZED", "invalid email or password");
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate()
    }
  });

  return {
    user: {
      id: user.id,
      organizationId: user.organizationId,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
};

export const refreshUserToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw createError(400, "VALIDATION_ERROR", "refreshToken is required");
  }

  const decoded: any = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const savedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash }
  });

  if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
    throw createError(401, "UNAUTHORIZED", "invalid refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user) {
    throw createError(401, "UNAUTHORIZED", "user not found");
  }

  await prisma.refreshToken.update({
    where: { id: savedToken.id },
    data: { revoked: true }
  });

  const newAccessToken = createAccessToken(user);
  const newRefreshToken = createRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: refreshExpiryDate()
    }
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

export const logoutUser = async (refreshToken: string) => {
  if (!refreshToken) {
    throw createError(400, "VALIDATION_ERROR", "refreshToken is required");
  }

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash: hashToken(refreshToken)
    },
    data: {
      revoked: true
    }
  });

  return {
    message: "logged out successfully"
  };
};