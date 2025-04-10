import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { LanguagesController } from "./languages.controller";
import { LanguagesService } from "./languages.service";
import { Language, LanguageSchema } from "./schemas/language.schema";
import { UserLanguage, UserLanguageSchema } from "./schemas/user-language.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Language.name, schema: LanguageSchema },
      { name: UserLanguage.name, schema: UserLanguageSchema },
    ]),
  ],
  providers: [LanguagesService],
  controllers: [LanguagesController],
  exports: [MongooseModule, LanguagesService],
})
export class LanguagesModule {}
