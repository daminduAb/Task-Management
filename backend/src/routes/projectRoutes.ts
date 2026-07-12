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

const router = Router();

router.use(requireAuth);

router.get("/", getProjects);
router.post("/", requireRole(["ADMIN", "PM"]), validateBody(schemas.createProject), createProject);

router.get("/:id", getProjectById);
router.put("/:id", requireRole(["ADMIN", "PM"]), updateProject);
router.delete("/:id", requireRole(["ADMIN", "PM"]), deleteProject);

router.post("/:id/members", requireRole(["ADMIN", "PM"]), validateBody(schemas.addMember), addMember);
router.delete("/:id/members/:userId", requireRole(["ADMIN", "PM"]), removeMember);

router.get("/:projectId/tasks", getTasksForProject);
router.post("/:projectId/tasks", requireRole(["ADMIN", "PM"]), validateBody(schemas.createTask), createTask);

export default router;
