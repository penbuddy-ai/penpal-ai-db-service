import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, required: true })
  permissions: Record<string, string[]>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ type: Object })
  metadata: {
    level: number;
    createdBy: string;
    lastModifiedBy: string;
  };
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Indexes
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ isActive: 1 });
