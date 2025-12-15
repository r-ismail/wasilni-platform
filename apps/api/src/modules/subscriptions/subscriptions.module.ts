import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './services/subscriptions.service';
import { Subscription } from '../../database/entities/subscription.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Subscription, User])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
