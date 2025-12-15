import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AgenciesService } from './services/agencies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@wasilni/shared';

@Controller('api/v1/agencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  async findAll() {
    return this.agenciesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
  async findOne(@Param('id') id: string) {
    return this.agenciesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  async create(@Body() data: any) {
    return this.agenciesService.create(data);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.agenciesService.update(id, data);
  }

  @Post(':id/agents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
  async createAgent(@Param('id') id: string, @Body() agentData: any) {
    return this.agenciesService.createAgentAccount(id, agentData);
  }

  @Get(':id/agents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
  async getAgents(@Param('id') id: string) {
    return this.agenciesService.getAgencyAgents(id);
  }
}
