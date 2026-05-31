import { Request, Response, NextFunction } from "express";
import {
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser
} from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await refreshUserToken(req.body.refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await logoutUser(req.body.refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
