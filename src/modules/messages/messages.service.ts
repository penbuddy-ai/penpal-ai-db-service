import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { ConversationsService } from "../conversations/conversations.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { Message, MessageDocument } from "./schemas/message.schema";

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly conversationsService: ConversationsService,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    this.logger.log(`Creating new message in conversation: ${createMessageDto.conversationId}`);
    const createdMessage = new this.messageModel(createMessageDto);
    const savedMessage = await createdMessage.save();

    // Update the conversation's last message time and message count
    await this.conversationsService.updateLastMessageTime(createMessageDto.conversationId.toString());

    return savedMessage;
  }

  async findAll(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
    sender?: string,
  ): Promise<{ data: Message[]; total: number }> {
    const query: any = { conversationId: new Types.ObjectId(conversationId) };

    if (sender) {
      query.sender = sender;
    }

    this.logger.log(`Finding messages with query: ${JSON.stringify(query)}`);

    const [data, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Message> {
    this.logger.log(`Finding message with id: ${id}`);
    const message = await this.messageModel.findById(id).exec();

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    this.logger.log(`Updating message with id: ${id}`);
    const updatedMessage = await this.messageModel
      .findByIdAndUpdate(id, updateMessageDto, { new: true })
      .exec();

    if (!updatedMessage) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return updatedMessage;
  }

  async markAsRead(id: string): Promise<Message> {
    this.logger.log(`Marking message as read: ${id}`);
    return this.update(id, { isRead: true });
  }

  async addCorrections(id: string, corrections: Record<string, any>): Promise<Message> {
    this.logger.log(`Adding corrections to message: ${id}`);
    return this.update(id, { corrections });
  }

  async remove(id: string): Promise<Message> {
    this.logger.log(`Removing message with id: ${id}`);
    const deletedMessage = await this.messageModel.findByIdAndDelete(id).exec();

    if (!deletedMessage) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return deletedMessage;
  }

  async removeByConversation(conversationId: string): Promise<number> {
    this.logger.log(`Removing all messages for conversation: ${conversationId}`);
    const result = await this.messageModel
      .deleteMany({ conversationId: new Types.ObjectId(conversationId) })
      .exec();

    return result.deletedCount;
  }
}
