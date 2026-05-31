import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/rbac.middleware";
import { canUpdateTaskStatus } from "../middlewares/task.middleware";
import {
  createTaskController,
  deleteTaskController,
  getTaskByIdController,
  getTasksController,
  updateTaskController,
  updateTaskStatusController
} from "../controllers/task.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  createTaskController
);

router.get("/", authMiddleware, getTasksController);

router.get("/:id", authMiddleware, getTaskByIdController);

router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  updateTaskController
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  deleteTaskController
);

router.patch(
  "/:id/status",
  authMiddleware,
  canUpdateTaskStatus,
  updateTaskStatusController
);

export default router;