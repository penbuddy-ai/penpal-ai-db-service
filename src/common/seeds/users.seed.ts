import { PartialType } from "@nestjs/mapped-types";
import { User } from '../../modules/users/schemas/user.schema';

export const usersSeed: Partial<User>[] = [
  {
    email: 'admin@penpal.ai',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    isVerified: true,
    lastActive: new Date(),
    status: 'active',
    preferences: {
      notifications: true,
      darkMode: true,
      language: 'en'
    },
    statistics: {
      averageResponseTime: 0,
      vocabularySize: 0,
      grammarAccuracy: 0
    },
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: 'user@penpal.ai',
    password: 'user123',
    firstName: 'Regular',
    lastName: 'User',
    isActive: true,
    isVerified: true,
    lastActive: new Date(),
    status: 'active',
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en'
    },
    statistics: {
      averageResponseTime: 0,
      vocabularySize: 0,
      grammarAccuracy: 0
    },
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]; 