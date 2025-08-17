import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAICharacterDto {
  @ApiProperty({
    example: "Professor Smith",
    description: "Name of the AI character",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "A friendly English professor who specializes in conversational practice",
    description: "Brief description of the AI character's role and purpose",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: "Patient, encouraging, and slightly eccentric. Always tries to correct errors gently.",
    description: "Description of the character's personality traits",
  })
  @IsString()
  @IsNotEmpty()
  personality: string;

  @ApiProperty({
    example: "Professor Smith has taught English at Oxford University for 20 years before becoming a digital language assistant.",
    description: "Character's backstory and historical context",
  })
  @IsString()
  @IsNotEmpty()
  background: string;

  @ApiProperty({
    example: ["en", "fr", "es"],
    description: "List of language codes that this AI character can speak",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  languages: string[];

  @ApiProperty({
    example: "https://example.com/avatars/professor-smith.jpg",
    description: "URL to the character's avatar image",
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the character was created",
    required: false,
  })
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the character was last updated",
    required: false,
  })
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
