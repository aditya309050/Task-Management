import { Router } from "express";
import { deleteComment } from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.delete("/:id", deleteComment);

export default router;
