import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/rbac.middleware";
import {
  createProjectController,
  deleteProjectController,
  getProjectByIdController,
  getProjectsController,
  updateProjectController
} from "../controllers/project.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  createProjectController
);

router.get(
  "/",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  getProjectsController
);

router.get(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  getProjectByIdController
);

router.patch(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  updateProjectController
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  deleteProjectController
);

export default router;