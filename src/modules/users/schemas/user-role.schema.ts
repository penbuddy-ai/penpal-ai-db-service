import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

import { Role } from "../../roles/schemas/role.schema";
import { User } from "./user.schema";

export type UserRoleDocument = UserRole & Document;

@Schema({ timestamps: true })
export class UserRole {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Role", required: true })
  roleId: Role;

  @Prop({ default: Date.now })
  assignedAt: Date;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);
