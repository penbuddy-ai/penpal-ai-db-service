import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateMessageDto {
  @ApiProperty({
    description: "Conversation ID this message belongs to",
    example: "60d21b4667d0d8992e610c85",
  })
  @IsMongoId()
  @IsNotEmpty()
  conversationId: Types.ObjectId;

  @ApiProperty({
    example: "user",
    description: "Sender of the message (user or ai)",
    enum: ["user", "ai"],
  })
  @IsString()
  @IsEnum(["user", "ai"])
  @IsNotEmpty()
  sender: string;

  @ApiProperty({
    example: "Hello! How are you today?",
    description: "Content of the message",
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: {
      grammar: ["Error 1", "Error 2"],
      vocabulary: ["Suggestion 1"],
      pronunciation: [],
    },
    description: "Corrections and suggestions for language learning",
    required: false,
  })
  @IsObject()
  @IsOptional()
  corrections?: Record<string, any>;
}
