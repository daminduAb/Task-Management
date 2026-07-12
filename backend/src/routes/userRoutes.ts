import { Router } from "express";
import { getAllUsers, updateUserRole, deleteUser } from "../controllers/userController";
import requireAuth from "../middleware/auth";
import requireRole from "../middleware/role";

const router = Router();

router.use(requireAuth, requireRole(["ADMIN"]));

router.get("/", getAllUsers);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
