import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateUserDto } from "./dto/create-user.dto";
import { UserRole } from "./schemas/user-role.schema";
import { User } from "./schemas/user.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserRole.name) private readonly userRoleModel: Model<UserRole>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    let query = this.userModel.find();

    if (offset) {
      query = query.skip(offset);
    }

    if (limit) {
      query = query.limit(limit);
    }

    return query.exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async assignRole(userId: string, roleId: string): Promise<UserRole> {
    const userRole = new this.userRoleModel({
      userId,
      roleId,
      assignedAt: new Date(),
    });
    return userRole.save();
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoleModel.find({ userId }).populate("roleId").exec();
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.userRoleModel.deleteOne({ userId, roleId }).exec();
  }
}
