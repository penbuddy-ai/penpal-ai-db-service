import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Types } from "mongoose";

import { AppModule } from "../../app.module";
import { AICharacterService } from "../../modules/ai-characters/ai-characters.service";
import { LanguagesService } from "../../modules/languages/languages.service";
import { Language } from "../../modules/languages/schemas/language.schema";
import { RoleService } from "../../modules/roles/roles.service";
import { Role } from "../../modules/roles/schemas/role.schema";
import { CreateUserDto } from "../../modules/users/dto/create-user.dto";
import { User } from "../../modules/users/schemas/user.schema";
import { UserService } from "../../modules/users/users.service";
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
    const languageService = app.get(LanguagesService);
    const existingLanguages = await languageService.findAll();

    if (existingLanguages.length === 0) {
      logger.log("Seeding languages...");
      for (const language of languagesSeed) {
        await languageService.create(language);
      }
      logger.log(`✅ ${languagesSeed.length} languages seeded`);
    }
    else {
      logger.log("Languages collection already populated, skipping seed");
    }

    // Seed Roles
    const roleService = app.get(RoleService);
    const existingRoles = await roleService.findAll();

    if (existingRoles.length === 0) {
      logger.log("Seeding roles...");
      for (const role of rolesSeed) {
        await roleService.create(role);
      }
      logger.log(`✅ ${rolesSeed.length} roles seeded`);
    }
    else {
      logger.log("Roles collection already populated, skipping seed");
    }

    // Seed AI Characters
    const aiCharacterService = app.get(AICharacterService);
    const existingAICharacters = await aiCharacterService.findAll();

    if (existingAICharacters.length === 0) {
      logger.log("Seeding AI characters...");
      for (const character of aiCharactersSeed) {
        await aiCharacterService.create(character);
      }
      logger.log(`✅ ${aiCharactersSeed.length} AI characters seeded`);
    }
    else {
      logger.log("AI Characters collection already populated, skipping seed");
    }

    // Seed Admin User
    const userService = app.get(UserService);
    const existingAdmin = await userService.findByEmail("admin@penpal.ai");

    if (!existingAdmin) {
      logger.log("Seeding admin user...");
      const adminRole = await roleService.findByName("admin") as Role & { _id: Types.ObjectId };
      const frenchLanguage = await languageService.findByCode("fr") as Language & { _id: Types.ObjectId };
      const englishLanguage = await languageService.findByCode("en") as Language & { _id: Types.ObjectId };

      if (!adminRole || !frenchLanguage || !englishLanguage) {
        throw new Error("Required seed data not found");
      }

      const adminUser: CreateUserDto = {
        email: "admin@penpal.ai",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        isActive: true,
        isVerified: true,
        learningLanguages: [frenchLanguage._id.toString()],
        nativeLanguage: englishLanguage._id.toString(),
        lastActive: new Date(),
        status: "active",
        preferences: {
          notifications: true,
          darkMode: true,
          language: "en",
        },
        statistics: {
          averageResponseTime: 0,
          vocabularySize: 0,
          grammarAccuracy: 0,
        },
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdUser = await userService.create(adminUser) as User & { _id: Types.ObjectId };
      await userService.assignRole(createdUser._id.toString(), adminRole._id.toString());
      logger.log("✅ Admin user seeded");
    }
    else {
      logger.log("Admin user already exists, skipping seed");
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
