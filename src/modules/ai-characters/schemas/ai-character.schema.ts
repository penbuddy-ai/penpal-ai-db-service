import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type AICharacterDocument = AICharacter & Document;

@Schema()
export class AICharacter extends Document {
  @ApiProperty({
    example: "Professor Smith",
    description: "Name of the AI character",
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: "A friendly English professor who specializes in conversational practice",
    description: "Brief description of the AI character's role and purpose",
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: "Patient, encouraging, and slightly eccentric. Always tries to correct errors gently.",
    description: "Description of the character's personality traits",
  })
  @Prop({ required: true })
  personality: string;

  @ApiProperty({
    example: "Professor Smith has taught English at Oxford University for 20 years before becoming a digital language assistant.",
    description: "Character's backstory and historical context",
  })
  @Prop({ required: true })
  background: string;

  @ApiProperty({
    example: ["en", "fr", "es"],
    description: "List of language codes that this AI character can speak",
    type: [String],
  })
  @Prop({ type: [String], required: true })
  languages: string[];

  @ApiProperty({
    example: "https://example.com/avatars/professor-smith.jpg",
    description: "URL to the character's avatar image",
    required: false,
  })
  @Prop()
  avatar?: string;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the character was created",
  })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({
    example: "2023-04-15T12:00:00.000Z",
    description: "Timestamp when the character was last updated",
  })
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AICharacterSchema = SchemaFactory.createForClass(AICharacter);

// Indexes
AICharacterSchema.index({ name: 1 });
AICharacterSchema.index({ languages: 1 });
