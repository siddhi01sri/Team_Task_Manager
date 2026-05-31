import { Request, Response, NextFunction } from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} from "../services/project.service";

export const createProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await createProject(req.body, (req as any).user);
    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjectsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await getProjects((req as any).user);
    return res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await getProjectById(
      req.params.id as string,
      (req as any).user
    );

    return res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await updateProject(
      req.params.id as string,
      req.body,
      (req as any).user
    );

    return res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteProject(
      req.params.id as string,
      (req as any).user
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};