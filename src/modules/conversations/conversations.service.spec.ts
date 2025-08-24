import { Logger, NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";

import { ConversationsService } from "./conversations.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { UpdateConversationDto } from "./dto/update-conversation.dto";

describe("conversationsService", () => {
  let service: ConversationsService;
  let conversationModel: any;

  const mockConversation = {
    _id: new Types.ObjectId().toString(),
    title: "Test Conversation",
    userId: new Types.ObjectId(),
    aiCharacterId: new Types.ObjectId(),
    languageId: new Types.ObjectId(),
    status: "active",
    lastMessageAt: new Date(),
    messageCount: 0,
    save: jest.fn(),
  };

  beforeEach(async () => {
    const mockModel = () => ({
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      countDocuments: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      save: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getModelToken("Conversation"),
          useFactory: mockModel,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    conversationModel = module.get(getModelToken("Conversation"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new conversation", async () => {
      const createDto: CreateConversationDto = {
        title: "Test Conversation",
        userId: new Types.ObjectId(),
        aiCharacterId: new Types.ObjectId(),
        languageId: new Types.ObjectId(),
      };

      const mockCreatedConversation = {
        ...mockConversation,
        save: jest.fn().mockResolvedValue(mockConversation),
      };

      // Mock the constructor call properly
      const MockModel = jest.fn().mockImplementation(() => mockCreatedConversation);
      (service as any).conversationModel = MockModel;

      const result = await service.create(createDto);

      expect(result).toEqual(mockConversation);
      expect((service as any).conversationModel).toHaveBeenCalledWith(createDto);
      expect(mockCreatedConversation.save).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return conversations with pagination", async () => {
      const mockConversations = [mockConversation];
      conversationModel.exec.mockResolvedValueOnce(mockConversations);
      conversationModel.exec.mockResolvedValueOnce(1); // count

      const result = await service.findAll(10, 0);

      expect(result).toEqual({
        data: mockConversations,
        total: 1,
      });
      expect(conversationModel.find).toHaveBeenCalledWith({});
      expect(conversationModel.sort).toHaveBeenCalledWith({ lastMessageAt: -1 });
      expect(conversationModel.skip).toHaveBeenCalledWith(0);
      expect(conversationModel.limit).toHaveBeenCalledWith(10);
    });

    it("should filter by userId when provided", async () => {
      const userId = new Types.ObjectId().toString();
      const mockConversations = [mockConversation];
      conversationModel.exec.mockResolvedValueOnce(mockConversations);
      conversationModel.exec.mockResolvedValueOnce(1);

      await service.findAll(10, 0, userId);

      expect(conversationModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
    });

    it("should filter by multiple parameters", async () => {
      const userId = new Types.ObjectId().toString();
      const aiCharacterId = new Types.ObjectId().toString();
      const languageId = new Types.ObjectId().toString();
      const status = "active";

      conversationModel.exec.mockResolvedValueOnce([]);
      conversationModel.exec.mockResolvedValueOnce(0);

      await service.findAll(10, 0, userId, aiCharacterId, languageId, status);

      expect(conversationModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        aiCharacterId: new Types.ObjectId(aiCharacterId),
        languageId: new Types.ObjectId(languageId),
        status,
      });
    });
  });

  describe("findOne", () => {
    it("should return a conversation by id", async () => {
      const id = new Types.ObjectId().toString();
      conversationModel.exec.mockResolvedValue(mockConversation);

      const result = await service.findOne(id);

      expect(result).toEqual(mockConversation);
      expect(conversationModel.findById).toHaveBeenCalledWith(id);
    });

    it("should throw NotFoundException when conversation not found", async () => {
      const id = new Types.ObjectId().toString();
      conversationModel.exec.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByUser", () => {
    it("should return conversations for a specific user", async () => {
      const userId = new Types.ObjectId().toString();
      const mockConversations = [mockConversation];
      conversationModel.exec.mockResolvedValue(mockConversations);

      const result = await service.findByUser(userId);

      expect(result).toEqual(mockConversations);
      expect(conversationModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        status: { $ne: "deleted" },
      });
      expect(conversationModel.sort).toHaveBeenCalledWith({ lastMessageAt: -1 });
    });
  });

  describe("update", () => {
    it("should update a conversation", async () => {
      const id = new Types.ObjectId().toString();
      const updateDto: UpdateConversationDto = { title: "Updated Title" };
      const updatedConversation = { ...mockConversation, title: "Updated Title" };

      conversationModel.exec.mockResolvedValue(updatedConversation);

      const result = await service.update(id, updateDto);

      expect(result).toEqual(updatedConversation);
      expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateDto,
        { new: true },
      );
    });

    it("should throw NotFoundException when conversation not found", async () => {
      const id = new Types.ObjectId().toString();
      const updateDto: UpdateConversationDto = { title: "Updated Title" };
      conversationModel.exec.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateLastMessageTime", () => {
    it("should update last message time and increment message count", async () => {
      const id = new Types.ObjectId().toString();
      const updatedConversation = {
        ...mockConversation,
        lastMessageAt: new Date(),
        messageCount: 1,
      };

      conversationModel.exec.mockResolvedValue(updatedConversation);

      const result = await service.updateLastMessageTime(id);

      expect(result).toEqual(updatedConversation);
      expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        {
          lastMessageAt: expect.any(Date),
          $inc: { messageCount: 1 },
        },
        { new: true },
      );
    });

    it("should throw NotFoundException when conversation not found", async () => {
      const id = new Types.ObjectId().toString();
      conversationModel.exec.mockResolvedValue(null);

      await expect(service.updateLastMessageTime(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should soft delete a conversation", async () => {
      const id = new Types.ObjectId().toString();
      const deletedConversation = { ...mockConversation, status: "deleted" };
      conversationModel.exec.mockResolvedValue(deletedConversation);

      const result = await service.remove(id);

      expect(result).toEqual(deletedConversation);
      expect(conversationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { status: "deleted" },
        { new: true },
      );
    });

    it("should throw NotFoundException when conversation not found", async () => {
      const id = new Types.ObjectId().toString();
      conversationModel.exec.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("hardRemove", () => {
    it("should permanently delete a conversation", async () => {
      const id = new Types.ObjectId().toString();
      conversationModel.exec.mockResolvedValue(mockConversation);

      const result = await service.hardRemove(id);

      expect(result).toEqual(mockConversation);
      expect(conversationModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it("should throw NotFoundException when conversation not found", async () => {
      const id = new Types.ObjectId().toString();
      conversationModel.exec.mockResolvedValue(null);

      await expect(service.hardRemove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
