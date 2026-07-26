import { Router } from "express";
import { signup, login, getMe, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../utils/schemas";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", authenticate, getMe);

export default router;
