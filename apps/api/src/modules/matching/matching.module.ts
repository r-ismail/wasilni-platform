import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MatchingService } from './services/matching.service';
import { Driver } from '../../database/entities/driver.entity';
import { Trip } from '../../database/entities/trip.entity';
import { Parcel } from '../../database/entities/parcel.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Driver, Trip, Parcel])],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
