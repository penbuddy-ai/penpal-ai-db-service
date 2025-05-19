import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CreateConversationDto } from "./dto/create-conversation.dto";
import { UpdateConversationDto } from "./dto/update-conversation.dto";
import { Conversation, ConversationDocument } from "./schemas/conversation.schema";

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  async create(createConversationDto: CreateConversationDto): Promise<Conversation> {
    this.logger.log(`Creating new conversation with title: ${createConversationDto.title}`);
    const createdConversation = new this.conversationModel(createConversationDto);
    return createdConversation.save();
  }

  async findAll(
    limit: number = 10,
    offset: number = 0,
    userId?: string,
    aiCharacterId?: string,
    languageId?: string,
    status?: string,
  ): Promise<{ data: Conversation[]; total: number }> {
    const query: any = {};

    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    if (aiCharacterId) {
      query.aiCharacterId = new Types.ObjectId(aiCharacterId);
    }

    if (languageId) {
      query.languageId = new Types.ObjectId(languageId);
    }

    if (status) {
      query.status = status;
    }

    this.logger.log(`Finding conversations with query: ${JSON.stringify(query)}`);

    const [data, total] = await Promise.all([
      this.conversationModel
        .find(query)
        .sort({ lastMessageAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.conversationModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Conversation> {
    this.logger.log(`Finding conversation with id: ${id}`);
    const conversation = await this.conversationModel.findById(id).exec();

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async findByUser(userId: string): Promise<Conversation[]> {
    this.logger.log(`Finding conversations for user: ${userId}`);
    return this.conversationModel
      .find({ userId: new Types.ObjectId(userId), status: { $ne: "deleted" } })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async update(id: string, updateConversationDto: UpdateConversationDto): Promise<Conversation> {
    this.logger.log(`Updating conversation with id: ${id}`);
    const updatedConversation = await this.conversationModel
      .findByIdAndUpdate(id, updateConversationDto, { new: true })
      .exec();

    if (!updatedConversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return updatedConversation;
  }

  async updateLastMessageTime(id: string): Promise<Conversation> {
    this.logger.log(`Updating last message time for conversation: ${id}`);
    const updatedConversation = await this.conversationModel
      .findByIdAndUpdate(
        id,
        {
          lastMessageAt: new Date(),
          $inc: { messageCount: 1 },
        },
        { new: true },
      )
      .exec();

    if (!updatedConversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return updatedConversation;
  }

  async remove(id: string): Promise<Conversation> {
    this.logger.log(`Removing conversation with id: ${id}`);
    // Soft delete by setting status to "deleted"
    const deletedConversation = await this.conversationModel
      .findByIdAndUpdate(id, { status: "deleted" }, { new: true })
      .exec();

    if (!deletedConversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return deletedConversation;
  }

  async hardRemove(id: string): Promise<Conversation> {
    this.logger.log(`Hard removing conversation with id: ${id}`);
    const deletedConversation = await this.conversationModel.findByIdAndDelete(id).exec();

    if (!deletedConversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return deletedConversation;
  }
}
