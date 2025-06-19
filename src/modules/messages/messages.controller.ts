import { CacheInterceptor } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { MessagesService } from "./messages.service";
import { Message } from "./schemas/message.schema";

@ApiTags("messages")
@Controller("messages")
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new message" })
  @ApiResponse({ status: 201, description: "The message has been successfully created." })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    this.logger.log(`Creating message in conversation: ${createMessageDto.conversationId}`);
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: "Get all messages for a conversation with pagination and filtering" })
  @ApiQuery({ name: "conversationId", required: true, type: String, description: "Conversation ID" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of items to return" })
  @ApiQuery({ name: "offset", required: false, type: Number, description: "Number of items to skip" })
  @ApiQuery({ name: "sender", required: false, type: String, description: "Filter by sender (user or ai)" })
  @ApiResponse({ status: 200, description: "List of messages" })
  async findAll(
    @Query("conversationId") conversationId: string,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
    @Query("sender") sender?: string,
  ): Promise<{ data: Message[]; total: number }> {
    this.logger.log(`Finding messages for conversation: ${conversationId}`);
    return this.messagesService.findAll(
      conversationId,
      limit,
      offset,
      sender,
    );
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: "Get a specific message by ID" })
  @ApiParam({ name: "id", description: "Message ID" })
  @ApiResponse({ status: 200, description: "The message has been found." })
  @ApiResponse({ status: 404, description: "Message not found." })
  async findOne(@Param("id") id: string): Promise<Message> {
    this.logger.log(`Finding message with id: ${id}`);
    return this.messagesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a message" })
  @ApiParam({ name: "id", description: "Message ID" })
  @ApiResponse({ status: 200, description: "The message has been successfully updated." })
  @ApiResponse({ status: 404, description: "Message not found." })
  async update(
    @Param("id") id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    this.logger.log(`Updating message with id: ${id}`);
    return this.messagesService.update(id, updateMessageDto);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a message as read" })
  @ApiParam({ name: "id", description: "Message ID" })
  @ApiResponse({ status: 200, description: "The message has been successfully marked as read." })
  @ApiResponse({ status: 404, description: "Message not found." })
  async markAsRead(@Param("id") id: string): Promise<Message> {
    this.logger.log(`Marking message as read: ${id}`);
    return this.messagesService.markAsRead(id);
  }

  @Patch(":id/corrections")
  @ApiOperation({ summary: "Add corrections to a message" })
  @ApiParam({ name: "id", description: "Message ID" })
  @ApiResponse({ status: 200, description: "The corrections have been successfully added." })
  @ApiResponse({ status: 404, description: "Message not found." })
  async addCorrections(
    @Param("id") id: string,
    @Body() corrections: Record<string, any>,
  ): Promise<Message> {
    this.logger.log(`Adding corrections to message: ${id}`);
    return this.messagesService.addCorrections(id, corrections);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a message" })
  @ApiParam({ name: "id", description: "Message ID" })
  @ApiResponse({ status: 200, description: "The message has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Message not found." })
  async remove(@Param("id") id: string): Promise<Message> {
    this.logger.log(`Removing message with id: ${id}`);
    return this.messagesService.remove(id);
  }

  @Delete("conversation/:conversationId")
  @ApiOperation({ summary: "Delete all messages for a conversation" })
  @ApiParam({ name: "conversationId", description: "Conversation ID" })
  @ApiResponse({ status: 200, description: "The messages have been successfully deleted." })
  async removeByConversation(
    @Param("conversationId") conversationId: string,
  ): Promise<{ deletedCount: number }> {
    this.logger.log(`Removing all messages for conversation: ${conversationId}`);
    const deletedCount = await this.messagesService.removeByConversation(conversationId);
    return { deletedCount };
  }
}
