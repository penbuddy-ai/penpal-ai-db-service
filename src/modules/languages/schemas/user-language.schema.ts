import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

import { User } from "../../users/schemas/user.schema";
import { Language } from "./language.schema";

export type UserLanguageDocument = UserLanguage & Document;

@Schema({ timestamps: true })
export class UserLanguage {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Language", required: true })
  languageId: Language;

  @Prop({ default: "beginner", enum: ["beginner", "intermediate", "advanced", "fluent", "native"] })
  proficiency: string;

  @Prop({ default: Date.now })
  startedLearning: Date;

  @Prop({ default: 0 })
  experiencePoints: number;

  @Prop({ default: 1 })
  level: number;
}

export const UserLanguageSchema = SchemaFactory.createForClass(UserLanguage);
