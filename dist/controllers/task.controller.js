"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTasks = listTasks;
exports.getTask = getTask;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const db_1 = require("../utils/db");
const client_1 = require("@prisma/client");
async function listTasks(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const projectId = req.query.projectId;
        const status = req.query.status;
        const priority = req.query.priority;
        const search = req.query.search;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Security clause: Ensure tasks returned are only from projects user has access to
        const accessibleProjectsClause = {
            OR: [
                { ownerId: req.user.id },
                { members: { some: { userId: req.user.id } } },
            ],
        };
        const where = {
            project: accessibleProjectsClause,
        };
        if (projectId) {
            where.projectId = projectId;
        }
        if (status) {
            where.status = status;
        }
        if (priority) {
            where.priority = priority;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        const [tasks, total] = await db_1.prisma.$transaction([
            db_1.prisma.task.findMany({
                where,
                skip,
                take: limit,
                include: {
                    project: { select: { id: true, name: true } },
                    assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            db_1.prisma.task.count({ where }),
        ]);
        res.status(200).json({
            tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("ListTasks error:", error);
        res.status(500).json({ message: "Internal server error retrieving tasks" });
    }
}
async function getTask(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const id = req.params.id;
        const task = await db_1.prisma.task.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        members: true,
                    },
                },
                assignee: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
        });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        // Verify project access
        const isOwner = task.project.ownerId === req.user.id;
        const isMember = task.project.members.some((m) => m.userId === req.user?.id);
        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden: You do not have access to this project's tasks" });
            return;
        }
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("GetTask error:", error);
        res.status(500).json({ message: "Internal server error retrieving task details" });
    }
}
async function createTask(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;
        // Check project permission
        const project = await db_1.prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
        });
        if (!project) {
            res.status(404).json({ message: "Associated project not found" });
            return;
        }
        const isOwner = project.ownerId === req.user.id;
        const isMember = project.members.some((m) => m.userId === req.user?.id);
        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden: You cannot create tasks in this project" });
            return;
        }
        // Verify assignee belongs to the project
        if (assigneeId) {
            const isAssigneeOwner = project.ownerId === assigneeId;
            const isAssigneeMember = project.members.some((m) => m.userId === assigneeId);
            if (!isAssigneeOwner && !isAssigneeMember) {
                res.status(400).json({ message: "Assignee is not a member of this project" });
                return;
            }
        }
        const parsedDueDate = dueDate ? new Date(dueDate) : null;
        const task = await db_1.prisma.task.create({
            data: {
                title,
                description,
                status: status || client_1.TaskStatus.TODO,
                priority: priority || client_1.TaskPriority.MEDIUM,
                dueDate: parsedDueDate,
                projectId,
                assigneeId: assigneeId || null,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });
        // Log Activity
        let activityDetails = `${req.user.name} created task "${title}".`;
        if (assigneeId) {
            const assigneeUser = await db_1.prisma.user.findUnique({ where: { id: assigneeId } });
            if (assigneeUser) {
                activityDetails = `${req.user.name} created task "${title}" and assigned it to ${assigneeUser.name}.`;
            }
        }
        await db_1.prisma.activityLog.create({
            data: {
                action: "TASK_CREATED",
                details: activityDetails,
                userId: req.user.id,
                projectId,
                taskId: task.id,
            },
        });
        res.status(201).json({ task });
    }
    catch (error) {
        console.error("CreateTask error:", error);
        res.status(500).json({ message: "Internal server error creating task" });
    }
}
async function updateTask(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const id = req.params.id;
        const { title, description, status, priority, dueDate, assigneeId } = req.body;
        const task = await db_1.prisma.task.findUnique({
            where: { id },
            include: {
                project: { include: { members: true } },
            },
        });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        // Verify project permissions
        const isOwner = task.project.ownerId === req.user.id;
        const isMember = task.project.members.some((m) => m.userId === req.user?.id);
        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden: You cannot modify tasks in this project" });
            return;
        }
        // Verify assignee is part of project
        if (assigneeId) {
            const isAssigneeOwner = task.project.ownerId === assigneeId;
            const isAssigneeMember = task.project.members.some((m) => m.userId === assigneeId);
            if (!isAssigneeOwner && !isAssigneeMember) {
                res.status(400).json({ message: "Assignee is not a member of this project" });
                return;
            }
        }
        const parsedDueDate = dueDate === null ? null : dueDate ? new Date(dueDate) : undefined;
        // Track status/assignee updates to log custom activities
        const statusChanged = status && status !== task.status;
        const assigneeChanged = assigneeId !== undefined && assigneeId !== task.assigneeId;
        const updatedTask = await db_1.prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                status: status,
                priority: priority,
                dueDate: parsedDueDate,
                assigneeId: assigneeId === null ? null : assigneeId,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });
        // Create logs if status or assignee changed
        if (statusChanged) {
            await db_1.prisma.activityLog.create({
                data: {
                    action: "STATUS_UPDATED",
                    details: `${req.user.name} moved task "${updatedTask.title}" from ${task.status} to ${updatedTask.status}.`,
                    userId: req.user.id,
                    projectId: task.projectId,
                    taskId: task.id,
                },
            });
        }
        if (assigneeChanged) {
            let logMsg = "";
            if (updatedTask.assigneeId) {
                logMsg = `${req.user.name} assigned task "${updatedTask.title}" to ${updatedTask.assignee?.name}.`;
            }
            else {
                logMsg = `${req.user.name} unassigned task "${updatedTask.title}".`;
            }
            await db_1.prisma.activityLog.create({
                data: {
                    action: "ASSIGNEE_CHANGED",
                    details: logMsg,
                    userId: req.user.id,
                    projectId: task.projectId,
                    taskId: task.id,
                },
            });
        }
        // General log if no status/assignee changed but title/desc updated
        if (!statusChanged && !assigneeChanged) {
            await db_1.prisma.activityLog.create({
                data: {
                    action: "TASK_UPDATED",
                    details: `${req.user.name} updated details of task "${updatedTask.title}".`,
                    userId: req.user.id,
                    projectId: task.projectId,
                    taskId: task.id,
                },
            });
        }
        res.status(200).json({ task: updatedTask });
    }
    catch (error) {
        console.error("UpdateTask error:", error);
        res.status(500).json({ message: "Internal server error updating task" });
    }
}
async function deleteTask(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const id = req.params.id;
        const task = await db_1.prisma.task.findUnique({
            where: { id },
            include: {
                project: { include: { members: true } },
            },
        });
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        // Verify project permissions
        const isOwner = task.project.ownerId === req.user.id;
        const isMember = task.project.members.some((m) => m.userId === req.user?.id);
        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden: You cannot delete tasks in this project" });
            return;
        }
        await db_1.prisma.$transaction(async (tx) => {
            await tx.activityLog.create({
                data: {
                    action: "TASK_DELETED",
                    details: `${req.user.name} deleted task "${task.title}".`,
                    userId: req.user.id,
                    projectId: task.projectId,
                },
            });
            await tx.task.delete({
                where: { id },
            });
        });
        res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        console.error("DeleteTask error:", error);
        res.status(500).json({ message: "Internal server error deleting task" });
    }
}
