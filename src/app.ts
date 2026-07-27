import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import multer from "multer";

// Swagger
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger";

// Routers
import authRouter from "./routes/auth.routes";
import projectRouter from "./routes/project.routes";
import taskRouter from "./routes/task.routes";
import commentRouter from "./routes/comment.routes";
import activityRouter from "./routes/activity.routes";
import dashboardRouter from "./routes/dashboard.routes";
import userRouter from "./routes/user.routes";

const app = express();

// Security and Logging Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows browser to load static images from backend Cwd
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder for uploaded avatar photos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Swagger UI Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base status route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    message: "Task Management REST API is running successfully.",
    documentation: "/api-docs",
  });
});

// Mounting API Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/comments", commentRouter);
app.use("/api/activity", activityRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", userRouter);

// Global 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler (including multer and general server errors)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "File size exceeds the 2MB limit" });
      return;
    }
    res.status(400).json({ message: `File upload error: ${err.message}` });
    return;
  }
  
  if (err.message && err.message.includes("Only images")) {
    res.status(400).json({ message: err.message });
    return;
  }

  console.error("Unhandled exception: ", err);
  res.status(500).json({
    message: "Internal server error occurred on the API.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
