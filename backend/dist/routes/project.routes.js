"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../utils/schemas");
const router = (0, express_1.Router)();
// Protect all routes
router.use(auth_1.authenticate);
router.get("/", project_controller_1.listProjects);
router.get("/:id", project_controller_1.getProject);
router.post("/", (0, validate_1.validate)(schemas_1.createProjectSchema), project_controller_1.createProject);
router.put("/:id", (0, validate_1.validate)(schemas_1.updateProjectSchema), project_controller_1.updateProject);
router.delete("/:id", project_controller_1.deleteProject);
router.post("/:id/members", (0, validate_1.validate)(schemas_1.addProjectMemberSchema), project_controller_1.addMember);
exports.default = router;
