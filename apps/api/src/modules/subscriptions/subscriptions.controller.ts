import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './services/subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubscriptionPlan } from '../../database/entities/subscription.entity';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getAvailablePlans();
  }

  @Get('my-subscription')
  async getMySubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.getUserSubscription(user.sub);
  }

  @Post('subscribe')
  async subscribe(@CurrentUser() user: any, @Body() body: { plan: SubscriptionPlan }) {
    return this.subscriptionsService.subscribe(user.sub, user.tenantId, body.plan);
  }

  @Post('upgrade')
  async upgrade(@CurrentUser() user: any, @Body() body: { plan: SubscriptionPlan }) {
    return this.subscriptionsService.upgrade(user.sub, body.plan);
  }

  @Post('downgrade')
  async downgrade(@CurrentUser() user: any, @Body() body: { plan: SubscriptionPlan }) {
    return this.subscriptionsService.downgrade(user.sub, body.plan);
  }

  @Post('pause')
  async pause(@CurrentUser() user: any) {
    return this.subscriptionsService.pause(user.sub);
  }

  @Post('resume')
  async resume(@CurrentUser() user: any) {
    return this.subscriptionsService.resume(user.sub);
  }

  @Delete('cancel')
  async cancel(@CurrentUser() user: any, @Body() body: { reason?: string }) {
    return this.subscriptionsService.cancel(user.sub, body.reason);
  }
}
