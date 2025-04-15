import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateRoleDto } from "./dto/create-role.dto";
import { Role, RoleDocument } from "./schemas/role.schema";

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    private readonly logger: Logger,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    try {
      const existingRole = await this.findByName(createRoleDto.name);
      if (existingRole) {
        throw new ConflictException(`Role with name ${createRoleDto.name} already exists`);
      }
      const createdRole = new this.roleModel(createRoleDto);
      return createdRole.save();
    }
    catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating role: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to create role");
    }
  }

  async findAll(): Promise<RoleDocument[]> {
    try {
      return this.roleModel.find().exec();
    }
    catch (error) {
      this.logger.error(`Error finding all roles: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve roles");
    }
  }

  async findOne(id: string): Promise<RoleDocument> {
    try {
      const role = await this.roleModel.findById(id).exec();
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      return role;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding role: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve role");
    }
  }

  async findByName(name: string): Promise<RoleDocument | null> {
    try {
      return this.roleModel.findOne({ name }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding role by name: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve role by name");
    }
  }

  async update(name: string, updateRoleDto: Partial<CreateRoleDto>): Promise<RoleDocument> {
    try {
      const role = await this.findByName(name);
      if (!role) {
        throw new NotFoundException(`Role with name ${name} not found`);
      }

      const updatedRole = await this.roleModel.findByIdAndUpdate(role._id, updateRoleDto, { new: true }).exec();
      if (!updatedRole) {
        throw new NotFoundException(`Role with ID ${role._id} not found`);
      }
      return updatedRole;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating role: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update role");
    }
  }

  async remove(name: string): Promise<RoleDocument> {
    try {
      const role = await this.findByName(name);
      if (!role) {
        throw new NotFoundException(`Role with name ${name} not found`);
      }

      const deletedRole = await this.roleModel.findByIdAndDelete(role._id).exec();
      if (!deletedRole) {
        throw new NotFoundException(`Role with ID ${role._id} not found`);
      }
      return deletedRole;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing role: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to delete role");
    }
  }
}
