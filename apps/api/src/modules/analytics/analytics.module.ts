import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { CarbonTrackingService } from './services/carbon-tracking.service';
import { Trip } from '../../database/entities/trip.entity';
import { Parcel } from '../../database/entities/parcel.entity';
import { Driver } from '../../database/entities/driver.entity';
import { User } from '../../database/entities/user.entity';
import { LedgerEntry } from '../../database/entities/ledger-entry.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Trip, Parcel, Driver, User, LedgerEntry]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, CarbonTrackingService],
  exports: [AnalyticsService, CarbonTrackingService],
})
export class AnalyticsModule {}
