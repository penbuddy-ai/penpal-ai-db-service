import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

import { Conversation } from "../../conversations/schemas/conversation.schema";

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Conversation", required: true })
  conversationId: Conversation;

  @Prop({ required: true, enum: ["user", "ai"] })
  sender: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object, default: null })
  corrections: Record<string, any> | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
