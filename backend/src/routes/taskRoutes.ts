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

const router = Router();

router.use(requireAuth);

router.get("/my", getMyTasks);

router.put("/:id/status", validateBody(schemas.updateTaskStatus), updateTaskStatus);
router.put("/:id", requireRole(["ADMIN", "PM"]), updateTask);
router.delete("/:id", requireRole(["ADMIN", "PM"]), deleteTask);

router.get("/:id/comments", getComments);
router.post("/:id/comments", validateBody(schemas.addComment), addComment);

export default router;
