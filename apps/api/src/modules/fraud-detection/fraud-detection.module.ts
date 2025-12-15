import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FraudDetectionController } from './fraud-detection.controller';
import { FraudDetectionService } from './services/fraud-detection.service';
import { FraudAlert } from '../../database/entities/fraud-alert.entity';
import { Trip } from '../../database/entities/trip.entity';
import { User } from '../../database/entities/user.entity';
import { Driver } from '../../database/entities/driver.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([FraudAlert, Trip, User, Driver]),
  ],
  controllers: [FraudDetectionController],
  providers: [FraudDetectionService],
  exports: [FraudDetectionService],
})
export class FraudDetectionModule {}
