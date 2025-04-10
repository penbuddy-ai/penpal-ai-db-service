import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LanguageDocument = Language & Document;

@Schema()
export class Language {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nativeName: string;

  @Prop()
  flag: string;

  @Prop({ type: Number, default: 1 })
  difficulty: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
