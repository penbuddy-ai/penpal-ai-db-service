import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateAICharacterDto } from "./dto/create-ai-character.dto";
import { AICharacter, AICharacterDocument } from "./schemas/ai-character.schema";

@Injectable()
export class AICharacterService {
  constructor(
    @InjectModel(AICharacter.name) private readonly aiCharacterModel: Model<AICharacterDocument>,
    private readonly logger: Logger,
  ) {}

  async create(createAICharacterDto: CreateAICharacterDto): Promise<AICharacterDocument> {
    try {
      const existingCharacter = await this.findByName(createAICharacterDto.name);
      if (existingCharacter) {
        throw new ConflictException(`AI character with name ${createAICharacterDto.name} already exists`);
      }
      const createdAICharacter = new this.aiCharacterModel(createAICharacterDto);
      return createdAICharacter.save();
    }
    catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating AI character: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to create AI character");
    }
  }

  async findAll(): Promise<AICharacterDocument[]> {
    try {
      return this.aiCharacterModel.find().exec();
    }
    catch (error) {
      this.logger.error(`Error finding all AI characters: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve AI characters");
    }
  }

  async findOne(id: string): Promise<AICharacterDocument> {
    try {
      const character = await this.aiCharacterModel.findById(id).exec();
      if (!character) {
        throw new NotFoundException(`AI character with ID ${id} not found`);
      }
      return character;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding AI character: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve AI character");
    }
  }

  async findByName(name: string): Promise<AICharacterDocument | null> {
    try {
      return this.aiCharacterModel.findOne({ name }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding AI character by name: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve AI character by name");
    }
  }

  async update(id: string, updateAICharacterDto: Partial<CreateAICharacterDto>): Promise<AICharacterDocument> {
    try {
      const updatedCharacter = await this.aiCharacterModel.findByIdAndUpdate(id, updateAICharacterDto, { new: true }).exec();
      if (!updatedCharacter) {
        throw new NotFoundException(`AI character with ID ${id} not found`);
      }
      return updatedCharacter;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating AI character: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update AI character");
    }
  }

  async remove(id: string): Promise<AICharacterDocument> {
    try {
      const deletedCharacter = await this.aiCharacterModel.findByIdAndDelete(id).exec();
      if (!deletedCharacter) {
        throw new NotFoundException(`AI character with ID ${id} not found`);
      }
      return deletedCharacter;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing AI character: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to delete AI character");
    }
  }

  async findByLanguage(languageCode: string): Promise<AICharacterDocument[]> {
    try {
      return this.aiCharacterModel.find({ languages: { $in: [languageCode] } }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding AI characters by language: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve AI characters by language");
    }
  }
}
