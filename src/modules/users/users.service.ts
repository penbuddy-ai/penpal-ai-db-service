import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
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
    @InjectModel(UserRole.name) private readonly userRoleModel: Model<UserRoleDocument>,
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
      this.logger.error(`Error finding all users: ${error.message}`, error.stack);
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
      this.logger.error(`Error finding user by email: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to find user by email");
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await argon2.hash(updateUserDto.password);
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
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
      const existingUserRole = await this.userRoleModel.findOne({ userId, roleId }).exec();
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
      return await this.userRoleModel.find({ userId }).populate("roleId").exec();
    }
    catch (error) {
      this.logger.error(`Error getting user roles: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve user roles");
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    try {
      const result = await this.userRoleModel.deleteOne({ userId, roleId }).exec();
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
}
