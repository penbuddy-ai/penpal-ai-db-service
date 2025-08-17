import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class CreateLanguageDto {
  @ApiProperty({
    example: "fr",
    description: "ISO language code",
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: "French",
    description: "English name of the language",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "Français",
    description: "Name of the language in its native form",
    required: false,
  })
  @IsString()
  @IsOptional()
  nativeName?: string;

  @ApiProperty({
    example: true,
    description: "Whether the language is available for use in the application",
    default: false,
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

  @ApiProperty({
    example: {
      dictionaryUrl: "https://dictionary.example.com/french",
      grammarGuideUrl: "https://grammar.example.com/french",
      pronunciationGuideUrl: "https://pronunciation.example.com/french",
    },
    description: "External resources for learning the language",
    required: false,
  })
  @IsObject()
  @IsOptional()
  resources?: {
    dictionaryUrl: string;
    grammarGuideUrl: string;
    pronunciationGuideUrl: string;
  };
}
