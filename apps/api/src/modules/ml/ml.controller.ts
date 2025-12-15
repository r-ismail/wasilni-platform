import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PredictiveETAService } from './services/predictive-eta.service';
import { RouteOptimizationService } from './services/route-optimization.service';
import { PredictETADto } from './dto/ml.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@wasilni/shared';
import { Public } from '../auth/decorators/public.decorator';

@Controller('ml')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MLController {
  constructor(
    private readonly predictiveETAService: PredictiveETAService,
    private readonly routeOptimizationService: RouteOptimizationService,
  ) {}

  @Post('predict-eta')
  @Public()
  async predictETA(@Body() dto: PredictETADto) {
    return this.predictiveETAService.predictETA(
      dto.pickupLat,
      dto.pickupLng,
      dto.dropoffLat,
      dto.dropoffLng,
      dto.vehicleType,
    );
  }

  @Post('train-model')
  @Roles(UserRole.SUPER_ADMIN)
  async trainModel() {
    return this.predictiveETAService.trainModel();
  }

  @Get('model-metrics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getModelMetrics() {
    return this.predictiveETAService.getModelMetrics();
  }

  @Post('optimize-route')
  async optimizeRoute(@Body() body: any) {
    return this.routeOptimizationService.optimizeRoute(
      body.origin,
      body.destination,
      body.waypoints || [],
      body.options,
    );
  }

  @Post('optimize-shared-ride')
  async optimizeSharedRide(@Body() body: any) {
    return this.routeOptimizationService.optimizeSharedRide(
      body.pickups,
      body.dropoffs,
      body.maxDetourMinutes,
    );
  }

  @Post('route-suggestions')
  async getRouteSuggestions(@Body() body: any) {
    return this.routeOptimizationService.getRouteSuggestions(
      body.currentLat,
      body.currentLng,
      body.destinationLat,
      body.destinationLng,
    );
  }
}
