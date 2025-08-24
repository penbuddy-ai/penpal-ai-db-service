import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as argon2 from "argon2";
import { Model } from "mongoose";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole, UserRoleDocument } from "./schemas/user-role.schema";
import { User, UserDocument } from "./schemas/user.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserRole.name)
    private readonly userRoleModel: Model<UserRoleDocument>,
    private readonly logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException("User with this email already exists");
      }

      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    }
    catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to create user");
    }
  }

  async findAll(limit?: number, offset?: number): Promise<UserDocument[]> {
    try {
      let query = this.userModel.find();

      if (offset) {
        query = query.skip(offset);
      }

      if (limit) {
        query = query.limit(limit);
      }

      return await query.exec();
    }
    catch (error) {
      this.logger.error(
        `Error finding all users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException("Failed to retrieve users");
    }
  }

  async findOne(id: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding user: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve user");
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    }
    catch (error) {
      this.logger.error(
        `Error finding user by email: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException("Failed to find user by email");
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await argon2.hash(updateUserDto.password);
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update user");
    }
  }

  async remove(id: string): Promise<UserDocument> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return deletedUser;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing user: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to delete user");
    }
  }

  async assignRole(userId: string, roleId: string): Promise<UserRoleDocument> {
    try {
      const existingUserRole = await this.userRoleModel
        .findOne({ userId, roleId })
        .exec();
      if (existingUserRole) {
        throw new ConflictException("User already has this role");
      }

      const userRole = new this.userRoleModel({
        userId,
        roleId,
        assignedAt: new Date(),
      });
      return await userRole.save();
    }
    catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error assigning role: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to assign role to user");
    }
  }

  async getUserRoles(userId: string): Promise<UserRoleDocument[]> {
    try {
      return await this.userRoleModel
        .find({ userId })
        .populate("roleId")
        .exec();
    }
    catch (error) {
      this.logger.error(
        `Error getting user roles: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException("Failed to retrieve user roles");
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    try {
      const result = await this.userRoleModel
        .deleteOne({ userId, roleId })
        .exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException("User role not found");
      }
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing role: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to remove role from user");
    }
  }

  async updateSubscription(
    userId: string,
    subscriptionData: {
      plan: string;
      status: string;
      trialEnd?: Date;
    },
  ): Promise<UserDocument> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            subscriptionPlan: subscriptionData.plan,
            subscriptionStatus: subscriptionData.status,
            subscriptionTrialEnd: subscriptionData.trialEnd,
          },
          { new: true },
        )
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      this.logger.log(
        `Updated subscription for user ${userId}: ${subscriptionData.plan} (${subscriptionData.status})`,
      );
      return updatedUser;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating user subscription: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Failed to update user subscription",
      );
    }
  }

  /**
   * Update user onboarding progress
   */
  async updateOnboardingProgress(
    id: string,
    progressData: any,
  ): Promise<UserDocument> {
    this.logger.log(`Updating onboarding progress for user: ${id}`);

    try {
      const updateData: any = {};

      if (progressData.preferredName) {
        updateData.preferredName = progressData.preferredName;
      }

      if (progressData.learningLanguage) {
        updateData.learningLanguages = [progressData.learningLanguage];
      }

      if (progressData.proficiencyLevel && progressData.learningLanguage) {
        updateData.proficiencyLevels = {
          [progressData.learningLanguage]: progressData.proficiencyLevel,
        };
      }

      const user = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .exec();

      if (!user) {
        this.logger.warn(
          `User with ID ${id} not found for onboarding progress update`,
        );
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Onboarding progress updated for user: ${id}`);

      return user;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating onboarding progress for user ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Failed to update onboarding progress",
      );
    }
  }

  /**
   * Complete user onboarding
   */
  async completeOnboarding(
    id: string,
    onboardingData: any,
  ): Promise<UserDocument> {
    this.logger.log(`Completing onboarding for user: ${id}`);

    try {
      const updateData: any = {
        onboardingCompleted: true,
        ...onboardingData,
      };

      const user = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .exec();

      if (!user) {
        this.logger.warn(
          `User with ID ${id} not found for onboarding completion`,
        );
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Onboarding completed for user: ${id}`);

      return user;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error completing onboarding for user ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException("Failed to complete onboarding");
    }
  }

  /**
   * Get user onboarding status
   */
  async getOnboardingStatus(
    id: string,
  ): Promise<{ needsOnboarding: boolean; currentStep?: string }> {
    this.logger.log(`Checking onboarding status for user: ${id}`);

    try {
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        this.logger.warn(
          `User with ID ${id} not found for onboarding status check`,
        );
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const needsOnboarding = !user.onboardingCompleted;

      return {
        needsOnboarding,
        currentStep: needsOnboarding ? "preferred-name" : undefined,
      };
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error checking onboarding status for user ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Failed to check onboarding status",
      );
    }
  }

  /**
   * Get user metrics for monitoring
   */
  async getUserMetrics(): Promise<{
    activeUsers: number;
    totalUsers: number;
    usersByLanguage: Record<string, number>;
    averageUserLevel: Record<string, number>;
  }> {
    try {
      this.logger.log("Calculating user metrics for monitoring");

      // Calculate total users
      const totalUsers = await this.userModel.countDocuments({}).exec();

      // Calculate active users (users active in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsers = await this.userModel
        .countDocuments({
          lastActive: { $gte: thirtyDaysAgo },
        })
        .exec();

      // Get users by language with proficiency levels
      const users = await this.userModel
        .find({}, { learningLanguages: 1, proficiencyLevels: 1 })
        .populate("learningLanguages", "name code")
        .exec();

      const usersByLanguage: Record<string, number> = {};
      const languageLevels: Record<string, number[]> = {};

      // Process each user
      for (const user of users) {
        if (user.learningLanguages && Array.isArray(user.learningLanguages)) {
          for (const language of user.learningLanguages) {
            const languageName
              = (language as any).name || (language as any).code || "unknown";

            // Count users by language
            usersByLanguage[languageName]
              = (usersByLanguage[languageName] || 0) + 1;

            // Collect proficiency levels for average calculation
            if (
              user.proficiencyLevels
              && user.proficiencyLevels[languageName]
            ) {
              const levelString = user.proficiencyLevels[languageName];
              const levelNumber = this.convertLevelToNumber(levelString);

              if (!languageLevels[languageName]) {
                languageLevels[languageName] = [];
              }
              languageLevels[languageName].push(levelNumber);
            }
          }
        }
      }

      // Calculate average levels
      const averageUserLevel: Record<string, number> = {};
      for (const [language, levels] of Object.entries(languageLevels)) {
        if (levels.length > 0) {
          const sum = levels.reduce((acc, level) => acc + level, 0);
          averageUserLevel[language]
            = Math.round((sum / levels.length) * 100) / 100; // Round to 2 decimals
        }
      }

      this.logger.log(
        `User metrics calculated: ${totalUsers} total, ${activeUsers} active, ${Object.keys(usersByLanguage).length} languages`,
      );

      return {
        activeUsers,
        totalUsers,
        usersByLanguage,
        averageUserLevel,
      };
    }
    catch (error) {
      this.logger.error(
        `Error calculating user metrics: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Failed to calculate user metrics",
      );
    }
  }

  /**
   * Convert proficiency level string to number for calculations
   */
  private convertLevelToNumber(level: string): number {
    const levelMap: Record<string, number> = {
      "beginner": 1,
      "elementary": 2,
      "intermediate": 3,
      "upper-intermediate": 4,
      "advanced": 5,
      "proficient": 6,
      "native": 7,
    };

    return levelMap[level.toLowerCase()] || 1; // Default to beginner if unknown
  }
}
