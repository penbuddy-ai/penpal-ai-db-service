import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserRole, UserRoleSchema } from "./schemas/user-role.schema";
import { User, UserSchema } from "./schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [MongooseModule],
})
export class UsersModule {}
