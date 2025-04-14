import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AICharacterService } from './ai-characters.service';
import { CreateAICharacterDto } from './dto/create-ai-character.dto';
import { UpdateAICharacterDto } from './dto/update-ai-character.dto';
import { AICharacter } from './schemas/ai-character.schema';

@ApiTags('ai-characters')
@Controller('ai-characters')
export class AICharactersController {
  constructor(private readonly aiCharactersService: AICharacterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new AI character' })
  @ApiResponse({ status: 201, description: 'The AI character has been successfully created.', type: AICharacter })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({ type: CreateAICharacterDto })
  create(@Body() createAiCharacterDto: CreateAICharacterDto) {
    return this.aiCharactersService.create(createAiCharacterDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('all_ai_characters')
  @CacheTTL(3600)
  @ApiOperation({ summary: 'Get all AI characters' })
  @ApiResponse({ status: 200, description: 'Return all AI characters.', type: [AICharacter] })
  findAll() {
    return this.aiCharactersService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('ai_character_by_id')
  @CacheTTL(3600)
  @ApiOperation({ summary: 'Get an AI character by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'AI character ID' })
  @ApiResponse({ status: 200, description: 'Return the AI character.', type: AICharacter })
  @ApiResponse({ status: 404, description: 'AI character not found.' })
  async findOne(@Param('id') id: string) {
    const character = await this.aiCharactersService.findOne(id);
    if (!character) {
      throw new HttpException('AI character not found', HttpStatus.NOT_FOUND);
    }
    return character;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an AI character' })
  @ApiParam({ name: 'id', type: 'string', description: 'AI character ID' })
  @ApiBody({ type: UpdateAICharacterDto })
  @ApiResponse({ status: 200, description: 'The AI character has been successfully updated.', type: AICharacter })
  @ApiResponse({ status: 404, description: 'AI character not found.' })
  update(@Param('id') id: string, @Body() updateAiCharacterDto: UpdateAICharacterDto) {
    return this.aiCharactersService.update(id, updateAiCharacterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an AI character' })
  @ApiParam({ name: 'id', type: 'string', description: 'AI character ID' })
  @ApiResponse({ status: 200, description: 'The AI character has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'AI character not found.' })
  remove(@Param('id') id: string) {
    return this.aiCharactersService.remove(id);
  }
} 