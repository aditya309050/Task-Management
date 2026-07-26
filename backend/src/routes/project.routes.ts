import { Router } from "express";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema } from "../utils/schemas";

const router = Router();

// Protect all routes
router.use(authenticate);

router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", validate(createProjectSchema), createProject);
router.put("/:id", validate(updateProjectSchema), updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/members", validate(addProjectMemberSchema), addMember);

export default router;
