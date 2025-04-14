import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AICharacter } from './schemas/ai-character.schema';
import { CreateAICharacterDto } from './dto/create-ai-character.dto';

@Injectable()
export class AICharacterService {
  constructor(
    @InjectModel(AICharacter.name) private readonly aiCharacterModel: Model<AICharacter>,
  ) {}

  async create(createAICharacterDto: CreateAICharacterDto): Promise<AICharacter> {
    const createdAICharacter = new this.aiCharacterModel(createAICharacterDto);
    return createdAICharacter.save();
  }

  async findAll(): Promise<AICharacter[]> {
    return this.aiCharacterModel.find().exec();
  }

  async findOne(id: string): Promise<AICharacter | null> {
    return this.aiCharacterModel.findById(id).exec();
  }

  async findByName(name: string): Promise<AICharacter | null> {
    return this.aiCharacterModel.findOne({ name }).exec();
  }

  async update(id: string, updateAICharacterDto: Partial<CreateAICharacterDto>): Promise<AICharacter | null> {
    return this.aiCharacterModel.findByIdAndUpdate(id, updateAICharacterDto, { new: true }).exec();
  }

  async remove(id: string): Promise<AICharacter | null> {
    return this.aiCharacterModel.findByIdAndDelete(id).exec();
  }
} 