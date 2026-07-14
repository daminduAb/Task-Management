import { Router } from "express";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "../controllers/projectController";
import { getTasksForProject, createTask } from "../controllers/taskController";
import requireAuth from "../middleware/auth";
import requireRole from "../middleware/role";
import { validateBody, schemas } from "../utils/validate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(getProjects));
router.post("/", requireRole(["ADMIN", "PM"]), validateBody(schemas.createProject), asyncHandler(createProject));
router.get("/:id", asyncHandler(getProjectById));
router.put("/:id", requireRole(["ADMIN", "PM"]), asyncHandler(updateProject));
router.delete("/:id", requireRole(["ADMIN", "PM"]), asyncHandler(deleteProject));
router.post("/:id/members", requireRole(["ADMIN", "PM"]), validateBody(schemas.addMember), asyncHandler(addMember));
router.delete("/:id/members/:userId", requireRole(["ADMIN", "PM"]), asyncHandler(removeMember));
router.get("/:projectId/tasks", asyncHandler(getTasksForProject));
router.post("/:projectId/tasks", requireRole(["ADMIN", "PM"]), validateBody(schemas.createTask), asyncHandler(createTask));

export default router;
