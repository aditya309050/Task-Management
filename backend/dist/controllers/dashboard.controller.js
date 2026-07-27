"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = getStats;
const db_1 = require("../utils/db");
async function getStats(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Get all projects the user is involved in
        const userProjects = await db_1.prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: req.user.id },
                    { members: { some: { userId: req.user.id } } },
                ],
            },
            select: { id: true, name: true },
        });
        const projectIds = userProjects.map((p) => p.id);
        if (projectIds.length === 0) {
            res.status(200).json({
                totalProjects: 0,
                taskStats: { total: 0, TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 },
                priorityStats: { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 },
                overdueCount: 0,
                projectProgress: [],
                recentActivity: [],
            });
            return;
        }
        // Run parallel queries for tasks and activities
        const [tasks, recentLogs] = await Promise.all([
            db_1.prisma.task.findMany({
                where: { projectId: { in: projectIds } },
            }),
            db_1.prisma.activityLog.findMany({
                where: { projectId: { in: projectIds } },
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
        ]);
        // Aggregate stats in JavaScript (single pass is faster than separate database queries)
        const taskStats = {
            total: tasks.length,
            TODO: tasks.filter((t) => t.status === "TODO").length,
            IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
            REVIEW: tasks.filter((t) => t.status === "REVIEW").length,
            DONE: tasks.filter((t) => t.status === "DONE").length,
        };
        const priorityStats = {
            LOW: tasks.filter((t) => t.priority === "LOW").length,
            MEDIUM: tasks.filter((t) => t.priority === "MEDIUM").length,
            HIGH: tasks.filter((t) => t.priority === "HIGH").length,
            URGENT: tasks.filter((t) => t.priority === "URGENT").length,
        };
        const now = new Date();
        const overdueCount = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE").length;
        const projectProgress = userProjects.map((proj) => {
            const projTasks = tasks.filter((t) => t.projectId === proj.id);
            const total = projTasks.length;
            const completed = projTasks.filter((t) => t.status === "DONE").length;
            const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
                id: proj.id,
                name: proj.name,
                totalTasks: total,
                completedTasks: completed,
                progressPercentage,
            };
        });
        res.status(200).json({
            totalProjects: projectIds.length,
            taskStats,
            priorityStats,
            overdueCount,
            projectProgress,
            recentActivity: recentLogs,
        });
    }
    catch (error) {
        console.error("GetStats error:", error);
        res.status(500).json({ message: "Internal server error calculating dashboard statistics" });
    }
}
