import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AICharacterDocument = AICharacter & Document;

@Schema()
export class AICharacter {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  personality: string;

  @Prop({ required: true })
  background: string;

  @Prop({ type: [String], required: true })
  languages: string[];

  @Prop()
  avatar?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AICharacterSchema = SchemaFactory.createForClass(AICharacter);

// Indexes
AICharacterSchema.index({ name: 1 });
AICharacterSchema.index({ languages: 1 });
