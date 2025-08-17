import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";

import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";

describe("messagesController", () => {
  let controller: MessagesController;
  let service: jest.Mocked<MessagesService>;
  let logger: jest.Mocked<Logger>;

  const mockMessage = {
    _id: new Types.ObjectId().toString(),
    conversationId: new Types.ObjectId(),
    content: "Test message",
    sender: "user",
    timestamp: new Date(),
    isRead: false,
    corrections: {},
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      markAsRead: jest.fn(),
      addCorrections: jest.fn(),
      remove: jest.fn(),
      removeByConversation: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: mockService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    service = module.get<MessagesService>(MessagesService) as jest.Mocked<MessagesService>;
    logger = module.get<Logger>(Logger) as jest.Mocked<Logger>;

    // Replace controller's logger with our mock
    Object.defineProperty(controller, "logger", {
      value: logger,
      writable: true,
    });
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a message", async () => {
      const createDto: CreateMessageDto = {
        conversationId: new Types.ObjectId(),
        content: "Test message",
        sender: "user",
      };

      service.create.mockResolvedValue(mockMessage as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockMessage);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(logger.log).toHaveBeenCalledWith(`Creating message in conversation: ${createDto.conversationId}`);
    });
  });

  describe("findAll", () => {
    it("should return paginated messages", async () => {
      const conversationId = new Types.ObjectId().toString();
      const expectedResult = { data: [mockMessage], total: 1 };
      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(conversationId, 50, 0);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(conversationId, 50, 0, undefined);
      expect(logger.log).toHaveBeenCalledWith(`Finding messages for conversation: ${conversationId}`);
    });

    it("should pass sender filter", async () => {
      const conversationId = new Types.ObjectId().toString();
      const sender = "ai";
      const expectedResult = { data: [], total: 0 };
      service.findAll.mockResolvedValue(expectedResult as any);

      await controller.findAll(conversationId, 50, 0, sender);

      expect(service.findAll).toHaveBeenCalledWith(conversationId, 50, 0, sender);
    });
  });

  describe("findOne", () => {
    it("should return a message by id", async () => {
      const id = new Types.ObjectId().toString();
      service.findOne.mockResolvedValue(mockMessage as any);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockMessage);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(logger.log).toHaveBeenCalledWith(`Finding message with id: ${id}`);
    });
  });

  describe("update", () => {
    it("should update a message", async () => {
      const id = new Types.ObjectId().toString();
      const updateDto: UpdateMessageDto = { content: "Updated content" };
      const updatedMessage = { ...mockMessage, content: "Updated content" };

      service.update.mockResolvedValue(updatedMessage as any);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual(updatedMessage);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(logger.log).toHaveBeenCalledWith(`Updating message with id: ${id}`);
    });
  });

  describe("markAsRead", () => {
    it("should mark message as read", async () => {
      const id = new Types.ObjectId().toString();
      const readMessage = { ...mockMessage, isRead: true };

      service.markAsRead.mockResolvedValue(readMessage as any);

      const result = await controller.markAsRead(id);

      expect(result).toEqual(readMessage);
      expect(service.markAsRead).toHaveBeenCalledWith(id);
      expect(logger.log).toHaveBeenCalledWith(`Marking message as read: ${id}`);
    });
  });

  describe("addCorrections", () => {
    it("should add corrections to message", async () => {
      const id = new Types.ObjectId().toString();
      const corrections = { grammar: "Fixed grammar" };
      const correctedMessage = { ...mockMessage, corrections };

      service.addCorrections.mockResolvedValue(correctedMessage as any);

      const result = await controller.addCorrections(id, corrections);

      expect(result).toEqual(correctedMessage);
      expect(service.addCorrections).toHaveBeenCalledWith(id, corrections);
      expect(logger.log).toHaveBeenCalledWith(`Adding corrections to message: ${id}`);
    });
  });

  describe("remove", () => {
    it("should delete a message", async () => {
      const id = new Types.ObjectId().toString();
      service.remove.mockResolvedValue(mockMessage as any);

      const result = await controller.remove(id);

      expect(result).toEqual(mockMessage);
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(logger.log).toHaveBeenCalledWith(`Removing message with id: ${id}`);
    });
  });
});
