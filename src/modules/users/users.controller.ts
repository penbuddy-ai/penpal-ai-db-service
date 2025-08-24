import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { ServiceAuthGuard } from "src/common/guards/service-auth.guard";

import { CreateUserDto } from "./dto/create-user.dto";
import {
  OnboardingProgressDto,
  UpdateOnboardingDto,
} from "./dto/update-onboarding.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserDocument } from "./schemas/user.schema";
import { UserService } from "./users.service";

@ApiTags("users")
@Controller("users")
@UseGuards(ServiceAuthGuard)
@ApiHeader({
  name: "x-api-key",
  description: "Clé API pour l'authentification inter-services",
  required: true,
})
@ApiHeader({
  name: "x-service-name",
  description: "Nom du service appelant (ex: auth-service)",
  required: true,
})
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "The user has been successfully created.",
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid input data.",
  })
  @ApiResponse({
    status: 409,
    description: "Conflict - user with this email already exists.",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error during user creation.",
  })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDocument> {
    this.logger.log(`Creating new user with email: ${createUserDto.email}`);
    return this.usersService.create(createUserDto);
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get user metrics for monitoring" })
  @ApiResponse({
    status: 200,
    description: "User metrics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        activeUsers: { type: "number" },
        totalUsers: { type: "number" },
        usersByLanguage: {
          type: "object",
          additionalProperties: { type: "number" },
        },
        averageUserLevel: {
          type: "object",
          additionalProperties: { type: "number" },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error while calculating metrics",
  })
  async getUserMetrics(): Promise<{
    activeUsers: number;
    totalUsers: number;
    usersByLanguage: Record<string, number>;
    averageUserLevel: Record<string, number>;
  }> {
    this.logger.log("Getting user metrics for monitoring");
    return this.usersService.getUserMetrics();
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_users")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "Return all users.", type: [User] })
  @ApiResponse({
    status: 500,
    description: "Internal server error while retrieving users.",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of users to return",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Number of users to skip",
  })
  async findAll(
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ): Promise<UserDocument[]> {
    this.logger.log(
      `Retrieving all users (limit: ${limit}, offset: ${offset})`,
    );
    return this.usersService.findAll(limit, offset);
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("user_by_id")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get a user by ID" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiResponse({ status: 200, description: "Return the user.", type: User })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiResponse({
    status: 500,
    description: "Internal server error while retrieving user.",
  })
  async findOne(@Param("id") id: string): Promise<UserDocument> {
    this.logger.log(`Retrieving user with ID: ${id}`);
    return this.usersService.findOne(id);
  }

  @Get("email/:email")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("user_by_email")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get a user by email" })
  @ApiParam({ name: "email", type: "string", description: "User email" })
  @ApiResponse({ status: 200, description: "Return the user.", type: User })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiResponse({
    status: 500,
    description: "Internal server error while retrieving user.",
  })
  async findByEmail(@Param("email") email: string): Promise<UserDocument> {
    this.logger.log(`Retrieving user with email: ${email}`);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a user" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully updated.",
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid input data.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiResponse({
    status: 500,
    description: "Internal server error while updating user.",
  })
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    this.logger.log(`Updating user with ID: ${id}`);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a user" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiResponse({
    status: 204,
    description: "The user has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiResponse({
    status: 500,
    description: "Internal server error while deleting user.",
  })
  async remove(@Param("id") id: string): Promise<void> {
    this.logger.log(`Deleting user with ID: ${id}`);
    await this.usersService.remove(id);
  }

  // Onboarding endpoints
  @Patch(":id/onboarding/progress")
  @ApiOperation({ summary: "Save user onboarding progress" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiBody({ type: OnboardingProgressDto })
  @ApiResponse({
    status: 200,
    description: "Onboarding progress saved successfully.",
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid input data.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async saveOnboardingProgress(
    @Param("id") id: string,
    @Body() progressDto: OnboardingProgressDto,
  ): Promise<UserDocument> {
    this.logger.log(`Saving onboarding progress for user: ${id}`);
    return this.usersService.updateOnboardingProgress(id, progressDto);
  }

  @Patch(":id/onboarding/complete")
  @ApiOperation({ summary: "Complete user onboarding" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiBody({ type: UpdateOnboardingDto })
  @ApiResponse({
    status: 200,
    description: "Onboarding completed successfully.",
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid input data.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async completeOnboarding(
    @Param("id") id: string,
    @Body() onboardingDto: UpdateOnboardingDto,
  ): Promise<UserDocument> {
    this.logger.log(`Completing onboarding for user: ${id}`);
    return this.usersService.completeOnboarding(id, onboardingDto);
  }

  @Get(":id/onboarding/status")
  @ApiOperation({ summary: "Check user onboarding status" })
  @ApiParam({ name: "id", type: "string", description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "Onboarding status retrieved.",
    schema: {
      type: "object",
      properties: {
        needsOnboarding: { type: "boolean" },
        currentStep: { type: "string", nullable: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: "User not found." })
  async getOnboardingStatus(
    @Param("id") id: string,
  ): Promise<{ needsOnboarding: boolean; currentStep?: string }> {
    this.logger.log(`Checking onboarding status for user: ${id}`);
    return this.usersService.getOnboardingStatus(id);
  }
}
