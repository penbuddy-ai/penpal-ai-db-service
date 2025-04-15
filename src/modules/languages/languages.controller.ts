import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Post, Put, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateLanguageDto } from "./dto/create-language.dto";
import { UpdateLanguageDto } from "./dto/update-language.dto";
import { LanguagesService } from "./languages.service";
import { Language, LanguageDocument } from "./schemas/language.schema";

@ApiTags("languages")
@Controller("languages")
export class LanguagesController {
  private readonly logger = new Logger(LanguagesController.name);

  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new language" })
  @ApiResponse({ status: 201, description: "The language has been successfully created.", type: Language })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 409, description: "Conflict - language with this code already exists." })
  @ApiResponse({ status: 500, description: "Internal server error during language creation." })
  @ApiBody({ type: CreateLanguageDto })
  async create(@Body() createLanguageDto: CreateLanguageDto): Promise<LanguageDocument> {
    this.logger.log(`Creating new language with code: ${createLanguageDto.code}`);
    return this.languagesService.create(createLanguageDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_languages")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all languages" })
  @ApiResponse({ status: 200, description: "Return all languages.", type: [Language] })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving languages." })
  async findAll(): Promise<LanguageDocument[]> {
    this.logger.log("Retrieving all languages");
    return this.languagesService.findAll();
  }

  @Get(":code")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("language_by_code")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get a language by code" })
  @ApiParam({ name: "code", type: "string", description: "Language code" })
  @ApiResponse({ status: 200, description: "Return the language.", type: Language })
  @ApiResponse({ status: 404, description: "Language not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving language." })
  async findOne(@Param("code") code: string): Promise<LanguageDocument> {
    this.logger.log(`Retrieving language with code: ${code}`);
    const language = await this.languagesService.findByCode(code);
    if (!language) {
      this.logger.warn(`Language with code ${code} not found`);
      throw new NotFoundException(`Language with code ${code} not found`);
    }
    return language;
  }

  @Put(":code")
  @ApiOperation({ summary: "Update a language" })
  @ApiParam({ name: "code", type: "string", description: "Language code" })
  @ApiBody({ type: UpdateLanguageDto })
  @ApiResponse({ status: 200, description: "The language has been successfully updated.", type: Language })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 404, description: "Language not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating language." })
  async update(
    @Param("code") code: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<LanguageDocument> {
    this.logger.log(`Updating language with code: ${code}`);
    const language = await this.languagesService.findByCode(code);
    if (!language) {
      this.logger.warn(`Language with code ${code} not found`);
      throw new NotFoundException(`Language with code ${code} not found`);
    }

    return this.languagesService.update(language.id, updateLanguageDto);
  }

  @Delete(":code")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a language" })
  @ApiParam({ name: "code", type: "string", description: "Language code" })
  @ApiResponse({ status: 204, description: "The language has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Language not found." })
  @ApiResponse({ status: 500, description: "Internal server error while deleting language." })
  async remove(@Param("code") code: string): Promise<void> {
    this.logger.log(`Deleting language with code: ${code}`);
    const language = await this.languagesService.findByCode(code);
    if (!language) {
      this.logger.warn(`Language with code ${code} not found`);
      throw new NotFoundException(`Language with code ${code} not found`);
    }

    await this.languagesService.remove(language.id);
  }
}
