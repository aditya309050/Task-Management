"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
// Swagger
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./utils/swagger");
// Routers
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const activity_routes_1 = __importDefault(require("./routes/activity.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
// Security and Logging Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false, // Allows browser to load static images from backend Cwd
}));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static uploads folder for uploaded avatar photos
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Swagger UI Route
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Base status route
app.get("/", (_req, res) => {
    res.status(200).json({
        status: "healthy",
        message: "Task Management REST API is running successfully.",
        documentation: "/api-docs",
    });
});
// Mounting API Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/projects", project_routes_1.default);
app.use("/api/tasks", task_routes_1.default);
app.use("/api/comments", comment_routes_1.default);
app.use("/api/activity", activity_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/users", user_routes_1.default);
// Global 404 Route handler
app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});
// Global Error Handler (including multer and general server errors)
app.use((err, _req, res, _next) => {
    if (err instanceof multer_1.default.MulterError) {
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
exports.default = app;
