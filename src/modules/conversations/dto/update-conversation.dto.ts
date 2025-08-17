import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class UpdateConversationDto {
  @ApiProperty({
    description: "AI Character ID participating in this conversation",
    example: "60d21b4667d0d8992e610c86",
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  aiCharacterId?: Types.ObjectId;

  @ApiProperty({
    description: "Language ID used in this conversation",
    example: "60d21b4667d0d8992e610c87",
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  languageId?: Types.ObjectId;

  @ApiProperty({
    example: "Learning about French cuisine",
    description: "Title of the conversation",
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: "archived",
    description: "Status of the conversation (active, archived, deleted)",
    enum: ["active", "archived", "deleted"],
    required: false,
  })
  @IsString()
  @IsEnum(["active", "archived", "deleted"])
  @IsOptional()
  status?: string;
}
