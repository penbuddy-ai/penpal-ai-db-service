import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateLanguageDto, UpdateLanguageDto } from "./dto/language.dto";
import { Language } from "./schemas/language.schema";

@Injectable()
export class LanguagesService {
  constructor(
    @InjectModel(Language.name) private languageModel: Model<Language>,
  ) {}

  async findAll(): Promise<Language[]> {
    return this.languageModel.find().exec();
  }

  async findOne(code: string): Promise<Language> {
    const language = await this.languageModel.findOne({ code }).exec();

    if (!language) {
      throw new NotFoundException(`Language with code ${code} not found`);
    }

    return language;
  }

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    const newLanguage = await this.languageModel.create(createLanguageDto);
    return newLanguage;
  }

  async update(code: string, updateLanguageDto: UpdateLanguageDto): Promise<Language> {
    const updatedLanguage = await this.languageModel
      .findOneAndUpdate({ code }, updateLanguageDto, { new: true })
      .exec();

    if (!updatedLanguage) {
      throw new NotFoundException(`Language with code ${code} not found`);
    }

    return updatedLanguage;
  }

  async remove(code: string): Promise<void> {
    const result = await this.languageModel.deleteOne({ code }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Language with code ${code} not found`);
    }
  }
}
