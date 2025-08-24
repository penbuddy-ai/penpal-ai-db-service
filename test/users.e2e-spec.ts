import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { ServiceAuthGuard } from "../src/common/guards/service-auth.guard";
import { UsersController } from "../src/modules/users/users.controller";
import { UserService } from "../src/modules/users/users.service";

describe("UsersController e2e (no DB)", () => {
  let app: INestApplication;
  let usersService: jest.Mocked<UserService>;

  const mockUser = {
    _id: "u1",
    email: "test@example.com",
    name: "Test",
  } as any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            findByEmail: jest.fn().mockResolvedValue(mockUser),
            getUserMetrics: jest.fn().mockResolvedValue({
              activeUsers: 1,
              totalUsers: 1,
              usersByLanguage: { en: 1 },
              averageUserLevel: { en: 2 },
            }),
            update: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn().mockResolvedValue(undefined),
            updateOnboardingProgress: jest.fn().mockResolvedValue(mockUser),
            completeOnboarding: jest.fn().mockResolvedValue(mockUser),
            getOnboardingStatus: jest
              .fn()
              .mockResolvedValue({ needsOnboarding: false }),
            create: jest.fn().mockResolvedValue(mockUser),
          },
        },
        { provide: Logger, useValue: new Logger("UsersControllerTest") },
        // Provide the guard used by the controller decorator as a permissive mock
        { provide: ServiceAuthGuard, useValue: { canActivate: () => true } },
        // Provide ConfigService stub in case anything else needs it
        { provide: ConfigService, useValue: { get: jest.fn(() => "") } },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    process.env.NODE_ENV = "test";
    await app.init();
    usersService = module.get(UserService) as jest.Mocked<UserService>;
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /users returns list", async () => {
    const res = await request(app.getHttpServer()).get("/users").expect(200);
    expect(res.body).toEqual([expect.objectContaining({ _id: "u1" })]);
    expect(usersService.findAll).toHaveBeenCalled();
  });

  it("GET /users/:id returns user", async () => {
    const res = await request(app.getHttpServer()).get("/users/u1").expect(200);
    expect(res.body._id).toBe("u1");
    expect(usersService.findOne).toHaveBeenCalledWith("u1");
  });

  it("GET /users/email/:email returns user by email", async () => {
    const res = await request(app.getHttpServer())
      .get("/users/email/test@example.com")
      .expect(200);
    expect(res.body.email).toBe("test@example.com");
    expect(usersService.findByEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("GET /users/metrics returns metrics", async () => {
    const res = await request(app.getHttpServer())
      .get("/users/metrics")
      .expect(200);
    expect(res.body.totalUsers).toBe(1);
    expect(usersService.getUserMetrics).toHaveBeenCalled();
  });

  it("POST /users creates a user", async () => {
    const payload = { email: "test@example.com", name: "Test" } as any;
    const res = await request(app.getHttpServer())
      .post("/users")
      .send(payload)
      .expect(201);
    expect(res.body._id).toBe("u1");
    expect(usersService.create).toHaveBeenCalledWith(payload);
  });

  it("PUT /users/:id updates a user", async () => {
    const res = await request(app.getHttpServer())
      .put("/users/u1")
      .send({ name: "Updated" })
      .expect(200);
    expect(res.body._id).toBe("u1");
    expect(usersService.update).toHaveBeenCalledWith("u1", { name: "Updated" });
  });

  it("PATCH /users/:id/onboarding/progress saves progress", async () => {
    const res = await request(app.getHttpServer())
      .patch("/users/u1/onboarding/progress")
      .send({ currentStep: "profile" })
      .expect(200);
    expect(res.body._id).toBe("u1");
    expect(usersService.updateOnboardingProgress).toHaveBeenCalledWith("u1", { currentStep: "profile" });
  });

  it("PATCH /users/:id/onboarding/complete completes onboarding", async () => {
    const res = await request(app.getHttpServer())
      .patch("/users/u1/onboarding/complete")
      .send({ needsOnboarding: false })
      .expect(200);
    expect(res.body._id).toBe("u1");
    expect(usersService.completeOnboarding).toHaveBeenCalledWith("u1", { needsOnboarding: false } as any);
  });

  it("GET /users/:id/onboarding/status returns status", async () => {
    const res = await request(app.getHttpServer())
      .get("/users/u1/onboarding/status")
      .expect(200);
    expect(res.body.needsOnboarding).toBe(false);
    expect(usersService.getOnboardingStatus).toHaveBeenCalledWith("u1");
  });

  it("DELETE /users/:id removes a user (204)", async () => {
    await request(app.getHttpServer()).delete("/users/u1").expect(204);
    expect(usersService.remove).toHaveBeenCalledWith("u1");
  });
});
