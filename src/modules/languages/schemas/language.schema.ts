import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LanguageDocument = Language & Document;

@Schema({ timestamps: true })
export class Language extends Document {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nativeName: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: Object })
  metadata: {
    difficulty: number;
    speakers: number;
    family: string;
    writingSystem: string;
  };

  @Prop({ type: [String], default: [] })
  availableLevels: string[];

  @Prop({ type: Object })
  resources: {
    dictionaryUrl: string;
    grammarGuideUrl: string;
    pronunciationGuideUrl: string;
  };
}

export const LanguageSchema = SchemaFactory.createForClass(Language);

// Indexes
LanguageSchema.index({ code: 1 }, { unique: true });
LanguageSchema.index({ name: 1 });
LanguageSchema.index({ isActive: 1 });
