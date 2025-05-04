import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document, Schema as MongooseSchema } from "mongoose";

import { Conversation } from "../../conversations/schemas/conversation.schema";
import { Language } from "../../languages/schemas/language.schema";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({
    example: "6075a22bca218f001c8f1859",
    description: "The unique identifier of the user",
  })
  // _id est hérité de Document

  @ApiProperty({
    example: "john.doe@example.com",
    description: "The email address of the user",
  })
  @Prop({ required: true })
  email: string;

  @ApiProperty({
    example: "$2b$10$6KpvJ3hLMiy2taGUojZmEeTpgFmQLC4U1TAq.LME4GAgGiAwu2w5S",
    description: "The hashed password of the user",
    writeOnly: true,
  })
  @Prop({ required: false }) // Pas toujours requis pour OAuth
  password?: string;

  @ApiProperty({
    example: "John",
    description: "The first name of the user",
  })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({
    example: "Doe",
    description: "The last name of the user",
  })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({
    example: "https://example.com/profile.jpg",
    description: "URL to the user's profile picture",
  })
  @Prop()
  profilePicture: string;

  @ApiProperty({
    example: true,
    description: "Whether the user account is active",
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: "Whether the user's email has been verified",
  })
  @Prop({ default: false })
  isVerified: boolean;

  @ApiProperty({
    example: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852"],
    description: "IDs of languages the user is learning",
    type: [String],
  })
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: "Language", default: [] })
  learningLanguages: Language[];

  @ApiProperty({
    example: "6075a1e5ca218f001c8f184e",
    description: "ID of the user's native language",
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Language" })
  nativeLanguage: Language;

  @ApiProperty({
    example: 5,
    description: "Total number of conversations the user has participated in",
  })
  @Prop({ default: 0 })
  totalConversations: number;

  @ApiProperty({
    example: 42,
    description: "Total number of messages the user has sent",
  })
  @Prop({ default: 0 })
  totalMessages: number;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp of the user's last activity",
  })
  @Prop({ default: Date.now })
  lastActive: Date;

  @ApiProperty({
    example: "active",
    description: "The current status of the user account",
    enum: ["active", "inactive", "suspended"],
  })
  @Prop({ default: "active", enum: ["active", "inactive", "suspended"] })
  status: string;

  @ApiProperty({
    example: {
      notifications: true,
      darkMode: false,
      language: "en",
    },
    description: "User preferences settings",
  })
  @Prop({ type: Object })
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };

  @ApiProperty({
    example: {
      averageResponseTime: 4.5,
      vocabularySize: 350,
      grammarAccuracy: 0.85,
    },
    description: "User learning statistics",
  })
  @Prop({ type: Object })
  statistics: {
    averageResponseTime: number;
    vocabularySize: number;
    grammarAccuracy: number;
  };

  @ApiProperty({
    example: ["6075a22bca218f001c8f1870", "6075a22bca218f001c8f1871"],
    description: "IDs of conversations the user is participating in",
    type: [String],
  })
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Conversation" }] })
  conversations: Conversation[];

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp of the user's last login",
  })
  @Prop()
  lastLogin: Date;

  @ApiProperty({
    example: [{
      provider: "google",
      providerId: "123456789",
      email: "john.doe@gmail.com",
      displayName: "John Doe",
      photoURL: "https://lh3.googleusercontent.com/a/photo",
      accessToken: "ya29.a0Ae...",
      refreshToken: "1//0eXy...",
    }],
    description: "OAuth profiles linked to this user",
  })
  @Prop({ type: [Object], default: [] })
  oauthProfiles: {
    provider: string;
    providerId: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  }[];

  @ApiProperty({
    example: "local",
    description: "The primary auth method used by this user (local, google, facebook, etc.)",
    enum: ["local", "google", "facebook", "apple", "github"],
  })
  @Prop({ default: "local" })
  authMethod: string;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the user was created",
  })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the user was last updated",
  })
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ "oauthProfiles.provider": 1, "oauthProfiles.providerId": 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ lastActive: 1 });
UserSchema.index({ learningLanguages: 1 });
