import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './services/ratings.service';
import { Rating } from '../../database/entities/rating.entity';
import { Trip } from '../../database/entities/trip.entity';
import { User } from '../../database/entities/user.entity';
import { Driver } from '../../database/entities/driver.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Rating, Trip, User, Driver]),
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
