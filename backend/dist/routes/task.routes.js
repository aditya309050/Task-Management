"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../utils/schemas");
const router = (0, express_1.Router)();
// Protect all routes
router.use(auth_1.authenticate);
router.get("/", task_controller_1.listTasks);
router.get("/:id", task_controller_1.getTask);
router.post("/", (0, validate_1.validate)(schemas_1.createTaskSchema), task_controller_1.createTask);
router.put("/:id", (0, validate_1.validate)(schemas_1.updateTaskSchema), task_controller_1.updateTask);
router.delete("/:id", task_controller_1.deleteTask);
// Nested comment routes for clean task resource hierarchy
router.get("/:taskId/comments", comment_controller_1.listComments);
router.post("/:taskId/comments", (0, validate_1.validate)(schemas_1.createCommentSchema), comment_controller_1.createComment);
exports.default = router;
