"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectActivity = getProjectActivity;
const db_1 = require("../utils/db");
async function getProjectActivity(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const projectId = req.params.projectId;
        // Verify project visibility
        const project = await db_1.prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const isOwner = project.ownerId === req.user.id;
        const isMember = project.members.some((m) => m.userId === req.user?.id);
        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden: You cannot access activity logs for this project" });
            return;
        }
        const logs = await db_1.prisma.activityLog.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50, // Get last 50 updates
        });
        res.status(200).json({ logs });
    }
    catch (error) {
        console.error("GetProjectActivity error:", error);
        res.status(500).json({ message: "Internal server error retrieving project activity" });
    }
}
