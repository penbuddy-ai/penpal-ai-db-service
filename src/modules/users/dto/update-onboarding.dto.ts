import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

/**
 * DTO for updating user onboarding data
 */
export class UpdateOnboardingDto {
  @ApiProperty({
    description: "User preferred name",
    example: "Marie",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  preferredName?: string;

  @ApiProperty({
    description: "Learning languages array",
    example: ["en", "es"],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningLanguages?: string[];

  @ApiProperty({
    description: "Proficiency levels for each language",
    example: { en: "intermediate", es: "beginner" },
    required: false,
  })
  @IsOptional()
  @IsObject()
  proficiencyLevels?: Record<string, string>;

  @ApiProperty({
    description: "Whether onboarding is completed",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;
}

/**
 * DTO for onboarding progress (partial update)
 */
export class OnboardingProgressDto {
  @ApiProperty({
    description: "User preferred name",
    example: "Marie",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  preferredName?: string;

  @ApiProperty({
    description: "Selected learning language",
    example: "en",
    required: false,
  })
  @IsOptional()
  @IsString()
  learningLanguage?: string;

  @ApiProperty({
    description: "Proficiency level",
    example: "intermediate",
    required: false,
  })
  @IsOptional()
  @IsString()
  proficiencyLevel?: "beginner" | "intermediate" | "advanced";
}
