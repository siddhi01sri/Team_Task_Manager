import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/rbac.middleware";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUsersController,
  updateUserController
} from "../controllers/user.controller";

const router = express.Router();

router.post("/", authMiddleware, allowRoles("ADMIN"), createUserController);
router.get("/", authMiddleware, allowRoles("ADMIN"), getUsersController);
router.get("/:id", authMiddleware, allowRoles("ADMIN"), getUserByIdController);
router.patch("/:id", authMiddleware, allowRoles("ADMIN"), updateUserController);
router.delete("/:id", authMiddleware, allowRoles("ADMIN"), deleteUserController);

export default router;