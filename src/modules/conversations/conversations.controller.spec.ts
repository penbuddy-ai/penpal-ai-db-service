import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";

import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { UpdateConversationDto } from "./dto/update-conversation.dto";

describe("conversationsController", () => {
  let controller: ConversationsController;
  let service: jest.Mocked<ConversationsService>;
  let logger: jest.Mocked<Logger>;

  const mockConversation = {
    _id: new Types.ObjectId().toString(),
    title: "Test Conversation",
    userId: new Types.ObjectId(),
    aiCharacterId: new Types.ObjectId(),
    languageId: new Types.ObjectId(),
    status: "active",
    lastMessageAt: new Date(),
    messageCount: 0,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUser: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      hardRemove: jest.fn(),
      updateLastMessageTime: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
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

    controller = module.get<ConversationsController>(ConversationsController);
    service = module.get<ConversationsService>(ConversationsService) as jest.Mocked<ConversationsService>;
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
    it("should create a conversation", async () => {
      const createDto: CreateConversationDto = {
        title: "Test Conversation",
        userId: new Types.ObjectId(),
        aiCharacterId: new Types.ObjectId(),
        languageId: new Types.ObjectId(),
      };

      service.create.mockResolvedValue(mockConversation as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockConversation);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(logger.log).toHaveBeenCalledWith(`Creating conversation with title: ${createDto.title}`);
    });
  });

  describe("findAll", () => {
    it("should return paginated conversations", async () => {
      const expectedResult = { data: [mockConversation], total: 1 };
      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(10, 0);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(10, 0, undefined, undefined, undefined, undefined);
      expect(logger.log).toHaveBeenCalledWith("Finding all conversations");
    });

    it("should pass all filter parameters", async () => {
      const expectedResult = { data: [], total: 0 };
      service.findAll.mockResolvedValue(expectedResult as any);

      const userId = new Types.ObjectId().toString();
      const aiCharacterId = new Types.ObjectId().toString();
      const languageId = new Types.ObjectId().toString();
      const status = "active";

      await controller.findAll(5, 10, userId, aiCharacterId, languageId, status);

      expect(service.findAll).toHaveBeenCalledWith(5, 10, userId, aiCharacterId, languageId, status);
    });

    it("should handle undefined parameters", async () => {
      const expectedResult = { data: [], total: 0 };
      service.findAll.mockResolvedValue(expectedResult as any);

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, undefined, undefined, undefined);
    });
  });

  describe("findOne", () => {
    it("should return a conversation by id", async () => {
      const id = new Types.ObjectId().toString();
      service.findOne.mockResolvedValue(mockConversation as any);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockConversation);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(logger.log).toHaveBeenCalledWith(`Finding conversation with id: ${id}`);
    });
  });

  describe("findByUser", () => {
    it("should return conversations for a user", async () => {
      const userId = new Types.ObjectId().toString();
      const expectedConversations = [mockConversation];
      service.findByUser.mockResolvedValue(expectedConversations as any);

      const result = await controller.findByUser(userId);

      expect(result).toEqual(expectedConversations);
      expect(service.findByUser).toHaveBeenCalledWith(userId);
      expect(logger.log).toHaveBeenCalledWith(`Finding conversations for user: ${userId}`);
    });
  });

  describe("update", () => {
    it("should update a conversation", async () => {
      const id = new Types.ObjectId().toString();
      const updateDto: UpdateConversationDto = { title: "Updated Title" };
      const updatedConversation = { ...mockConversation, title: "Updated Title" };

      service.update.mockResolvedValue(updatedConversation as any);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual(updatedConversation);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(logger.log).toHaveBeenCalledWith(`Updating conversation with id: ${id}`);
    });
  });

  describe("remove", () => {
    it("should soft delete a conversation", async () => {
      const id = new Types.ObjectId().toString();
      const deletedConversation = { ...mockConversation, status: "deleted" };

      service.remove.mockResolvedValue(deletedConversation as any);

      const result = await controller.remove(id);

      expect(result).toEqual(deletedConversation);
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(logger.log).toHaveBeenCalledWith(`Removing conversation with id: ${id}`);
    });
  });

  describe("hardRemove", () => {
    it("should hard delete a conversation", async () => {
      const id = new Types.ObjectId().toString();

      service.hardRemove.mockResolvedValue(mockConversation as any);

      const result = await controller.hardRemove(id);

      expect(result).toEqual(mockConversation);
      expect(service.hardRemove).toHaveBeenCalledWith(id);
      expect(logger.log).toHaveBeenCalledWith(`Hard removing conversation with id: ${id}`);
    });
  });
});
