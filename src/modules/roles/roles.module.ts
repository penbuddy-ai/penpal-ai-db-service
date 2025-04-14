import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { RoleService } from "./roles.service";
import { Role, RoleSchema } from "./schemas/role.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  providers: [RoleService],
  exports: [RoleService],
})
export class RolesModule {}
