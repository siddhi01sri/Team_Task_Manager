import { Request, Response, NextFunction } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus
} from "../services/task.service";

export const createTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await createTask(req.body, (req as any).user);
    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasksController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = await getTasks(req.query, (req as any).user);
    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await getTaskById(req.params.id as string, (req as any).user);
    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await updateTask(
      req.params.id as string,
      req.body,
      (req as any).user
    );

    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteTask(req.params.id as string, (req as any).user);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await updateTaskStatus(
      req.params.id as string,
      req.body.status,
      (req as any).user
    );

    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};