import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/utils/db";

describe("Authentication API Endpoints", () => {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const testUser = {
    name: "Test Runner",
    email: `runner-${randomSuffix}@example.com`,
    password: "Password123",
  };

  let userToken = "";

  afterAll(async () => {
    // Clean up created test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  it("should fail to access protected routes without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should successfully signup a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user).not.toHaveProperty("password");

    userToken = res.body.token;
  });

  it("should fail to signup if email is already registered", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should successfully login with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should fail to login with incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword!",
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should retrieve logged-in user profile with valid JWT token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.name).toBe(testUser.name);
  });
});
