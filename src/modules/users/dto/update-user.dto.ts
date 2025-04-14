import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEmail, IsObject, IsOptional, IsString } from "class-validator";

import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningLanguages?: string[];

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsObject()
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };

  @IsOptional()
  @IsObject()
  statistics?: {
    averageResponseTime: number;
    vocabularySize: number;
    grammarAccuracy: number;
  };

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActive?: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLogin?: Date;
}
