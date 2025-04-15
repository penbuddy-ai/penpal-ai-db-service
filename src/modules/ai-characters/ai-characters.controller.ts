import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post, Put, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AICharacterService } from "./ai-characters.service";
import { CreateAICharacterDto } from "./dto/create-ai-character.dto";
import { UpdateAICharacterDto } from "./dto/update-ai-character.dto";
import { AICharacter, AICharacterDocument } from "./schemas/ai-character.schema";

@ApiTags("ai-characters")
@Controller("ai-characters")
export class AICharactersController {
  constructor(
    private readonly aiCharactersService: AICharacterService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new AI character" })
  @ApiResponse({ status: 201, description: "The AI character has been successfully created.", type: AICharacter })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 409, description: "Conflict - AI character with this name already exists." })
  @ApiResponse({ status: 500, description: "Internal server error during AI character creation." })
  @ApiBody({ type: CreateAICharacterDto })
  async create(@Body() createAiCharacterDto: CreateAICharacterDto): Promise<AICharacterDocument> {
    this.logger.log(`Creating new AI character with name: ${createAiCharacterDto.name}`);
    return this.aiCharactersService.create(createAiCharacterDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_ai_characters")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all AI characters" })
  @ApiResponse({ status: 200, description: "Return all AI characters.", type: [AICharacter] })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving AI characters." })
  async findAll(): Promise<AICharacterDocument[]> {
    this.logger.log("Retrieving all AI characters");
    return this.aiCharactersService.findAll();
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("ai_character_by_id")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get an AI character by ID" })
  @ApiParam({ name: "id", type: "string", description: "AI character ID" })
  @ApiResponse({ status: 200, description: "Return the AI character.", type: AICharacter })
  @ApiResponse({ status: 404, description: "AI character not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving AI character." })
  async findOne(@Param("id") id: string): Promise<AICharacterDocument> {
    this.logger.log(`Retrieving AI character with ID: ${id}`);
    return this.aiCharactersService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an AI character" })
  @ApiParam({ name: "id", type: "string", description: "AI character ID" })
  @ApiBody({ type: UpdateAICharacterDto })
  @ApiResponse({ status: 200, description: "The AI character has been successfully updated.", type: AICharacter })
  @ApiResponse({ status: 404, description: "AI character not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating AI character." })
  async update(@Param("id") id: string, @Body() updateAiCharacterDto: UpdateAICharacterDto): Promise<AICharacterDocument> {
    this.logger.log(`Updating AI character with ID: ${id}`);
    return this.aiCharactersService.update(id, updateAiCharacterDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an AI character" })
  @ApiParam({ name: "id", type: "string", description: "AI character ID" })
  @ApiResponse({ status: 204, description: "The AI character has been successfully deleted." })
  @ApiResponse({ status: 404, description: "AI character not found." })
  @ApiResponse({ status: 500, description: "Internal server error while deleting AI character." })
  async remove(@Param("id") id: string): Promise<void> {
    this.logger.log(`Deleting AI character with ID: ${id}`);
    await this.aiCharactersService.remove(id);
  }

  @Get("language/:code")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("ai_characters_by_language")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get AI characters by language code" })
  @ApiParam({ name: "code", type: "string", description: "Language code (e.g. 'en', 'fr')" })
  @ApiResponse({ status: 200, description: "Return the AI characters that support the specified language.", type: [AICharacter] })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving AI characters." })
  async findByLanguage(@Param("code") code: string): Promise<AICharacterDocument[]> {
    this.logger.log(`Finding AI characters for language code: ${code}`);
    return this.aiCharactersService.findByLanguage(code);
  }
}
