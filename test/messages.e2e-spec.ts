import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { INestApplication, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { MessagesController } from "../src/modules/messages/messages.controller";
import { MessagesService } from "../src/modules/messages/messages.service";

describe("MessagesController e2e (no DB)", () => {
  let app: INestApplication;
  let service: jest.Mocked<MessagesService>;

  const mockMessage = {
    _id: "m1",
    conversationId: "c1",
    content: "Hello",
    sender: "user",
  } as any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockMessage),
            findAll: jest
              .fn()
              .mockResolvedValue({ data: [mockMessage], total: 1 }),
            findOne: jest.fn().mockResolvedValue(mockMessage),
            update: jest.fn().mockResolvedValue({ ...mockMessage, content: "Hi" }),
            markAsRead: jest.fn().mockResolvedValue({ ...mockMessage, isRead: true }),
            addCorrections: jest
              .fn()
              .mockResolvedValue({ ...mockMessage, corrections: { a: 1 } }),
            remove: jest.fn().mockResolvedValue(mockMessage),
            removeByConversation: jest.fn().mockResolvedValue(1),
          },
        },
        { provide: Logger, useValue: new Logger("MessagesControllerTest") },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get(MessagesService) as jest.Mocked<MessagesService>;
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /messages?conversationId=c1 returns list", async () => {
    const res = await request(app.getHttpServer())
      .get("/messages")
      .query({ conversationId: "c1" })
      .expect(200);
    expect(res.body.total).toBe(1);
    expect(service.findAll).toHaveBeenCalledWith("c1", undefined, undefined, undefined);
  });

  it("GET /messages/:id returns one", async () => {
    const res = await request(app.getHttpServer()).get("/messages/m1").expect(200);
    expect(res.body._id).toBe("m1");
    expect(service.findOne).toHaveBeenCalledWith("m1");
  });

  it("POST /messages creates a message", async () => {
    const payload = { conversationId: "c1", content: "Hello", sender: "user" };
    const res = await request(app.getHttpServer())
      .post("/messages")
      .send(payload)
      .expect(201);
    expect(res.body._id).toBe("m1");
    expect(service.create).toHaveBeenCalledWith(payload);
  });

  it("PATCH /messages/:id updates a message", async () => {
    const res = await request(app.getHttpServer())
      .patch("/messages/m1")
      .send({ content: "Hi" })
      .expect(200);
    expect(res.body.content).toBe("Hi");
    expect(service.update).toHaveBeenCalledWith("m1", { content: "Hi" });
  });

  it("PATCH /messages/:id/read marks as read", async () => {
    const res = await request(app.getHttpServer())
      .patch("/messages/m1/read")
      .expect(200);
    expect(res.body.isRead).toBe(true);
    expect(service.markAsRead).toHaveBeenCalledWith("m1");
  });

  it("PATCH /messages/:id/corrections adds corrections", async () => {
    const res = await request(app.getHttpServer())
      .patch("/messages/m1/corrections")
      .send({ a: 1 })
      .expect(200);
    expect(res.body.corrections).toEqual({ a: 1 });
    expect(service.addCorrections).toHaveBeenCalledWith("m1", { a: 1 });
  });

  it("DELETE /messages/:id removes a message", async () => {
    const res = await request(app.getHttpServer()).delete("/messages/m1").expect(200);
    expect(res.body._id).toBe("m1");
    expect(service.remove).toHaveBeenCalledWith("m1");
  });

  it("DELETE /messages/conversation/:conversationId removes messages for a conversation", async () => {
    const res = await request(app.getHttpServer())
      .delete("/messages/conversation/c1")
      .expect(200);
    expect(res.body.deletedCount).toBe(1);
    expect(service.removeByConversation).toHaveBeenCalledWith("c1");
  });
});
