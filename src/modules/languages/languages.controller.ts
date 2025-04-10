import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";

import { CreateLanguageDto, UpdateLanguageDto } from "./dto/language.dto";
import { LanguagesService } from "./languages.service";
import { Language } from "./schemas/language.schema";

@Controller("languages")
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  async findAll(): Promise<Language[]> {
    return this.languagesService.findAll();
  }

  @Get(":code")
  async findOne(@Param("code") code: string): Promise<Language> {
    return this.languagesService.findOne(code);
  }

  @Post()
  async create(@Body() createLanguageDto: CreateLanguageDto): Promise<Language> {
    return this.languagesService.create(createLanguageDto);
  }

  @Put(":code")
  async update(
    @Param("code") code: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<Language> {
    return this.languagesService.update(code, updateLanguageDto);
  }

  @Delete(":code")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("code") code: string): Promise<void> {
    return this.languagesService.remove(code);
  }
}
