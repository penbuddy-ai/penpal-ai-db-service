import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { INestApplication, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { ConversationsController } from "../src/modules/conversations/conversations.controller";
import { ConversationsService } from "../src/modules/conversations/conversations.service";

describe("ConversationsController e2e (no DB)", () => {
  let app: INestApplication;
  let service: jest.Mocked<ConversationsService>;

  const mockConversation = {
    _id: "c1",
    title: "Test",
  } as any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockConversation),
            findAll: jest
              .fn()
              .mockResolvedValue({ data: [mockConversation], total: 1 }),
            findOne: jest.fn().mockResolvedValue(mockConversation),
            findByUser: jest.fn().mockResolvedValue([mockConversation]),
            update: jest.fn().mockResolvedValue({ ...mockConversation, title: "Updated" }),
            remove: jest.fn().mockResolvedValue(mockConversation),
            hardRemove: jest.fn().mockResolvedValue(mockConversation),
          },
        },
        { provide: Logger, useValue: new Logger("ConversationsControllerTest") },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get(ConversationsService) as jest.Mocked<ConversationsService>;
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /conversations returns list", async () => {
    const res = await request(app.getHttpServer()).get("/conversations").expect(200);
    expect(res.body.total).toBe(1);
    expect(service.findAll).toHaveBeenCalled();
  });

  it("GET /conversations/:id returns one", async () => {
    const res = await request(app.getHttpServer()).get("/conversations/c1").expect(200);
    expect(res.body._id).toBe("c1");
    expect(service.findOne).toHaveBeenCalledWith("c1");
  });

  it("POST /conversations creates a conversation", async () => {
    const payload = { title: "Test" };
    const res = await request(app.getHttpServer())
      .post("/conversations")
      .send(payload)
      .expect(201);
    expect(res.body._id).toBe("c1");
    expect(service.create).toHaveBeenCalledWith(payload);
  });

  it("PATCH /conversations/:id updates a conversation", async () => {
    const res = await request(app.getHttpServer())
      .patch("/conversations/c1")
      .send({ title: "Updated" })
      .expect(200);
    expect(res.body.title).toBe("Updated");
    expect(service.update).toHaveBeenCalledWith("c1", { title: "Updated" });
  });

  it("GET /conversations/user/:userId returns by user", async () => {
    const res = await request(app.getHttpServer())
      .get("/conversations/user/u1")
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(service.findByUser).toHaveBeenCalledWith("u1");
  });

  it("DELETE /conversations/:id soft deletes a conversation", async () => {
    const res = await request(app.getHttpServer())
      .delete("/conversations/c1")
      .expect(200);
    expect(res.body._id).toBe("c1");
    expect(service.remove).toHaveBeenCalledWith("c1");
  });

  it("DELETE /conversations/:id/hard hard deletes a conversation", async () => {
    const res = await request(app.getHttpServer())
      .delete("/conversations/c1/hard")
      .expect(200);
    expect(res.body._id).toBe("c1");
    expect(service.hardRemove).toHaveBeenCalledWith("c1");
  });
});
