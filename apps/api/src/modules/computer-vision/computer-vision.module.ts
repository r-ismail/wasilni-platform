import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ComputerVisionController } from './computer-vision.controller';
import { ComputerVisionService } from './services/computer-vision.service';
import { Parcel } from '../../database/entities/parcel.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Parcel])],
  controllers: [ComputerVisionController],
  providers: [ComputerVisionService],
  exports: [ComputerVisionService],
})
export class ComputerVisionModule {}
