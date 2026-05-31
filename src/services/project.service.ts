import prisma from "../config/prisma";

const createError = (status: number, code: string, message: string) => {
  return { status, code, message };
};

export const createProject = async (data: any, currentUser: any) => {
  const { name, description } = data;

  if (!name) {
    throw createError(400, "VALIDATION_ERROR", "name is required");
  }

  return prisma.project.create({
    data: {
      organizationId: currentUser.organizationId,
      name,
      description
    }
  });
};

export const getProjects = async (currentUser: any) => {
  return prisma.project.findMany({
    where: {
      organizationId: currentUser.organizationId
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getProjectById = async (id: string, currentUser: any) => {
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId: currentUser.organizationId
    }
  });

  if (!project) {
    throw createError(404, "NOT_FOUND", "project not found");
  }

  return project;
};

export const updateProject = async (id: string, data: any, currentUser: any) => {
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId: currentUser.organizationId
    }
  });

  if (!project) {
    throw createError(404, "NOT_FOUND", "project not found");
  }

  return prisma.project.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description })
    }
  });
};

export const deleteProject = async (id: string, currentUser: any) => {
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId: currentUser.organizationId
    }
  });

  if (!project) {
    throw createError(404, "NOT_FOUND", "project not found");
  }

  await prisma.project.delete({
    where: { id }
  });

  return {
    message: "project deleted successfully"
  };
};