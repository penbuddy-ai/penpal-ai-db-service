import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateLanguageDto } from "./dto/create-language.dto";
import { UpdateLanguageDto } from "./dto/update-language.dto";
import { Language, LanguageDocument } from "./schemas/language.schema";

@Injectable()
export class LanguagesService {
  constructor(
    @InjectModel(Language.name) private readonly languageModel: Model<LanguageDocument>,
    private readonly logger: Logger,
  ) {}

  async create(createLanguageDto: CreateLanguageDto): Promise<LanguageDocument> {
    const existingLanguage = await this.findByCode(createLanguageDto.code);
    if (existingLanguage) {
      throw new ConflictException("Language with this code already exists.");
    }
    try {
      const createdLanguage = new this.languageModel(createLanguageDto);
      return createdLanguage.save();
    }
    catch (error) {
      this.logger.error(`Error creating language: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to create language.");
    }
  }

  async findAll(): Promise<LanguageDocument[]> {
    try {
      return await this.languageModel.find().exec();
    }
    catch (error) {
      this.logger.error(`Error finding all languages: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve languages.");
    }
  }

  async findOne(id: string): Promise<LanguageDocument> {
    try {
      const language = await this.languageModel.findById(id).exec();
      if (!language) {
        throw new NotFoundException(`Language with ID ${id} not found.`);
      }
      return language;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding language by ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve language.");
    }
  }

  async findByCode(code: string): Promise<LanguageDocument | null> {
    try {
      return await this.languageModel.findOne({ code }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding language by code: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve language by code.");
    }
  }

  async update(id: string, updateLanguageDto: UpdateLanguageDto): Promise<LanguageDocument> {
    try {
      const updatedLanguage = await this.languageModel.findByIdAndUpdate(id, updateLanguageDto, { new: true }).exec();
      if (!updatedLanguage) {
        throw new NotFoundException(`Language with ID ${id} not found.`);
      }
      return updatedLanguage;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating language: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update language.");
    }
  }

  async remove(id: string): Promise<LanguageDocument> {
    try {
      const deletedLanguage = await this.languageModel.findByIdAndDelete(id).exec();
      if (!deletedLanguage) {
        throw new NotFoundException(`Language with ID ${id} not found.`);
      }
      return deletedLanguage;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing language: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to delete language.");
    }
  }
}
