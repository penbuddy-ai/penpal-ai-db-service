import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

import { CreateAICharacterDto } from "./create-ai-character.dto";

export class UpdateAICharacterDto extends PartialType(CreateAICharacterDto) {
  @ApiProperty({
    example: "Professor Johnson",
    description: "Updated name of the AI character",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: "An enthusiastic language tutor specializing in grammar and vocabulary building",
    description: "Updated brief description of the AI character",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "https://example.com/avatars/professor-johnson.jpg",
    description: "Updated URL to the character's avatar image",
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    example: "Enthusiastic, detail-oriented, and passionate about proper grammar usage.",
    description: "Updated personality traits of the character",
    required: false,
  })
  @IsOptional()
  @IsString()
  personality?: string;

  @ApiProperty({
    example: "After 15 years teaching at Cambridge, Professor Johnson developed innovative language learning techniques.",
    description: "Updated backstory for the character",
    required: false,
  })
  @IsOptional()
  @IsString()
  backstory?: string;

  @ApiProperty({
    example: ["literature", "poetry", "grammar", "etymology"],
    description: "Updated list of interests for the character",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({
    example: ["en", "de", "it"],
    description: "Updated list of language codes this character can speak",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({
    example: {
      style: "formal",
      focusAreas: ["grammar", "vocabulary"],
      preferredTopics: ["literature", "academic writing"],
    },
    description: "Updated prompt configuration for the character's behavior",
    required: false,
  })
  @IsOptional()
  @IsObject()
  prompt?: Record<string, any>;

  @ApiProperty({
    example: 5,
    description: "Updated language proficiency level on a scale of 1-5",
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  languageProficiency?: number;

  @ApiProperty({
    example: true,
    description: "Updated status of whether the character is active",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: true,
    description: "Updated status of whether the character is featured",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
