import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./schemas/user.schema";
import { UserService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "The user has been successfully created.",
    type: User,
    schema: {
      example: {
        _id: "6075a22bca218f001c8f1859",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        profilePicture: "https://example.com/profile.jpg",
        isActive: true,
        isVerified: true,
        learningLanguages: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852"],
        nativeLanguage: "6075a1e5ca218f001c8f184e",
        totalConversations: 0,
        totalMessages: 0,
        lastActive: "2023-04-14T12:00:00.000Z",
        status: "active",
        preferences: {
          notifications: true,
          darkMode: false,
          language: "en",
        },
        statistics: {
          averageResponseTime: 0,
          vocabularySize: 0,
          grammarAccuracy: 0,
        },
        createdAt: "2023-04-14T12:00:00.000Z",
        updatedAt: "2023-04-14T12:00:00.000Z",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Bad request." })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      standard: {
        value: {
          email: "john.doe@example.com",
          password: "password123",
          firstName: "John",
          lastName: "Doe",
          profilePicture: "https://example.com/profile.jpg",
          isActive: true,
          isVerified: true,
          learningLanguages: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852"],
          nativeLanguage: "6075a1e5ca218f001c8f184e",
          status: "active",
          preferences: {
            notifications: true,
            darkMode: false,
            language: "en",
          },
        },
        summary: "Standard user creation",
      },
      minimal: {
        value: {
          email: "jane.doe@example.com",
          password: "password123",
          firstName: "Jane",
          lastName: "Doe",
        },
        summary: "Minimal user creation",
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_users")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({
    status: 200,
    description: "Return all users.",
    type: [User],
    schema: {
      example: [
        {
          _id: "6075a22bca218f001c8f1859",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          profilePicture: "https://example.com/profile.jpg",
          isActive: true,
          isVerified: true,
          learningLanguages: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852"],
          nativeLanguage: "6075a1e5ca218f001c8f184e",
          totalConversations: 2,
          totalMessages: 25,
          lastActive: "2023-04-14T12:00:00.000Z",
          status: "active",
          preferences: {
            notifications: true,
            darkMode: false,
            language: "en",
          },
          statistics: {
            averageResponseTime: 4.5,
            vocabularySize: 350,
            grammarAccuracy: 0.85,
          },
          createdAt: "2023-04-14T12:00:00.000Z",
          updatedAt: "2023-04-14T12:00:00.000Z",
        },
        {
          _id: "6075a22bca218f001c8f1860",
          email: "jane.doe@example.com",
          firstName: "Jane",
          lastName: "Doe",
          isActive: true,
          isVerified: false,
          learningLanguages: ["6075a1f3ca218f001c8f1850"],
          nativeLanguage: "6075a1e5ca218f001c8f184f",
          totalConversations: 1,
          totalMessages: 10,
          lastActive: "2023-04-14T14:30:00.000Z",
          status: "active",
          createdAt: "2023-04-14T14:00:00.000Z",
          updatedAt: "2023-04-14T14:30:00.000Z",
        },
      ],
    },
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of users to return",
    example: 10,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Number of users to skip",
    example: 0,
  })
  findAll(@Query("limit") limit?: number, @Query("offset") offset?: number) {
    return this.usersService.findAll(limit, offset);
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("user_by_id")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get a user by ID" })
  @ApiParam({
    name: "id",
    type: "string",
    description: "User ID",
    example: "6075a22bca218f001c8f1859",
  })
  @ApiResponse({
    status: 200,
    description: "Return the user.",
    type: User,
    schema: {
      example: {
        _id: "6075a22bca218f001c8f1859",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        profilePicture: "https://example.com/profile.jpg",
        isActive: true,
        isVerified: true,
        learningLanguages: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852"],
        nativeLanguage: "6075a1e5ca218f001c8f184e",
        totalConversations: 2,
        totalMessages: 25,
        lastActive: "2023-04-14T12:00:00.000Z",
        status: "active",
        preferences: {
          notifications: true,
          darkMode: false,
          language: "en",
        },
        statistics: {
          averageResponseTime: 4.5,
          vocabularySize: 350,
          grammarAccuracy: 0.85,
        },
        createdAt: "2023-04-14T12:00:00.000Z",
        updatedAt: "2023-04-14T12:00:00.000Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
    schema: {
      example: {
        statusCode: 404,
        message: "User not found",
        error: "Not Found",
      },
    },
  })
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Get("email/:email")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("user_by_email")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get a user by email" })
  @ApiParam({
    name: "email",
    type: "string",
    description: "User email",
    example: "john.doe@example.com",
  })
  @ApiResponse({
    status: 200,
    description: "Return the user.",
    type: User,
    schema: {
      example: {
        _id: "6075a22bca218f001c8f1859",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        profilePicture: "https://example.com/profile.jpg",
        isActive: true,
        isVerified: true,
        learningLanguages: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852"],
        nativeLanguage: "6075a1e5ca218f001c8f184e",
        totalConversations: 2,
        totalMessages: 25,
        lastActive: "2023-04-14T12:00:00.000Z",
        status: "active",
        preferences: {
          notifications: true,
          darkMode: false,
          language: "en",
        },
        statistics: {
          averageResponseTime: 4.5,
          vocabularySize: 350,
          grammarAccuracy: 0.85,
        },
        createdAt: "2023-04-14T12:00:00.000Z",
        updatedAt: "2023-04-14T12:00:00.000Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
    schema: {
      example: {
        statusCode: 404,
        message: "User not found",
        error: "Not Found",
      },
    },
  })
  async findByEmail(@Param("email") email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a user" })
  @ApiParam({
    name: "id",
    type: "string",
    description: "User ID",
    example: "6075a22bca218f001c8f1859",
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      full: {
        value: {
          firstName: "Johnny",
          lastName: "Doeson",
          profilePicture: "https://example.com/new-profile.jpg",
          isActive: true,
          isVerified: true,
          learningLanguages: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852", "6075a1fbca218f001c8f1853"],
          nativeLanguage: "6075a1e5ca218f001c8f184e",
          status: "active",
          preferences: {
            notifications: false,
            darkMode: true,
            language: "fr",
          },
        },
        summary: "Update multiple fields",
      },
      partial: {
        value: {
          firstName: "Johnny",
          lastName: "Doeson",
        },
        summary: "Update name only",
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully updated.",
    type: User,
    schema: {
      example: {
        _id: "6075a22bca218f001c8f1859",
        email: "john.doe@example.com",
        firstName: "Johnny",
        lastName: "Doeson",
        profilePicture: "https://example.com/new-profile.jpg",
        isActive: true,
        isVerified: true,
        learningLanguages: ["6075a1f3ca218f001c8f1850", "6075a1faca218f001c8f1852", "6075a1fbca218f001c8f1853"],
        nativeLanguage: "6075a1e5ca218f001c8f184e",
        totalConversations: 2,
        totalMessages: 25,
        lastActive: "2023-04-14T12:00:00.000Z",
        status: "active",
        preferences: {
          notifications: false,
          darkMode: true,
          language: "fr",
        },
        statistics: {
          averageResponseTime: 4.5,
          vocabularySize: 350,
          grammarAccuracy: 0.85,
        },
        createdAt: "2023-04-14T12:00:00.000Z",
        updatedAt: "2023-04-15T10:30:00.000Z",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
    schema: {
      example: {
        statusCode: 404,
        message: "User not found",
        error: "Not Found",
      },
    },
  })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  @ApiParam({
    name: "id",
    type: "string",
    description: "User ID",
    example: "6075a22bca218f001c8f1859",
  })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully deleted.",
    schema: {
      example: {
        _id: "6075a22bca218f001c8f1859",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
    schema: {
      example: {
        statusCode: 404,
        message: "User not found",
        error: "Not Found",
      },
    },
  })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
