import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AICharacterDocument = AICharacter & Document;

@Schema()
export class AICharacter {
  @Prop({ required: true })
  name: string;

  @Prop()
  avatar: string;

  @Prop({ type: [String], default: [] })
  languagesSpoken: string[];

  @Prop({ required: true })
  personality: string;

  @Prop()
  backstory: string;

  @Prop({ type: Object, default: {} })
  conversationStyle: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export const AICharacterSchema = SchemaFactory.createForClass(AICharacter);
