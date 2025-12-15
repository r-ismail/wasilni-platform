import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MLController } from './ml.controller';
import { PredictiveETAService } from './services/predictive-eta.service';
import { RouteOptimizationService } from './services/route-optimization.service';
import { EarningsOptimizationService } from './services/earnings-optimization.service';
import { Trip } from '../../database/entities/trip.entity';
import { Driver } from '../../database/entities/driver.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Trip, Driver])],
  controllers: [MLController],
  providers: [PredictiveETAService, RouteOptimizationService, EarningsOptimizationService],
  exports: [PredictiveETAService, RouteOptimizationService, EarningsOptimizationService],
})
export class MLModule {}
