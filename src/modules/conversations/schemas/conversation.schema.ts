import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ConversationDocument = Conversation & Document;

@Schema()
export class Conversation extends Document {
  @ApiProperty({
    description: "User ID who owns this conversation",
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    description: "AI Character ID participating in this conversation",
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "AICharacter", required: true })
  aiCharacterId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    description: "Language ID used in this conversation",
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Language", required: true })
  languageId: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: "Learning about French cuisine",
    description: "Title of the conversation",
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the conversation was created",
  })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({
    example: "2023-04-14T12:30:00.000Z",
    description: "Timestamp of the last message in this conversation",
  })
  @Prop({ default: Date.now })
  lastMessageAt: Date;

  @ApiProperty({
    example: 10,
    description: "Number of messages in this conversation",
  })
  @Prop({ default: 0 })
  messageCount: number;

  @ApiProperty({
    example: "active",
    description: "Status of the conversation (active, archived, deleted)",
    enum: ["active", "archived", "deleted"],
  })
  @Prop({ default: "active", enum: ["active", "archived", "deleted"] })
  status: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes
ConversationSchema.index({ userId: 1 });
ConversationSchema.index({ aiCharacterId: 1 });
ConversationSchema.index({ languageId: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ status: 1 });
