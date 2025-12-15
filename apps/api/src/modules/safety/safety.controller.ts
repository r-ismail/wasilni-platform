import { Controller, Post, Get, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { SafetyService } from './services/safety.service';
import { ActivateSOSDto, ShareTripDto } from './dto/safety.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Post('sos/activate')
  @UseGuards(JwtAuthGuard)
  async activateSOS(
    @CurrentUser() user: any,
    @Body() dto: ActivateSOSDto,
  ) {
    return this.safetyService.activateSOS(user.sub, dto);
  }

  @Delete('sos/deactivate/:tripId')
  @UseGuards(JwtAuthGuard)
  async deactivateSOS(
    @CurrentUser() user: any,
    @Param('tripId') tripId: string,
  ) {
    return this.safetyService.deactivateSOS(user.sub, tripId);
  }

  @Post('share-tracking')
  @UseGuards(JwtAuthGuard)
  async shareTracking(
    @CurrentUser() user: any,
    @Body() dto: ShareTripDto,
  ) {
    return this.safetyService.shareTripTracking(user.sub, dto);
  }

  @Get('track/:token')
  @Public()
  async trackTrip(@Param('token') token: string) {
    return this.safetyService.getTripLocation(token);
  }
}
