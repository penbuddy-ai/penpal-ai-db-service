import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsObject, IsOptional, IsString } from "class-validator";

export class UpdateMessageDto {
  @ApiProperty({
    example: "Hello! I've edited this message.",
    description: "Updated content of the message",
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: true,
    description: "Whether the message has been read",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({
    example: {
      grammar: ["Error 1", "Error 2"],
      vocabulary: ["Suggestion 1"],
      pronunciation: [],
    },
    description: "Updated corrections and suggestions for language learning",
    required: false,
  })
  @IsObject()
  @IsOptional()
  corrections?: Record<string, any>;
}
