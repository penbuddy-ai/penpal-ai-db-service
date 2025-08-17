import { CacheInterceptor } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ConversationsService } from "./conversations.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { UpdateConversationDto } from "./dto/update-conversation.dto";
import { Conversation } from "./schemas/conversation.schema";

@ApiTags("conversations")
@Controller("conversations")
export class ConversationsController {
  private readonly logger = new Logger(ConversationsController.name);

  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new conversation" })
  @ApiResponse({ status: 201, description: "The conversation has been successfully created." })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  async create(@Body() createConversationDto: CreateConversationDto): Promise<Conversation> {
    this.logger.log(`Creating conversation with title: ${createConversationDto.title}`);
    return this.conversationsService.create(createConversationDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: "Get all conversations with pagination and filtering" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of items to return" })
  @ApiQuery({ name: "offset", required: false, type: Number, description: "Number of items to skip" })
  @ApiQuery({ name: "userId", required: false, type: String, description: "Filter by user ID" })
  @ApiQuery({ name: "aiCharacterId", required: false, type: String, description: "Filter by AI character ID" })
  @ApiQuery({ name: "languageId", required: false, type: String, description: "Filter by language ID" })
  @ApiQuery({ name: "status", required: false, type: String, description: "Filter by status (active, archived, deleted)" })
  @ApiResponse({ status: 200, description: "List of conversations" })
  async findAll(
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
    @Query("userId") userId?: string,
    @Query("aiCharacterId") aiCharacterId?: string,
    @Query("languageId") languageId?: string,
    @Query("status") status?: string,
  ): Promise<{ data: Conversation[]; total: number }> {
    this.logger.log("Finding all conversations");
    return this.conversationsService.findAll(
      limit,
      offset,
      userId,
      aiCharacterId,
      languageId,
      status,
    );
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: "Get a specific conversation by ID" })
  @ApiParam({ name: "id", description: "Conversation ID" })
  @ApiResponse({ status: 200, description: "The conversation has been found." })
  @ApiResponse({ status: 404, description: "Conversation not found." })
  async findOne(@Param("id") id: string): Promise<Conversation> {
    this.logger.log(`Finding conversation with id: ${id}`);
    return this.conversationsService.findOne(id);
  }

  @Get("user/:userId")
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: "Get all conversations for a specific user" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiResponse({ status: 200, description: "List of conversations for the user." })
  async findByUser(@Param("userId") userId: string): Promise<Conversation[]> {
    this.logger.log(`Finding conversations for user: ${userId}`);
    return this.conversationsService.findByUser(userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a conversation" })
  @ApiParam({ name: "id", description: "Conversation ID" })
  @ApiResponse({ status: 200, description: "The conversation has been successfully updated." })
  @ApiResponse({ status: 404, description: "Conversation not found." })
  async update(
    @Param("id") id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    this.logger.log(`Updating conversation with id: ${id}`);
    return this.conversationsService.update(id, updateConversationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete a conversation (sets status to deleted)" })
  @ApiParam({ name: "id", description: "Conversation ID" })
  @ApiResponse({ status: 200, description: "The conversation has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Conversation not found." })
  async remove(@Param("id") id: string): Promise<Conversation> {
    this.logger.log(`Removing conversation with id: ${id}`);
    return this.conversationsService.remove(id);
  }

  @Delete(":id/hard")
  @ApiOperation({ summary: "Hard delete a conversation (removes from database)" })
  @ApiParam({ name: "id", description: "Conversation ID" })
  @ApiResponse({ status: 200, description: "The conversation has been successfully deleted from the database." })
  @ApiResponse({ status: 404, description: "Conversation not found." })
  async hardRemove(@Param("id") id: string): Promise<Conversation> {
    this.logger.log(`Hard removing conversation with id: ${id}`);
    return this.conversationsService.hardRemove(id);
  }
}
