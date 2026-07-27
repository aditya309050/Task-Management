import { Router } from "express";
import { getProjectActivity } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/project/:projectId", getProjectActivity);

export default router;
