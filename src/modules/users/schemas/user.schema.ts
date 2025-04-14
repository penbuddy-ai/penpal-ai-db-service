import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

import { Conversation } from "../../conversations/schemas/conversation.schema";
import { Language } from "../../languages/schemas/language.schema";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  profilePicture: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: "Language", default: [] })
  learningLanguages: Language[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Language" })
  nativeLanguage: Language;

  @Prop({ default: 0 })
  totalConversations: number;

  @Prop({ default: 0 })
  totalMessages: number;

  @Prop({ default: Date.now })
  lastActive: Date;

  @Prop({ default: "active", enum: ["active", "inactive", "suspended"] })
  status: string;

  @Prop({ type: Object })
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };

  @Prop({ type: Object })
  statistics: {
    averageResponseTime: number;
    vocabularySize: number;
    grammarAccuracy: number;
  };

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Conversation" }] })
  conversations: Conversation[];

  @Prop()
  lastLogin: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1 });
UserSchema.index({ lastActive: 1 });
UserSchema.index({ learningLanguages: 1 });
