import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { RolesController } from "./roles.controller";
import { RoleService } from "./roles.service";
import { Role, RoleSchema } from "./schemas/role.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  providers: [RoleService, Logger],
  exports: [RoleService],
  controllers: [RolesController],
})
export class RolesModule {}
