import { Request, Response, NextFunction } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser
} from "../services/user.service";

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await createUser(req.body, (req as any).user);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getUsers((req as any).user);
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.params.id as string, (req as any).user);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await updateUser(req.params.id as string, req.body, (req as any).user);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteUser(req.params.id as string, (req as any).user);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};