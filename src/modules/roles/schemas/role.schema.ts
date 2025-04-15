import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @ApiProperty({
    example: "admin",
    description: "Unique name of the role",
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: "Administrator role with full access",
    description: "Description of the role and its purpose",
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    example: {
      users: ["create", "read", "update", "delete", "list"],
      roles: ["create", "read", "update", "delete", "list"],
      conversations: ["create", "read", "update", "delete", "list"],
    },
    description: "Object containing resource-based permissions",
  })
  @Prop({ type: Object, required: true })
  permissions: Record<string, string[]>;

  @ApiProperty({
    example: true,
    description: "Whether the role is currently active",
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: "Whether this is a system-defined role that cannot be modified by users",
    default: false,
  })
  @Prop({ default: false })
  isSystem: boolean;

  @ApiProperty({
    example: {
      level: 1,
      createdBy: "system",
      lastModifiedBy: "admin@penpal.ai",
    },
    description: "Additional metadata about the role",
  })
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
