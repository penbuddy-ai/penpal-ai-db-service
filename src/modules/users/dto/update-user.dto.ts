import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEmail, IsObject, IsOptional, IsString } from "class-validator";

import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: "john.updated@example.com",
    description: "Updated email address of the user (optional)",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: "newpassword123",
    description: "Updated user password (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example: "Johnny",
    description: "Updated first name of the user (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: "Doeson",
    description: "Updated last name of the user (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: "https://example.com/updated-profile.jpg",
    description: "Updated URL to the user's profile picture (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({
    example: false,
    description: "Updated account status - active/inactive (optional)",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: true,
    description: "Updated verification status (optional)",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({
    example: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852", "6075a1fbca218f001c8f1853"],
    description: "Updated list of language IDs the user is learning (optional)",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningLanguages?: string[];

  @ApiProperty({
    example: "6075a1e5ca218f001c8f184f",
    description: "Updated ID of the user's native language (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @ApiProperty({
    example: {
      notifications: false,
      darkMode: true,
      language: "fr",
    },
    description: "Updated user preferences settings (optional)",
    required: false,
  })
  @IsOptional()
  @IsObject()
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };

  @ApiProperty({
    example: {
      averageResponseTime: 5.2,
      vocabularySize: 420,
      grammarAccuracy: 0.92,
    },
    description: "Updated user learning statistics (optional)",
    required: false,
  })
  @IsOptional()
  @IsObject()
  statistics?: {
    averageResponseTime: number;
    vocabularySize: number;
    grammarAccuracy: number;
  };

  @ApiProperty({
    example: "2023-04-15T12:00:00.000Z",
    description: "Updated timestamp of the user's last activity (optional)",
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActive?: Date;

  @ApiProperty({
    example: "inactive",
    description: "Updated user status (optional)",
    enum: ["active", "inactive", "suspended"],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    example: "2023-04-15T12:00:00.000Z",
    description: "Updated timestamp of the user's last login (optional)",
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLogin?: Date;
}
