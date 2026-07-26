import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/utils/db";

describe("Projects & Tasks REST API Endpoints", () => {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const testUser = {
    name: "Task Tester",
    email: `tester-${randomSuffix}@example.com`,
    password: "Password123",
  };

  let token = "";
  let projectId = "";
  let taskId = "";

  beforeAll(async () => {
    // Signup user and store token
    const res = await request(app)
      .post("/api/auth/signup")
      .send(testUser);
    token = res.body.token;
  });

  afterAll(async () => {
    // Cleanup database
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  it("should successfully create a new project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Projects Board",
        description: "A sandbox project to run backend integration tests.",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("project");
    expect(res.body.project.name).toBe("Test Projects Board");
    projectId = res.body.project.id;
  });

  it("should list projects for authenticated user", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("projects");
    expect(Array.isArray(res.body.projects)).toBe(true);
    expect(res.body.projects.length).toBeGreaterThanOrEqual(1);
    expect(res.body.projects.some((p: any) => p.id === projectId)).toBe(true);
  });

  it("should successfully create a task under the project", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Integration Testing Tasks",
        description: "Write automated tests for routes and check status.",
        status: "TODO",
        priority: "HIGH",
        projectId,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("task");
    expect(res.body.task.title).toBe("Integration Testing Tasks");
    expect(res.body.task.status).toBe("TODO");
    taskId = res.body.task.id;
  });

  it("should list and search tasks under project", async () => {
    const res = await request(app)
      .get(`/api/tasks?projectId=${projectId}&search=Integration`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("tasks");
    expect(res.body.tasks.length).toBe(1);
    expect(res.body.tasks[0].id).toBe(taskId);
  });

  it("should update a task's status", async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "IN_PROGRESS",
      });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe("IN_PROGRESS");
  });

  it("should delete a task", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    // Verify task is gone
    const verifyRes = await prisma.task.findUnique({
      where: { id: taskId },
    });
    expect(verifyRes).toBeNull();
  });

  it("should delete a project", async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    // Verify project is gone
    const verifyRes = await prisma.project.findUnique({
      where: { id: projectId },
    });
    expect(verifyRes).toBeNull();
  });
});
