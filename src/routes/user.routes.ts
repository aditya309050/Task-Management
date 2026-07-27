import { Router } from "express";
import { updateProfile, uploadAvatar } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../utils/schemas";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticate);

router.put("/profile", validate(updateProfileSchema), updateProfile);
router.post("/avatar", upload.single("avatar"), uploadAvatar);

export default router;
