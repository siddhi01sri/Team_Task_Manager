import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response) => {
  return res.status(404).json({
    status: 404,
    code: "ROUTE_NOT_FOUND",
    message: "Route not found"
  });
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(err.status || 500).json({
    status: err.status || 500,
    code: err.code || "SERVER_ERROR",
    message: err.message || "Something went wrong"
  });
};