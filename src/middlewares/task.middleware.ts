import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const canUpdateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  const taskId = req.params.id as string;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      organizationId: user.organizationId
    }
  });

  if (!task) {
    return res.status(404).json({
      status: 404,
      code: "NOT_FOUND",
      message: "task not found"
    });
  }

  if (
    user.role === "ADMIN" ||
    user.role === "MANAGER" ||
    task.assigneeId === user.userId
  ) {
    return next();
  }

  return res.status(403).json({
    status: 403,
    code: "FORBIDDEN",
    message: "You cannot update this task status"
  });
};