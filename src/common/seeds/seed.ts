import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { AppModule } from "../../app.module";
import { aiCharactersSeed } from "./ai-characters.seed";
import { languagesSeed } from "./languages.seed";
import { rolesSeed } from "./roles.seed";

/**
 * Script to seed the database with initial data
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("SeedScript");

  try {
    logger.log("Seeding database...");

    // Seed Languages
    const languageModel = app.get<Model<any>>(getModelToken("Language"));
    const existingLanguages = await languageModel.countDocuments();

    if (existingLanguages === 0) {
      logger.log("Seeding languages...");
      await languageModel.insertMany(languagesSeed);
      logger.log(`✅ ${languagesSeed.length} languages seeded`);
    }
    else {
      logger.log("Languages collection already populated, skipping seed");
    }

    // Seed Roles
    const roleModel = app.get<Model<any>>(getModelToken("Role"));
    const existingRoles = await roleModel.countDocuments();

    if (existingRoles === 0) {
      logger.log("Seeding roles...");
      await roleModel.insertMany(rolesSeed);
      logger.log(`✅ ${rolesSeed.length} roles seeded`);
    }
    else {
      logger.log("Roles collection already populated, skipping seed");
    }

    // Seed AI Characters
    const aiCharacterModel = app.get<Model<any>>(getModelToken("AICharacter"));
    const existingAICharacters = await aiCharacterModel.countDocuments();

    if (existingAICharacters === 0) {
      logger.log("Seeding AI characters...");
      await aiCharacterModel.insertMany(aiCharactersSeed);
      logger.log(`✅ ${aiCharactersSeed.length} AI characters seeded`);
    }
    else {
      logger.log("AI Characters collection already populated, skipping seed");
    }

    logger.log("✅ Database seeding completed");
  }
  catch (error) {
    logger.error("❌ Error seeding database");
    logger.error(error);
  }
  finally {
    await app.close();
  }
}

bootstrap();
