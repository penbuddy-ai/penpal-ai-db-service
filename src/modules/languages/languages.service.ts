import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateLanguageDto } from "./dto/create-language.dto";
import { Language } from "./schemas/language.schema";

@Injectable()
export class LanguagesService {
  constructor(
    @InjectModel(Language.name) private readonly languageModel: Model<Language>,
  ) {}

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    const createdLanguage = new this.languageModel(createLanguageDto);
    return createdLanguage.save();
  }

  async findAll(): Promise<Language[]> {
    return this.languageModel.find().exec();
  }

  async findOne(id: string): Promise<Language | null> {
    return this.languageModel.findById(id).exec();
  }

  async findByCode(code: string): Promise<Language | null> {
    return this.languageModel.findOne({ code }).exec();
  }

  async update(id: string, updateLanguageDto: Partial<CreateLanguageDto>): Promise<Language | null> {
    return this.languageModel.findByIdAndUpdate(id, updateLanguageDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Language | null> {
    return this.languageModel.findByIdAndDelete(id).exec();
  }
}
