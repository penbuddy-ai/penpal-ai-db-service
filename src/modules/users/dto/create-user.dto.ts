import { IsArray, IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningLanguages?: string[];

  @IsString()
  @IsOptional()
  nativeLanguage?: string;

  @IsDate()
  @IsOptional()
  lastActive?: Date;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };

  @IsOptional()
  statistics?: {
    averageResponseTime: number;
    vocabularySize: number;
    grammarAccuracy: number;
  };

  @IsDate()
  @IsOptional()
  lastLogin?: Date;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
