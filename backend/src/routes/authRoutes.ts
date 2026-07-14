import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import requireAuth from "../middleware/auth";
import { validateBody, schemas } from "../utils/validate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", validateBody(schemas.register), register);
router.post("/login", validateBody(schemas.login), login);
router.get("/me", requireAuth, asyncHandler(getMe));

export default router;
