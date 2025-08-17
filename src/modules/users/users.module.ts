import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { LanguagesModule } from "../languages/languages.module";
import { InternalUsersController } from "./controllers/internal-users.controller";
import { UserRole, UserRoleSchema } from "./schemas/user-role.schema";
import { User, UserSchema } from "./schemas/user.schema";
import { OAuthUserService } from "./services/oauth-user.service";
import { UsersController } from "./users.controller";
import { UserService } from "./users.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
    LanguagesModule,
  ],
  providers: [UserService, OAuthUserService, Logger],
  controllers: [UsersController, InternalUsersController],
  exports: [UserService, OAuthUserService],
})
export class UsersModule {}
