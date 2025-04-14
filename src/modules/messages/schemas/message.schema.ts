import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Conversation } from "../../conversations/schemas/conversation.schema";
import { User } from "../../users/schemas/user.schema";

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Conversation", required: true })
  conversationId: Conversation;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: User;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ["user", "ai"] })
  senderType: string;

  @Prop({ type: Object })
  metadata: {
    language: string;
    difficulty: number;
    grammarScore: number;
    vocabularyScore: number;
  };

  @Prop({ type: [String], default: [] })
  corrections: string[];

  @Prop({ type: Object })
  feedback: {
    rating: number;
    comment: string;
    timestamp: Date;
  };

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes
MessageSchema.index({ conversationId: 1 });
MessageSchema.index({ userId: 1 });
MessageSchema.index({ senderType: 1 });
MessageSchema.index({ createdAt: 1 });
MessageSchema.index({ "metadata.language": 1 });
