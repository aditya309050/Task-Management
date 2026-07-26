import "dotenv/config";
import { PrismaClient, Role, TaskStatus, TaskPriority } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // Clean the database
  console.log("Cleaning database tables...");
  await prisma.comment.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const hashedPassword = await bcrypt.hash("Password123", 10);

  // Create Users
  console.log("Creating users...");
  const john = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: hashedPassword,
      name: "John Doe",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: "jane.smith@example.com",
      password: hashedPassword,
      name: "Jane Smith",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150",
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150",
    },
  });

  // Create Projects
  console.log("Creating projects...");
  const project1 = await prisma.project.create({
    data: {
      name: "Task Management App",
      description: "Development of a collaborative full-stack task management application with React & Express.",
      ownerId: john.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Marketing Campaign Q3",
      description: "Planning and execution of the Q3 product launch marketing campaign.",
      ownerId: jane.id,
    },
  });

  // Add Members to Projects
  console.log("Adding project members...");
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: john.id, role: Role.OWNER },
      { projectId: project1.id, userId: jane.id, role: Role.MEMBER },
      { projectId: project1.id, userId: admin.id, role: Role.MEMBER },
      
      { projectId: project2.id, userId: jane.id, role: Role.OWNER },
      { projectId: project2.id, userId: john.id, role: Role.MEMBER },
    ],
  });

  // Create Tasks for Project 1
  console.log("Creating tasks...");
  const task1 = await prisma.task.create({
    data: {
      title: "Database Design",
      description: "Draft entity relationship diagram and configure Prisma PostgreSQL schemas.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2), // 2 days ago
      projectId: project1.id,
      assigneeId: john.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "API Backend Implementation",
      description: "Develop REST APIs with Express, JWT authentication, and Zod validations.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2), // 2 days from now
      projectId: project1.id,
      assigneeId: john.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "React Dashboard UI Setup",
      description: "Set up Tailwind CSS, Recharts for statistics, and integrate React Query for state management.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5), // 5 days from now
      projectId: project1.id,
      assigneeId: jane.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: "Security & JWT Validation Audit",
      description: "Perform code audit to check for XSS, SQL injection, and verify JWT token expirations.",
      status: TaskStatus.REVIEW,
      priority: TaskPriority.URGENT,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000 * 4), // 4 days from now
      projectId: project1.id,
      assigneeId: admin.id,
    },
  });

  // Create Comments on Task 2
  console.log("Creating comments...");
  await prisma.comment.createMany({
    data: [
      {
        content: "Let's make sure we use Zod schemas for all request validations.",
        taskId: task2.id,
        userId: jane.id,
        createdAt: new Date(Date.now() - 60 * 60 * 1000 * 3), // 3 hours ago
      },
      {
        content: "Already working on that! Defining schemas for auth, projects, and tasks today.",
        taskId: task2.id,
        userId: john.id,
        createdAt: new Date(Date.now() - 60 * 60 * 1000 * 2), // 2 hours ago
      },
    ],
  });

  // Create Activity Logs
  console.log("Creating activity logs...");
  await prisma.activityLog.createMany({
    data: [
      {
        action: "PROJECT_CREATED",
        details: "John Doe created the project.",
        userId: john.id,
        projectId: project1.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3),
      },
      {
        action: "MEMBER_ADDED",
        details: "Jane Smith was added as a member.",
        userId: john.id,
        projectId: project1.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2.8),
      },
      {
        action: "TASK_CREATED",
        details: "Task 'Database Design' was created and assigned to John Doe.",
        userId: john.id,
        projectId: project1.id,
        taskId: task1.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2),
      },
      {
        action: "TASK_CREATED",
        details: "Task 'API Backend Implementation' was created and assigned to John Doe.",
        userId: john.id,
        projectId: project1.id,
        taskId: task2.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 1.5),
      },
      {
        action: "STATUS_UPDATED",
        details: "Task 'Database Design' status was changed to DONE.",
        userId: john.id,
        projectId: project1.id,
        taskId: task1.id,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 0.5),
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
