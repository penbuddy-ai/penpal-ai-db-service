import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsBoolean, IsObject, IsNumber } from 'class-validator';
import { CreateAICharacterDto } from './create-ai-character.dto';

export class UpdateAICharacterDto extends PartialType(CreateAICharacterDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  personality?: string;

  @IsOptional()
  @IsString()
  backstory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsObject()
  prompt?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  languageProficiency?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
} 