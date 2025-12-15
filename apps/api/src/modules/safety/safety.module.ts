import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SafetyController } from './safety.controller';
import { SafetyService } from './services/safety.service';
import { Trip } from '../../database/entities/trip.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Trip]),
  ],
  controllers: [SafetyController],
  providers: [SafetyService],
  exports: [SafetyService],
})
export class SafetyModule {}
