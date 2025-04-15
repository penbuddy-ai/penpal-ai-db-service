import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsObject, IsOptional, IsString } from "class-validator";

import { CreateRoleDto } from "./create-role.dto";

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({
    example: "senior-moderator",
    description: "Updated unique name of the role",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: "Senior moderator role with expanded access",
    description: "Updated description of the role",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: {
      users: ["read", "list", "update"],
      conversations: ["read", "update", "delete", "list"],
      languages: ["read", "list", "create"],
      aiCharacters: ["read", "list", "update"],
    },
    description: "Updated object containing resource-based permissions",
    required: false,
  })
  @IsOptional()
  @IsObject()
  permissions?: Record<string, string[]>;

  @ApiProperty({
    example: false,
    description: "Updated status of whether the role is active",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: {
      level: 3,
      createdBy: "admin@penpal.ai",
      lastModifiedBy: "admin@penpal.ai",
    },
    description: "Updated additional metadata about the role",
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: {
    level: number;
    createdBy: string;
    lastModifiedBy: string;
  };
}
