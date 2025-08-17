import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateConversationDto {
  @ApiProperty({
    description: "User ID who owns this conversation",
    example: "60d21b4667d0d8992e610c85",
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @ApiProperty({
    description: "AI Character ID participating in this conversation",
    example: "60d21b4667d0d8992e610c86",
  })
  @IsMongoId()
  @IsNotEmpty()
  aiCharacterId: Types.ObjectId;

  @ApiProperty({
    description: "Language ID used in this conversation",
    example: "60d21b4667d0d8992e610c87",
  })
  @IsMongoId()
  @IsNotEmpty()
  languageId: Types.ObjectId;

  @ApiProperty({
    example: "Learning about French cuisine",
    description: "Title of the conversation",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: "active",
    description: "Status of the conversation (active, archived, deleted)",
    enum: ["active", "archived", "deleted"],
    default: "active",
  })
  @IsString()
  @IsEnum(["active", "archived", "deleted"])
  @IsOptional()
  status?: string;
}
