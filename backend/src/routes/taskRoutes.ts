import { Router } from "express";
import {
  getMyTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
  addComment,
  getComments,
} from "../controllers/taskController";
import requireAuth from "../middleware/auth";
import requireRole from "../middleware/role";
import { validateBody, schemas } from "../utils/validate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/my", getMyTasks);

router.get("/my", asyncHandler(getMyTasks));
router.put("/:id/status", validateBody(schemas.updateTaskStatus), asyncHandler(updateTaskStatus));
router.put("/:id", requireRole(["ADMIN", "PM"]), asyncHandler(updateTask));
router.delete("/:id", requireRole(["ADMIN", "PM"]), asyncHandler(deleteTask));
router.get("/:id/comments", asyncHandler(getComments));
router.post("/:id/comments", validateBody(schemas.addComment), asyncHandler(addComment));

export default router;
