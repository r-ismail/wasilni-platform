import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Parcel } from '../../database/entities/parcel.entity';
import { ParcelEvent } from '../../database/entities/parcel-event.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Parcel, ParcelEvent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ParcelsModule {}
