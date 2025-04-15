import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

import { AICharacter } from "../../ai-characters/schemas/ai-character.schema";
import { Language } from "../../languages/schemas/language.schema";
import { User } from "../../users/schemas/user.schema";

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "AICharacter", required: true })
  aiCharacterId: AICharacter;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Language", required: true })
  languageId: Language;

  @Prop({ required: true })
  title: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  lastMessageAt: Date;

  @Prop({ default: 0 })
  messageCount: number;

  @Prop({ default: "active", enum: ["active", "archived", "deleted"] })
  status: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
