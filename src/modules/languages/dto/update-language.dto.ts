import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateLanguageDto {
  @ApiProperty({
    example: "French",
    description: "English name of the language",
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "Français",
    description: "Name of the language in its native form",
    required: false,
  })
  @IsString()
  @IsOptional()
  nativeName?: string;

  @ApiProperty({
    example: "🇫🇷",
    description: "Flag emoji for the language",
    required: false,
  })
  @IsString()
  @IsOptional()
  flag?: string;

  @ApiProperty({
    example: 3,
    description: "Difficulty level of the language (1-5)",
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficulty?: number;

  @ApiProperty({
    example: true,
    description: "Whether the language is available for use in the application",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: {
      difficulty: 3,
      speakers: 275000000,
      family: "Romance",
      writingSystem: "Latin",
    },
    description: "Additional metadata and statistics about the language",
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: {
    difficulty: number;
    speakers: number;
    family: string;
    writingSystem: string;
  };

  @ApiProperty({
    example: ["A1", "A2", "B1", "B2", "C1", "C2"],
    description: "Available proficiency levels for this language",
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  availableLevels?: string[];
}
