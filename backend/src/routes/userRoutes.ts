import { Router } from "express";
import { getAllUsers, getBasicUserList, updateUserRole, deleteUser } from "../controllers/userController";
import requireAuth from "../middleware/auth";
import requireRole from "../middleware/role";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/basic", requireRole(["ADMIN", "PM"]), asyncHandler(getBasicUserList));
router.get("/", requireRole(["ADMIN"]), asyncHandler(getAllUsers));
router.put("/:id/role", requireRole(["ADMIN"]), asyncHandler(updateUserRole));
router.delete("/:id", requireRole(["ADMIN"]), asyncHandler(deleteUser));

export default router;