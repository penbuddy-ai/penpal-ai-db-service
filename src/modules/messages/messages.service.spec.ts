import { Logger, NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";

import { ConversationsService } from "../conversations/conversations.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { MessagesService } from "./messages.service";

describe("messagesService", () => {
  let service: MessagesService;
  let messageModel: any;
  let conversationsService: jest.Mocked<ConversationsService>;

  const mockMessage = {
    _id: new Types.ObjectId().toString(),
    conversationId: new Types.ObjectId(),
    content: "Test message",
    sender: "user",
    timestamp: new Date(),
    isRead: false,
    corrections: {},
    save: jest.fn(),
  };

  beforeEach(async () => {
    const mockModel = () => ({
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      deleteMany: jest.fn().mockReturnThis(),
      countDocuments: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      save: jest.fn(),
    });

    const mockConversationsService = {
      updateLastMessageTime: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getModelToken("Message"),
          useFactory: mockModel,
        },
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
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

    service = module.get<MessagesService>(MessagesService);
    messageModel = module.get(getModelToken("Message"));
    conversationsService = module.get<ConversationsService>(ConversationsService) as jest.Mocked<ConversationsService>;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new message and update conversation", async () => {
      const createDto: CreateMessageDto = {
        conversationId: new Types.ObjectId(),
        content: "Test message",
        sender: "user",
      };

      const mockCreatedMessage = {
        ...mockMessage,
        save: jest.fn().mockResolvedValue(mockMessage),
      };

      // Mock the constructor properly
      const MockModel = jest.fn().mockImplementation(() => mockCreatedMessage);
      (service as any).messageModel = MockModel;
      conversationsService.updateLastMessageTime.mockResolvedValue({} as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockMessage);
      expect((service as any).messageModel).toHaveBeenCalledWith(createDto);
      expect(mockCreatedMessage.save).toHaveBeenCalled();
      expect(conversationsService.updateLastMessageTime).toHaveBeenCalledWith(
        createDto.conversationId.toString(),
      );
    });
  });

  describe("findAll", () => {
    it("should return messages with pagination", async () => {
      const conversationId = new Types.ObjectId().toString();
      const mockMessages = [mockMessage];
      messageModel.exec.mockResolvedValueOnce(mockMessages);
      messageModel.exec.mockResolvedValueOnce(1); // count

      const result = await service.findAll(conversationId, 50, 0);

      expect(result).toEqual({
        data: mockMessages,
        total: 1,
      });
      expect(messageModel.find).toHaveBeenCalledWith({
        conversationId: new Types.ObjectId(conversationId),
      });
      expect(messageModel.sort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(messageModel.skip).toHaveBeenCalledWith(0);
      expect(messageModel.limit).toHaveBeenCalledWith(50);
    });

    it("should filter by sender when provided", async () => {
      const conversationId = new Types.ObjectId().toString();
      const sender = "ai";
      messageModel.exec.mockResolvedValueOnce([]);
      messageModel.exec.mockResolvedValueOnce(0);

      await service.findAll(conversationId, 50, 0, sender);

      expect(messageModel.find).toHaveBeenCalledWith({
        conversationId: new Types.ObjectId(conversationId),
        sender,
      });
    });
  });

  describe("findOne", () => {
    it("should return a message by id", async () => {
      const id = new Types.ObjectId().toString();
      messageModel.exec.mockResolvedValue(mockMessage);

      const result = await service.findOne(id);

      expect(result).toEqual(mockMessage);
      expect(messageModel.findById).toHaveBeenCalledWith(id);
    });

    it("should throw NotFoundException when message not found", async () => {
      const id = new Types.ObjectId().toString();
      messageModel.exec.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a message", async () => {
      const id = new Types.ObjectId().toString();
      const updateDto: UpdateMessageDto = { content: "Updated content" };
      const updatedMessage = { ...mockMessage, content: "Updated content" };

      messageModel.exec.mockResolvedValue(updatedMessage);

      const result = await service.update(id, updateDto);

      expect(result).toEqual(updatedMessage);
      expect(messageModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateDto,
        { new: true },
      );
    });

    it("should throw NotFoundException when message not found", async () => {
      const id = new Types.ObjectId().toString();
      const updateDto: UpdateMessageDto = { content: "Updated content" };
      messageModel.exec.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe("markAsRead", () => {
    it("should mark message as read", async () => {
      const id = new Types.ObjectId().toString();
      const updatedMessage = { ...mockMessage, isRead: true };
      messageModel.exec.mockResolvedValue(updatedMessage);

      const result = await service.markAsRead(id);

      expect(result).toEqual(updatedMessage);
      expect(messageModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { isRead: true },
        { new: true },
      );
    });
  });

  describe("addCorrections", () => {
    it("should add corrections to message", async () => {
      const id = new Types.ObjectId().toString();
      const corrections = { grammar: "Fixed grammar" };
      const updatedMessage = { ...mockMessage, corrections };
      messageModel.exec.mockResolvedValue(updatedMessage);

      const result = await service.addCorrections(id, corrections);

      expect(result).toEqual(updatedMessage);
      expect(messageModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { corrections },
        { new: true },
      );
    });
  });

  describe("remove", () => {
    it("should delete a message", async () => {
      const id = new Types.ObjectId().toString();
      messageModel.exec.mockResolvedValue(mockMessage);

      const result = await service.remove(id);

      expect(result).toEqual(mockMessage);
      expect(messageModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it("should throw NotFoundException when message not found", async () => {
      const id = new Types.ObjectId().toString();
      messageModel.exec.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeByConversation", () => {
    it("should delete all messages for a conversation", async () => {
      const conversationId = new Types.ObjectId().toString();
      const mockResult = { deletedCount: 5 };
      messageModel.exec.mockResolvedValue(mockResult);

      const result = await service.removeByConversation(conversationId);

      expect(result).toBe(5);
      expect(messageModel.deleteMany).toHaveBeenCalledWith({
        conversationId: new Types.ObjectId(conversationId),
      });
    });

    it("should return 0 when no messages found", async () => {
      const conversationId = new Types.ObjectId().toString();
      const mockResult = { deletedCount: 0 };
      messageModel.exec.mockResolvedValue(mockResult);

      const result = await service.removeByConversation(conversationId);

      expect(result).toBe(0);
    });
  });
});
