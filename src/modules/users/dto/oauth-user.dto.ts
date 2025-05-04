import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

class OAuthProfileDto {
  @ApiProperty({ example: "google", description: "OAuth provider name" })
  @IsString()
  @IsNotEmpty()
  @IsEnum(["google", "facebook", "apple", "github"])
  provider: string;

  @ApiProperty({ example: "123456789", description: "User ID from the provider" })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({ example: "user@example.com", description: "User email from the provider" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "John Doe", description: "Display name from the provider" })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({ example: "https://example.com/photo.jpg", description: "Profile picture URL" })
  @IsString()
  @IsOptional()
  photoURL?: string;
}

export class OAuthUserDto {
  @ApiProperty({ description: "OAuth profile data" })
  @ValidateNested()
  @Type(() => OAuthProfileDto)
  profile: OAuthProfileDto;

  @ApiProperty({ example: "John", description: "User's first name" })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: "Doe", description: "User's last name" })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: "fr", description: "User's native language code" })
  @IsString()
  @IsOptional()
  nativeLanguageCode?: string;

  @ApiProperty({ example: ["en", "es"], description: "Language codes user wants to learn" })
  @IsString({ each: true })
  @IsOptional()
  learningLanguageCodes?: string[];
}
