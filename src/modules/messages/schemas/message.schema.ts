import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document, Schema as MongooseSchema } from "mongoose";

export type MessageDocument = Message & Document;

@Schema()
export class Message extends Document {
  @ApiProperty({
    description: "Conversation ID this message belongs to",
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Conversation", required: true })
  conversationId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: "user",
    description: "Sender of the message (user or ai)",
    enum: ["user", "ai"],
  })
  @Prop({ required: true, enum: ["user", "ai"] })
  sender: string;

  @ApiProperty({
    example: "Hello! How are you today?",
    description: "Content of the message",
  })
  @Prop({ required: true })
  content: string;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the message was sent",
  })
  @Prop({ default: Date.now })
  timestamp: Date;

  @ApiProperty({
    example: true,
    description: "Whether the message has been read",
  })
  @Prop({ default: false })
  isRead: boolean;

  @ApiProperty({
    example: {
      grammar: ["Error 1", "Error 2"],
      vocabulary: ["Suggestion 1"],
      pronunciation: [],
    },
    description: "Corrections and suggestions for language learning",
    required: false,
  })
  @Prop({ type: Object, default: {} })
  corrections?: Record<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes
MessageSchema.index({ conversationId: 1 });
MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ sender: 1 });
