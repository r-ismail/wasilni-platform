import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { FraudDetectionService } from './services/fraud-detection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@wasilni/shared';
import { FraudStatus } from '../../database/entities/fraud-alert.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('fraud-detection')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FraudDetectionController {
  constructor(private readonly fraudDetectionService: FraudDetectionService) {}

  @Post('check-trip/:tripId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async checkTrip(@Param('tripId') tripId: string) {
    return this.fraudDetectionService.checkTripForFraud(tripId);
  }

  @Post('check-user/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async checkUser(@Param('userId') userId: string) {
    return this.fraudDetectionService.checkUserBehavior(userId);
  }

  @Post('check-driver/:driverId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async checkDriver(@Param('driverId') driverId: string) {
    return this.fraudDetectionService.checkDriverBehavior(driverId);
  }

  @Get('alerts')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE)
  async getAlerts(
    @Query('status') status?: FraudStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.fraudDetectionService.getFraudAlerts(status, page, limit);
  }

  @Post('alerts/:alertId/review')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async reviewAlert(
    @Param('alertId') alertId: string,
    @CurrentUser() user: any,
    @Body() body: { status: FraudStatus; notes?: string },
  ) {
    return this.fraudDetectionService.reviewFraudAlert(
      alertId,
      body.status,
      user.sub,
      body.notes,
    );
  }
}
