import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateLanguageDto } from "./dto/create-language.dto";
import { UpdateLanguageDto } from "./dto/update-language.dto";
import { LanguagesService } from "./languages.service";
import { Language } from "./schemas/language.schema";

@ApiTags("languages")
@Controller("languages")
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new language" })
  @ApiResponse({ status: 201, description: "The language has been successfully created.", type: Language })
  @ApiResponse({ status: 400, description: "Bad request." })
  @ApiBody({ type: CreateLanguageDto })
  async create(@Body() createLanguageDto: CreateLanguageDto): Promise<Language> {
    return this.languagesService.create(createLanguageDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_languages")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all languages" })
  @ApiResponse({ status: 200, description: "Return all languages.", type: [Language] })
  async findAll(): Promise<Language[]> {
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
  async findOne(@Param("code") code: string): Promise<Language> {
    const language = await this.languagesService.findOne(code);
    if (!language) {
      throw new HttpException("Language not found", HttpStatus.NOT_FOUND);
    }
    return language;
  }

  @Put(":code")
  @ApiOperation({ summary: "Update a language" })
  @ApiParam({ name: "code", type: "string", description: "Language code" })
  @ApiBody({ type: UpdateLanguageDto })
  @ApiResponse({ status: 200, description: "The language has been successfully updated.", type: Language })
  @ApiResponse({ status: 404, description: "Language not found." })
  async update(
    @Param("code") code: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<Language> {
    const language = await this.languagesService.update(code, updateLanguageDto);
    if (!language) {
      throw new HttpException("Language not found", HttpStatus.NOT_FOUND);
    }
    return language;
  }

  @Delete(":code")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a language" })
  @ApiParam({ name: "code", type: "string", description: "Language code" })
  @ApiResponse({ status: 204, description: "The language has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Language not found." })
  async remove(@Param("code") code: string): Promise<void> {
    const language = await this.languagesService.remove(code);
    if (!language) {
      throw new HttpException("Language not found", HttpStatus.NOT_FOUND);
    }
  }
}
