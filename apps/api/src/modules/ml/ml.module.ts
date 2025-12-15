import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MLController } from './ml.controller';
import { PredictiveETAService } from './services/predictive-eta.service';
import { RouteOptimizationService } from './services/route-optimization.service';
import { Trip } from '../../database/entities/trip.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Trip])],
  controllers: [MLController],
  providers: [PredictiveETAService, RouteOptimizationService],
  exports: [PredictiveETAService, RouteOptimizationService],
})
export class MLModule {}
