import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Conversation, ConversationSchema } from "./schemas/conversation.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [MongooseModule],
})
export class ConversationsModule {}
