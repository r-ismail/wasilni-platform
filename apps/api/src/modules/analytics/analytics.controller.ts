import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@wasilni/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.analyticsService.getDashboardKPIs(user.tenantId);
  }

  @Get('time-series')
  async getTimeSeries(
    @CurrentUser() user: any,
    @Query('metric') metric: 'revenue' | 'trips' | 'parcels' = 'revenue',
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
    @Query('count') count: number = 30,
  ) {
    return this.analyticsService.getTimeSeries(user.tenantId, metric, period, count);
  }
}
