"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjects = listProjects;
exports.getProject = getProject;
exports.createProject = createProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.addMember = addMember;
const db_1 = require("../utils/db");
const client_1 = require("@prisma/client");
async function listProjects(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const projects = await db_1.prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: req.user.id },
                    { members: { some: { userId: req.user.id } } },
                ],
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarUrl: true },
                        },
                    },
                },
                _count: {
                    select: { tasks: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ projects });
    }
    catch (error) {
        console.error("ListProjects error:", error);
        res.status(500).json({ message: "Internal server error retrieving projects" });
    }
}
async function getProject(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const id = req.params.id;
        const project = await db_1.prisma.project.findUnique({
            where: { id },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatarUrl: true },
                        },
                    },
                },
                tasks: {
                    include: {
                        assignee: {
                            select: { id: true, name: true, email: true, avatarUrl: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Verify membership
        const isOwner = project.ownerId === req.user.id;
        const isMember = project.members.some((m) => m.userId === req.user?.id);
        if (!isOwner && !isMember) {
            res.status(403).json({ message: "Forbidden: You do not have access to this project" });
            return;
        }
        res.status(200).json({ project });
    }
    catch (error) {
        console.error("GetProject error:", error);
        res.status(500).json({ message: "Internal server error retrieving project details" });
    }
}
async function createProject(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { name, description } = req.body;
        // Use transaction to create project and add owner as member
        const project = await db_1.prisma.$transaction(async (tx) => {
            const p = await tx.project.create({
                data: {
                    name,
                    description,
                    ownerId: req.user.id,
                },
            });
            await tx.projectMember.create({
                data: {
                    projectId: p.id,
                    userId: req.user.id,
                    role: client_1.Role.OWNER,
                },
            });
            await tx.activityLog.create({
                data: {
                    action: "PROJECT_CREATED",
                    details: `${req.user.name} created the project "${name}".`,
                    userId: req.user.id,
                    projectId: p.id,
                },
            });
            return p;
        });
        res.status(201).json({ project });
    }
    catch (error) {
        console.error("CreateProject error:", error);
        res.status(500).json({ message: "Internal server error creating project" });
    }
}
async function updateProject(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const id = req.params.id;
        const { name, description } = req.body;
        const project = await db_1.prisma.project.findUnique({
            where: { id },
            include: { members: true },
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Check authorization (only owners can modify project settings)
        const isOwner = project.ownerId === req.user.id;
        const memberRecord = project.members.find((m) => m.userId === req.user?.id);
        const isOwnerRole = memberRecord?.role === client_1.Role.OWNER;
        if (!isOwner && !isOwnerRole) {
            res.status(403).json({ message: "Forbidden: Only project owners can edit project settings" });
            return;
        }
        const updatedProject = await db_1.prisma.project.update({
            where: { id },
            data: { name, description },
        });
        await db_1.prisma.activityLog.create({
            data: {
                action: "PROJECT_UPDATED",
                details: `${req.user.name} updated project general settings.`,
                userId: req.user.id,
                projectId: id,
            },
        });
        res.status(200).json({ project: updatedProject });
    }
    catch (error) {
        console.error("UpdateProject error:", error);
        res.status(500).json({ message: "Internal server error updating project" });
    }
}
async function deleteProject(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const id = req.params.id;
        const project = await db_1.prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Only actual owner can delete the project
        if (project.ownerId !== req.user.id) {
            res.status(403).json({ message: "Forbidden: Only the project creator can delete this project" });
            return;
        }
        await db_1.prisma.project.delete({
            where: { id },
        });
        res.status(200).json({ message: "Project deleted successfully" });
    }
    catch (error) {
        console.error("DeleteProject error:", error);
        res.status(500).json({ message: "Internal server error deleting project" });
    }
}
async function addMember(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const id = req.params.id; // Project ID
        const { email, role } = req.body;
        const project = await db_1.prisma.project.findUnique({
            where: { id },
            include: { members: true },
        });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        // Only project owners can add members
        const isOwner = project.ownerId === req.user.id;
        const memberRecord = project.members.find((m) => m.userId === req.user?.id);
        const isOwnerRole = memberRecord?.role === client_1.Role.OWNER;
        if (!isOwner && !isOwnerRole) {
            res.status(403).json({ message: "Forbidden: Only project owners can invite members" });
            return;
        }
        // Find the user to add by email
        const targetUser = await db_1.prisma.user.findUnique({
            where: { email },
        });
        if (!targetUser) {
            res.status(404).json({ message: `No user found with the email "${email}"` });
            return;
        }
        // Check if target user is already a member
        const existingMember = project.members.find((m) => m.userId === targetUser.id);
        if (existingMember) {
            res.status(400).json({ message: "This user is already a member of this project" });
            return;
        }
        // Add user as member
        await db_1.prisma.projectMember.create({
            data: {
                projectId: id,
                userId: targetUser.id,
                role: role,
            },
        });
        // Log activity
        await db_1.prisma.activityLog.create({
            data: {
                action: "MEMBER_ADDED",
                details: `${req.user.name} added ${targetUser.name} to the project as a ${role.toLowerCase()}.`,
                userId: req.user.id,
                projectId: id,
            },
        });
        res.status(200).json({
            message: "Member added successfully",
            member: {
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email,
                avatarUrl: targetUser.avatarUrl,
                role,
            },
        });
    }
    catch (error) {
        console.error("AddMember error:", error);
        res.status(500).json({ message: "Internal server error adding project member" });
    }
}
