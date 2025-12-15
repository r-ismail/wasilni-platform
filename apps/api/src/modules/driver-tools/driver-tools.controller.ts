import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { HeatmapService } from './services/heatmap.service';
import { DestinationModeService } from './services/destination-mode.service';
import { UserRole } from '@wasilni/shared';

@Controller('driver-tools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriverToolsController {
  constructor(
    private readonly heatmapService: HeatmapService,
    private readonly destinationModeService: DestinationModeService,
  ) {}

  @Get('heatmap')
  @Roles(UserRole.DRIVER)
  async getHeatmap(
    @CurrentUser() user: any,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.heatmapService.getEnhancedHeatmap(
      user.driverId,
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 10,
    );
  }

  @Post('destination-mode/activate')
  @Roles(UserRole.DRIVER)
  async activateDestinationMode(
    @CurrentUser() user: any,
    @Body() body: {
      destinationLat: number;
      destinationLng: number;
      mode: 'flexible' | 'fastest';
      maxDetour?: number;
    },
  ) {
    return this.destinationModeService.activateDestinationMode({
      driverId: user.driverId,
      ...body,
    });
  }

  @Delete('destination-mode/deactivate')
  @Roles(UserRole.DRIVER)
  async deactivateDestinationMode(@CurrentUser() user: any) {
    await this.destinationModeService.deactivateDestinationMode(user.driverId);
    return { message: 'Destination mode deactivated' };
  }
}
