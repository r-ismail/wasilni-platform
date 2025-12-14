import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Trip } from '../../database/entities/trip.entity';
import { TripEvent } from '../../database/entities/trip-event.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Trip, TripEvent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class TripsModule {}
