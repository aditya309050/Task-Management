"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listComments = listComments;
exports.createComment = createComment;
exports.deleteComment = deleteComment;
const db_1 = require("../utils/db");
async function listComments(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const taskId = req.params.taskId;
        const task = await db_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: { include: { members: true } },
            },
        });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        // Verify access
        const isOwner = task.project.ownerId === req.user.id;
        const isMember = task.project.members.some((m) => m.userId === req.user?.id);
        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden: You cannot view comments on this task" });
            return;
        }
        const comments = await db_1.prisma.comment.findMany({
            where: { taskId },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
            orderBy: { createdAt: "asc" },
        });
        res.status(200).json({ comments });
    }
    catch (error) {
        console.error("ListComments error:", error);
        res.status(500).json({ message: "Internal server error retrieving comments" });
    }
}
async function createComment(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const taskId = req.params.taskId;
        const { content } = req.body;
        const task = await db_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: { include: { members: true } },
            },
        });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        // Verify access
        const isOwner = task.project.ownerId === req.user.id;
        const isMember = task.project.members.some((m) => m.userId === req.user?.id);
        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden: You cannot add comments to this task" });
            return;
        }
        const comment = await db_1.prisma.comment.create({
            data: {
                content,
                taskId,
                userId: req.user.id,
            },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });
        res.status(201).json({ comment });
    }
    catch (error) {
        console.error("CreateComment error:", error);
        res.status(500).json({ message: "Internal server error creating comment" });
    }
}
async function deleteComment(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const id = req.params.id;
        const comment = await db_1.prisma.comment.findUnique({
            where: { id },
            include: {
                task: {
                    include: {
                        project: true,
                    },
                },
            },
        });
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        // Check if current user is the comment author OR the project owner
        const isCommentAuthor = comment.userId === req.user.id;
        const isProjectOwner = comment.task.project.ownerId === req.user.id;
        if (!isCommentAuthor && !isProjectOwner) {
            res.status(403).json({ message: "Forbidden: Only the author or project owner can delete this comment" });
            return;
        }
        await db_1.prisma.comment.delete({
            where: { id },
        });
        res.status(200).json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        console.error("DeleteComment error:", error);
        res.status(500).json({ message: "Internal server error deleting comment" });
    }
}
