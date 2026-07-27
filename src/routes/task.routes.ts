import { Router } from "express";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import { listComments, createComment } from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createTaskSchema, updateTaskSchema, createCommentSchema } from "../utils/schemas";

const router = Router();

// Protect all routes
router.use(authenticate);

router.get("/", listTasks);
router.get("/:id", getTask);
router.post("/", validate(createTaskSchema), createTask);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);

// Nested comment routes for clean task resource hierarchy
router.get("/:taskId/comments", listComments);
router.post("/:taskId/comments", validate(createCommentSchema), createComment);

export default router;
