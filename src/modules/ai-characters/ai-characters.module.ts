import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AICharacter, AICharacterSchema } from "./schemas/ai-character.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AICharacter.name, schema: AICharacterSchema },
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [MongooseModule],
})
export class AICharactersModule {}
