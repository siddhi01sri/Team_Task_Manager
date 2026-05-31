import prisma from "../config/prisma";
import { hashPassword } from "../utils/password";

const createError = (status: number, code: string, message: string) => {
  return { status, code, message };
};

const allowedRoles = ["ADMIN", "MANAGER", "MEMBER"];

export const createUser = async (data: any, loggedInUser: any) => {
  const { name, email, password, role } = data;

  if (!name || !email || !password || !role) {
    throw createError(400, "VALIDATION_ERROR", "name, email, password and role are required");
  }

  if (!allowedRoles.includes(role)) {
    throw createError(400, "VALIDATION_ERROR", "role must be ADMIN, MANAGER or MEMBER");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError(409, "CONFLICT", "email already exists");
  }

  const passwordHash = await hashPassword(password);

  return prisma.user.create({
    data: {
      organizationId: loggedInUser.organizationId,
      name,
      email,
      passwordHash,
      role
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

export const getUsers = async (loggedInUser: any) => {
  return prisma.user.findMany({
    where: {
      organizationId: loggedInUser.organizationId
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getUserById = async (id: string, loggedInUser: any) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      organizationId: loggedInUser.organizationId
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError(404, "NOT_FOUND", "user not found");
  }

  return user;
};

export const updateUser = async (id: string, data: any, loggedInUser: any) => {
  const { name, role } = data;

  if (role && !allowedRoles.includes(role)) {
    throw createError(400, "VALIDATION_ERROR", "role must be ADMIN, MANAGER or MEMBER");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      organizationId: loggedInUser.organizationId
    }
  });

  if (!existingUser) {
    throw createError(404, "NOT_FOUND", "user not found");
  }

  return prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(role && { role })
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

export const deleteUser = async (id: string, loggedInUser: any) => {
  if (id === loggedInUser.userId) {
    throw createError(400, "VALIDATION_ERROR", "admin cannot delete own account");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      organizationId: loggedInUser.organizationId
    }
  });

  if (!existingUser) {
    throw createError(404, "NOT_FOUND", "user not found");
  }

  await prisma.user.delete({
    where: { id }
  });

  return {
    message: "user deleted successfully"
  };
};