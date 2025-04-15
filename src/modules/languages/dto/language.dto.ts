import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateLanguageDto {
  @ApiProperty({
    example: "de",
    description: "ISO language code",
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: "German",
    description: "English name of the language",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "Deutsch",
    description: "Name of the language in its native form",
  })
  @IsString()
  @IsNotEmpty()
  nativeName: string;

  @ApiProperty({
    example: "🇩🇪",
    description: "Flag emoji for the language",
  })
  @IsString()
  flag: string;

  @ApiProperty({
    example: 3,
    description: "Difficulty level of the language (1-5)",
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty: number;

  @ApiProperty({
    example: true,
    description: "Whether the language is available for use in the application",
    default: false,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    example: {
      speakers: 100000000,
      family: "Germanic",
      writingSystem: "Latin",
    },
    description: "Additional metadata and statistics about the language",
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: {
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

export class UpdateLanguageDto {
  @ApiProperty({
    example: "New German",
    description: "Updated English name of the language",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "Neu Deutsch",
    description: "Updated name of the language in its native form",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nativeName?: string;

  @ApiProperty({
    example: "🇩🇪",
    description: "Updated flag emoji for the language",
    required: false,
  })
  @IsString()
  @IsOptional()
  flag?: string;

  @ApiProperty({
    example: 4,
    description: "Updated difficulty level of the language (1-5)",
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
    example: false,
    description: "Updated status of whether the language is active",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: {
      difficulty: 4,
      speakers: 120000000,
      family: "Germanic",
      writingSystem: "Latin",
    },
    description: "Updated metadata and statistics about the language",
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
    example: ["A1+", "A2+", "B1+", "B2+", "C1+", "C2+"],
    description: "Updated proficiency levels for this language",
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  availableLevels?: string[];
}
