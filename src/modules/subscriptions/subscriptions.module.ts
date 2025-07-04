import { HttpModule } from "@nestjs/axios";
import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { NotificationServiceClient } from "../../common/services/notification-service.client";
import { UsersModule } from "../users/users.module";
import { Subscription, SubscriptionSchema } from "./schemas/subscription.schema";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  imports: [
    HttpModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  providers: [SubscriptionsService, NotificationServiceClient, Logger],
  controllers: [SubscriptionsController],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
