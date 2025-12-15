import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DriverToolsController } from './driver-tools.controller';
import { HeatmapService } from './services/heatmap.service';
import { DestinationModeService } from './services/destination-mode.service';
import { Trip } from '../../database/entities/trip.entity';
import { Driver } from '../../database/entities/driver.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Trip, Driver])],
  controllers: [DriverToolsController],
  providers: [HeatmapService, DestinationModeService],
  exports: [HeatmapService, DestinationModeService],
})
export class DriverToolsModule {}
