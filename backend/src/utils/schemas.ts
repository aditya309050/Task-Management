import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
    description: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Project name cannot be empty").max(100, "Project name must be less than 100 characters").optional(),
    description: z.string().optional(),
  }),
});

export const addProjectMemberSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    role: z.enum(["OWNER", "MEMBER", "VIEWER"], {
      message: "Role must be OWNER, MEMBER, or VIEWER",
    }),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title is required").max(100, "Task title must be less than 100 characters"),
    description: z.string().optional().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z
      .string()
      .datetime({ message: "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ssZ)" })
      .optional()
      .nullable(),
    projectId: z.string().uuid("Invalid project ID format"),
    assigneeId: z.string().uuid("Invalid assignee ID format").optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title cannot be empty").max(100, "Task title must be less than 100 characters").optional(),
    description: z.string().optional().nullable(),
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z
      .string()
      .datetime({ message: "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ssZ)" })
      .optional()
      .nullable(),
    assigneeId: z.string().uuid("Invalid assignee ID format").optional().nullable(),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Comment content cannot be empty"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .optional(),
  }),
});
