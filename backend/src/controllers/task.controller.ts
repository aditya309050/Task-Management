import { Request, Response } from "express";
import { prisma } from "../utils/db";
import { TaskStatus, TaskPriority } from "@prisma/client";

export async function listTasks(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const projectId = req.query.projectId as string | undefined;
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const search = req.query.search as string | undefined;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Security clause: Ensure tasks returned are only from projects user has access to
    const accessibleProjectsClause = {
      OR: [
        { ownerId: req.user.id },
        { members: { some: { userId: req.user.id } } },
      ],
    };

    const where: any = {
      project: accessibleProjectsClause,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status as TaskStatus;
    }

    if (priority) {
      where.priority = priority as TaskPriority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where }),
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
  } catch (error) {
    console.error("ListTasks error:", error);
    res.status(500).json({ message: "Internal server error retrieving tasks" });
  }
}

export async function getTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const task = await prisma.task.findUnique({
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
  } catch (error) {
    console.error("GetTask error:", error);
    res.status(500).json({ message: "Internal server error retrieving task details" });
  }
}

export async function createTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;

    // Check project permission
    const project = await prisma.project.findUnique({
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

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status as TaskStatus || TaskStatus.TODO,
        priority: priority as TaskPriority || TaskPriority.MEDIUM,
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
      const assigneeUser = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (assigneeUser) {
        activityDetails = `${req.user.name} created task "${title}" and assigned it to ${assigneeUser.name}.`;
      }
    }

    await prisma.activityLog.create({
      data: {
        action: "TASK_CREATED",
        details: activityDetails,
        userId: req.user.id,
        projectId,
        taskId: task.id,
      },
    });

    res.status(201).json({ task });
  } catch (error) {
    console.error("CreateTask error:", error);
    res.status(500).json({ message: "Internal server error creating task" });
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await prisma.task.findUnique({
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

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        dueDate: parsedDueDate,
        assigneeId: assigneeId === null ? null : assigneeId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    // Create logs if status or assignee changed
    if (statusChanged) {
      await prisma.activityLog.create({
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
      } else {
        logMsg = `${req.user.name} unassigned task "${updatedTask.title}".`;
      }

      await prisma.activityLog.create({
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
      await prisma.activityLog.create({
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
  } catch (error) {
    console.error("UpdateTask error:", error);
    res.status(500).json({ message: "Internal server error updating task" });
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const task = await prisma.task.findUnique({
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

    await prisma.$transaction(async (tx) => {
      await tx.activityLog.create({
        data: {
          action: "TASK_DELETED",
          details: `${req.user!.name} deleted task "${task.title}".`,
          userId: req.user!.id,
          projectId: task.projectId,
        },
      });

      await tx.task.delete({
        where: { id },
      });
    });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DeleteTask error:", error);
    res.status(500).json({ message: "Internal server error deleting task" });
  }
}
