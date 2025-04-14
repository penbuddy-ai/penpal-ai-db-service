import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleService } from "./roles.service";
import { Role } from "./schemas/role.schema";

@ApiTags("roles")
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RoleService) {}

  @Post()
  @ApiOperation({ summary: "Create a new role" })
  @ApiResponse({ status: 201, description: "The role has been successfully created.", type: Role })
  @ApiResponse({ status: 400, description: "Bad request." })
  @ApiBody({ type: CreateRoleDto })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_roles")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all roles" })
  @ApiResponse({ status: 200, description: "Return all roles.", type: [Role] })
  findAll() {
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
  async findOne(@Param("name") name: string) {
    const role = await this.rolesService.findByName(name);
    if (!role) {
      throw new HttpException("Role not found", HttpStatus.NOT_FOUND);
    }
    return role;
  }

  @Put(":name")
  @ApiOperation({ summary: "Update a role" })
  @ApiParam({ name: "name", type: "string", description: "Role name" })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: "The role has been successfully updated.", type: Role })
  @ApiResponse({ status: 404, description: "Role not found." })
  update(@Param("name") name: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(name, updateRoleDto);
  }

  @Delete(":name")
  @ApiOperation({ summary: "Delete a role" })
  @ApiParam({ name: "name", type: "string", description: "Role name" })
  @ApiResponse({ status: 200, description: "The role has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Role not found." })
  remove(@Param("name") name: string) {
    return this.rolesService.remove(name);
  }
}
