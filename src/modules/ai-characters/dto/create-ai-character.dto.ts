import { IsString, IsNotEmpty, IsOptional, IsDate, IsArray } from 'class-validator';

export class CreateAICharacterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  personality: string;

  @IsString()
  @IsNotEmpty()
  background: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  languages: string[];

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
} 