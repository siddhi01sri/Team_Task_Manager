import { Request, Response, NextFunction } from "express";

export const allowRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        status: 403,
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource"
      });
    }

    next();
  };
};