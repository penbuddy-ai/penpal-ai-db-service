import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type LanguageDocument = Language & Document;

@Schema({ timestamps: true })
export class Language extends Document {
  @ApiProperty({
    example: "en",
    description: "ISO language code",
  })
  @Prop({ required: true })
  code: string;

  @ApiProperty({
    example: "English",
    description: "English name of the language",
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: "English",
    description: "Name of the language in its native form",
  })
  @Prop({ required: true })
  nativeName: string;

  @ApiProperty({
    example: true,
    description: "Whether the language is available for use in the application",
    default: false,
  })
  @Prop({ default: false })
  isActive: boolean;

  @ApiProperty({
    example: {
      difficulty: 2,
      speakers: 1200000000,
      family: "Germanic",
      writingSystem: "Latin",
    },
    description: "Additional metadata and statistics about the language",
  })
  @Prop({ type: Object })
  metadata: {
    difficulty: number;
    speakers: number;
    family: string;
    writingSystem: string;
  };

  @ApiProperty({
    example: ["A1", "A2", "B1", "B2", "C1", "C2"],
    description: "Available proficiency levels for this language",
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  availableLevels: string[];

  @ApiProperty({
    example: {
      dictionaryUrl: "https://dictionary.example.com/english",
      grammarGuideUrl: "https://grammar.example.com/english",
      pronunciationGuideUrl: "https://pronunciation.example.com/english",
    },
    description: "External resources for learning the language",
  })
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
