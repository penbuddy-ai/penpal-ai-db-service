import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class CreateRoleDto {
  @ApiProperty({
    example: "moderator",
    description: "Unique name of the role",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "Content moderator role with limited access",
    description: "Description of the role and its purpose",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: {
      users: ["read", "list"],
      conversations: ["read", "update", "list"],
      languages: ["read", "list"],
      aiCharacters: ["read", "list"],
    },
    description: "Object containing resource-based permissions",
  })
  @IsObject()
  @IsNotEmpty()
  permissions: Record<string, string[]>;

  @ApiProperty({
    example: true,
    description: "Whether the role is currently active",
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: "Whether this is a system-defined role that cannot be modified by users",
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiProperty({
    example: {
      level: 2,
      createdBy: "admin@penpal.ai",
      lastModifiedBy: "admin@penpal.ai",
    },
    description: "Additional metadata about the role",
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: {
    level: number;
    createdBy: string;
    lastModifiedBy: string;
  };

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the role was created",
    required: false,
  })
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    example: "2023-04-14T12:00:00.000Z",
    description: "Timestamp when the role was last updated",
    required: false,
  })
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}
