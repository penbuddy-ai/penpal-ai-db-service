import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Role, RoleSchema } from "./schemas/role.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [MongooseModule],
})
export class RolesModule {}
