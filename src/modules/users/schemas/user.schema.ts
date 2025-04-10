import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

import { Conversation } from "../../conversations/schemas/conversation.schema";
import { Role } from "../../roles/schemas/role.schema";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

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

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Role" }] })
  roleIds: Role[];

  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Conversation" }] })
  conversations: Conversation[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
