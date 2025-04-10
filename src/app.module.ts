import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AICharactersModule } from "./modules/ai-characters/ai-characters.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { LanguagesModule } from "./modules/languages/languages.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { RolesModule } from "./modules/roles/roles.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    AICharactersModule,
    ConversationsModule,
    MessagesModule,
    LanguagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
