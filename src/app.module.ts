import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  InjectConnection,
  MongooseModule,
  MongooseModuleOptions,
} from "@nestjs/mongoose";
import { Connection } from "mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import cacheConfig from "./config/cache.config";
import { LoggerMiddleware } from "./middleware/logger.middleware";
import { AICharactersModule } from "./modules/ai-characters/ai-characters.module";
import { CacheModule } from "./modules/cache/cache.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { LanguagesModule } from "./modules/languages/languages.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cacheConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger("MongoDB");
        const mongoUri
          = configService.get<string>("MONGODB_URI")
            || "mongodb://localhost:27017/penpal-ai";
        const sanitizedMongoURI = mongoUri.replace(
          /\/\/([^:]+):([^@]+)@/,
          "//***:***@",
        );

        logger.log(`Configuring MongoDB connection: ${sanitizedMongoURI}`);

        const options: MongooseModuleOptions = {
          uri: mongoUri,
          user: configService.get<string>("MONGODB_USER"),
          pass: configService.get<string>("MONGODB_PASSWORD"),
          autoIndex: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          family: 4,
          maxPoolSize: 10,
          minPoolSize: 5,
          maxIdleTimeMS: 30000,
          connectTimeoutMS: 10000,
          retryWrites: true,
          retryReads: true,
          w: "majority",
          authSource: "admin",
          ssl: configService.get<string>("NODE_ENV") === "production",
        };

        return options;
      },
      inject: [ConfigService],
    }),
    CacheModule,
    UsersModule,
    RolesModule,
    AICharactersModule,
    ConversationsModule,
    MessagesModule,
    LanguagesModule,
    PaymentsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule, OnModuleInit {
  private readonly logger = new Logger("MongoDB");

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    if (this.connection.readyState === 1) {
      this.logger.log("✅ Successfully connected to MongoDB");

      try {
        // Get database stats to verify connection
        const db = this.connection.db;
        if (db) {
          const dbStats = await db.stats();
          const dbName = db.databaseName;
          if (dbStats && dbName) {
            this.logger.log(
              `Connected to database: ${dbName} (Collections: ${dbStats.collections}, Documents: ${dbStats.objects})`,
            );
          }
        }
      }
      catch (error) {
        this.logger.error(`Failed to get database stats: ${error.message}`);
      }
    }
    else {
      this.logger.error(
        `❌ Failed to connect to MongoDB. Connection state: ${this.connection.readyState}`,
      );
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "*path", method: RequestMethod.ALL });
  }
}
