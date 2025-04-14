import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AICharacterService } from "./ai-characters.service";
import { AICharacter, AICharacterSchema } from "./schemas/ai-character.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AICharacter.name, schema: AICharacterSchema },
    ]),
  ],
  providers: [AICharacterService],
  controllers: [],
  exports: [AICharacterService],
})
export class AICharactersModule {}
