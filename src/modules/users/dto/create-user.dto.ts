import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: "john.doe@example.com",
    description: "Email address of the user (required)",
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "password123",
    description: "User password - minimum 6 characters (required)",
    minLength: 6,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: "John",
    description: "First name of the user (required)",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: "Doe",
    description: "Last name of the user (required)",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: "https://example.com/profile.jpg",
    description: "URL to the user's profile picture (optional)",
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    example: true,
    description: "Whether the user account is active (optional)",
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: "Whether the user's email has been verified (optional)",
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({
    example: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852"],
    description: "IDs of languages the user is learning (optional)",
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningLanguages?: string[];

  @ApiProperty({
    example: "6075a1e5ca218f001c8f184e",
    description: "ID of the user's native language (optional)",
    required: false,
  })
  @IsString()
  @IsOptional()
  nativeLanguage?: string;

  @ApiProperty({
    example: "active",
    description: "The current status of the user account (optional)",
    enum: ["active", "inactive", "suspended"],
    default: "active",
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: {
      notifications: true,
      darkMode: false,
      language: "en",
    },
    description: "User preferences settings (optional)",
    required: false,
  })
  @IsOptional()
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };

  @ApiProperty({
    example: {
      averageResponseTime: 0,
      vocabularySize: 0,
      grammarAccuracy: 0,
    },
    description: "User learning statistics (optional)",
    required: false,
  })
  @IsOptional()
  statistics?: {
    averageResponseTime: number;
    vocabularySize: number;
    grammarAccuracy: number;
  };
}
