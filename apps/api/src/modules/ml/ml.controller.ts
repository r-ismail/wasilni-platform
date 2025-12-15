import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PredictiveETAService } from './services/predictive-eta.service';
import { RouteOptimizationService } from './services/route-optimization.service';
import { EarningsOptimizationService } from './services/earnings-optimization.service';
import { DemandForecastingService } from './services/demand-forecasting.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
    private readonly earningsOptimizationService: EarningsOptimizationService,
    private readonly demandForecastingService: DemandForecastingService,
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

  @Get('earnings-insights/:driverId')
  async getEarningsInsights(@Param('driverId') driverId: string) {
    return this.earningsOptimizationService.getEarningsInsights(driverId);
  }

  @Post('real-time-suggestions')
  async getRealTimeSuggestions(@Body() body: any) {
    return this.earningsOptimizationService.getRealTimeSuggestions(
      body.driverId,
      body.currentLat,
      body.currentLng,
    );
  }

  @Get('demand-forecast')
  async getDemandForecast(@CurrentUser() user: any) {
    return this.demandForecastingService.forecastDemand(user.tenantId);
  }

  @Post('hotspot-recommendations')
  async getHotspotRecommendations(@CurrentUser() user: any, @Body() body: any) {
    return this.demandForecastingService.getHotspotRecommendations(
      user.tenantId,
      body.driverLocation,
    );
  }

  @Get('surge-predictions')
  async getSurgePredictions(@CurrentUser() user: any) {
    return this.demandForecastingService.predictSurgeAreas(user.tenantId);
  }
}
