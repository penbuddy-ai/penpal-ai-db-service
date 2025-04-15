import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Post, Put, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleService } from "./roles.service";
import { Role, RoleDocument } from "./schemas/role.schema";

@ApiTags("roles")
@Controller("roles")
export class RolesController {
  constructor(
    private readonly rolesService: RoleService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new role" })
  @ApiResponse({ status: 201, description: "The role has been successfully created.", type: Role })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 409, description: "Conflict - role with this name already exists." })
  @ApiResponse({ status: 500, description: "Internal server error during role creation." })
  @ApiBody({ type: CreateRoleDto })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    this.logger.log(`Creating new role with name: ${createRoleDto.name}`);
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_roles")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all roles" })
  @ApiResponse({ status: 200, description: "Return all roles.", type: [Role] })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving roles." })
  async findAll(): Promise<RoleDocument[]> {
    this.logger.log("Retrieving all roles");
    return this.rolesService.findAll();
  }

  @Get(":name")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("role_by_name")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get a role by name" })
  @ApiParam({ name: "name", type: "string", description: "Role name" })
  @ApiResponse({ status: 200, description: "Return the role.", type: Role })
  @ApiResponse({ status: 404, description: "Role not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving role." })
  async findOne(@Param("name") name: string): Promise<RoleDocument> {
    this.logger.log(`Retrieving role with name: ${name}`);
    const role = await this.rolesService.findByName(name);
    if (!role) {
      this.logger.warn(`Role with name ${name} not found`);
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    return role;
  }

  @Put(":name")
  @ApiOperation({ summary: "Update a role" })
  @ApiParam({ name: "name", type: "string", description: "Role name" })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: "The role has been successfully updated.", type: Role })
  @ApiResponse({ status: 404, description: "Role not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating role." })
  async update(@Param("name") name: string, @Body() updateRoleDto: UpdateRoleDto): Promise<RoleDocument> {
    this.logger.log(`Updating role with name: ${name}`);
    return this.rolesService.update(name, updateRoleDto);
  }

  @Delete(":name")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a role" })
  @ApiParam({ name: "name", type: "string", description: "Role name" })
  @ApiResponse({ status: 204, description: "The role has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Role not found." })
  @ApiResponse({ status: 500, description: "Internal server error while deleting role." })
  async remove(@Param("name") name: string): Promise<void> {
    this.logger.log(`Deleting role with name: ${name}`);
    await this.rolesService.remove(name);
  }
}
