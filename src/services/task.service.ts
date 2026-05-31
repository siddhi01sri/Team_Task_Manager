import prisma from "../config/prisma";
import redisClient from "../config/redis";
import { canMoveTaskStatus } from "../utils/taskStatus";

const createError = (status: number, code: string, message: string) => {
  return { status, code, message };
};

const priorities = ["LOW", "MEDIUM", "HIGH"];
const statuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"];

const taskCachePattern = (organizationId: string) => {
  return `tasks:org:${organizationId}:*`;
};

const clearTaskCache = async (organizationId: string) => {
  if (!redisClient.isOpen) return;

  const keys = await redisClient.keys(taskCachePattern(organizationId));

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

export const createTask = async (data: any, currentUser: any) => {
  const { title, description, priority, projectId, assigneeId, dueDate } = data;

  if (!title || !projectId || !assigneeId) {
    throw createError(400, "VALIDATION_ERROR", "title, projectId and assigneeId are required");
  }

  if (priority && !priorities.includes(priority)) {
    throw createError(400, "VALIDATION_ERROR", "priority must be LOW, MEDIUM or HIGH");
  }

  if (dueDate && new Date(dueDate) <= new Date()) {
    throw createError(400, "VALIDATION_ERROR", "dueDate must be a future date");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId: currentUser.organizationId
    }
  });

  if (!project) {
    throw createError(404, "NOT_FOUND", "project not found");
  }

  const assignee = await prisma.user.findFirst({
    where: {
      id: assigneeId,
      organizationId: currentUser.organizationId
    }
  });

  if (!assignee) {
    throw createError(404, "NOT_FOUND", "assignee not found");
  }

  const task = await prisma.task.create({
    data: {
      organizationId: currentUser.organizationId,
      projectId,
      assigneeId,
      createdById: currentUser.userId,
      title,
      description,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null
    }
  });

  await clearTaskCache(currentUser.organizationId);

  return task;
};

export const getTasks = async (query: any, currentUser: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    organizationId: currentUser.organizationId
  };

  if (currentUser.role === "MEMBER") {
    where.assigneeId = currentUser.userId;
  } else if (query.assigneeId) {
    where.assigneeId = query.assigneeId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.status && !statuses.includes(query.status)) {
    throw createError(400, "VALIDATION_ERROR", "invalid status filter");
  }

  if (query.priority && !priorities.includes(query.priority)) {
    throw createError(400, "VALIDATION_ERROR", "invalid priority filter");
  }

  const shouldUseCache = Boolean(where.assigneeId);

  const cacheKey = `tasks:org:${currentUser.organizationId}:assignee:${where.assigneeId || "all"}:page:${page}:limit:${limit}:status:${query.status || "all"}:priority:${query.priority || "all"}`;

  if (shouldUseCache && redisClient.isOpen) {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData as string);
    }
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    prisma.task.count({ where })
  ]);

  const result = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    tasks
  };

  if (shouldUseCache && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
  }

  return result;
};

export const getTaskById = async (id: string, currentUser: any) => {
  const where: any = {
    id,
    organizationId: currentUser.organizationId
  };

  if (currentUser.role === "MEMBER") {
    where.assigneeId = currentUser.userId;
  }

  const task = await prisma.task.findFirst({
    where,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      project: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!task) {
    throw createError(404, "NOT_FOUND", "task not found");
  }

  return task;
};

export const updateTask = async (id: string, data: any, currentUser: any) => {
  const task = await prisma.task.findFirst({
    where: {
      id,
      organizationId: currentUser.organizationId
    }
  });

  if (!task) {
    throw createError(404, "NOT_FOUND", "task not found");
  }

  if (data.priority && !priorities.includes(data.priority)) {
    throw createError(400, "VALIDATION_ERROR", "priority must be LOW, MEDIUM or HIGH");
  }

  if (data.dueDate && new Date(data.dueDate) <= new Date()) {
    throw createError(400, "VALIDATION_ERROR", "dueDate must be a future date");
  }

  if (data.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: data.assigneeId,
        organizationId: currentUser.organizationId
      }
    });

    if (!assignee) {
      throw createError(404, "NOT_FOUND", "assignee not found");
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority && { priority: data.priority }),
      ...(data.assigneeId && { assigneeId: data.assigneeId }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      })
    }
  });

  await clearTaskCache(currentUser.organizationId);

  return updatedTask;
};

export const deleteTask = async (id: string, currentUser: any) => {
  const task = await prisma.task.findFirst({
    where: {
      id,
      organizationId: currentUser.organizationId
    }
  });

  if (!task) {
    throw createError(404, "NOT_FOUND", "task not found");
  }

  await prisma.task.delete({
    where: { id }
  });

  await clearTaskCache(currentUser.organizationId);

  return {
    message: "task deleted successfully"
  };
};

export const updateTaskStatus = async (
  id: string,
  status: string,
  currentUser: any
) => {
  if (!status) {
    throw createError(400, "VALIDATION_ERROR", "status is required");
  }

  if (!statuses.includes(status)) {
    throw createError(400, "VALIDATION_ERROR", "invalid task status");
  }

  const task = await prisma.task.findFirst({
    where: {
      id,
      organizationId: currentUser.organizationId
    }
  });

  if (!task) {
    throw createError(404, "NOT_FOUND", "task not found");
  }

  if (!canMoveTaskStatus(task.status, status)) {
    throw createError(
      400,
      "VALIDATION_ERROR",
      `cannot move task from ${task.status} to ${status}`
    );
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : task.completedAt
    }
  });

  await clearTaskCache(currentUser.organizationId);

  return updatedTask;
};