"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.createCommentSchema = exports.updateTaskSchema = exports.createTaskSchema = exports.addProjectMemberSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
exports.signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, "Reset token is required"),
        password: zod_1.z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    }),
});
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Project name cannot be empty").max(100, "Project name must be less than 100 characters").optional(),
        description: zod_1.z.string().optional(),
    }),
});
exports.addProjectMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        role: zod_1.z.enum(["OWNER", "MEMBER", "VIEWER"], {
            message: "Role must be OWNER, MEMBER, or VIEWER",
        }),
    }),
});
exports.createTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Task title is required").max(100, "Task title must be less than 100 characters"),
        description: zod_1.z.string().optional().nullable(),
        status: zod_1.z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: zod_1.z
            .string()
            .datetime({ message: "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ssZ)" })
            .optional()
            .nullable(),
        projectId: zod_1.z.string().uuid("Invalid project ID format"),
        assigneeId: zod_1.z.string().uuid("Invalid assignee ID format").optional().nullable(),
    }),
});
exports.updateTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Task title cannot be empty").max(100, "Task title must be less than 100 characters").optional(),
        description: zod_1.z.string().optional().nullable(),
        status: zod_1.z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
        priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: zod_1.z
            .string()
            .datetime({ message: "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ssZ)" })
            .optional()
            .nullable(),
        assigneeId: zod_1.z.string().uuid("Invalid assignee ID format").optional().nullable(),
    }),
});
exports.createCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, "Comment content cannot be empty"),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
        email: zod_1.z.string().email("Invalid email format").optional(),
        password: zod_1.z
            .string()
            .min(6, "Password must be at least 6 characters")
            .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
            .optional(),
    }),
});
