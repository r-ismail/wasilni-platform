import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Driver } from '../../database/entities/driver.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Driver])],
  controllers: [],
  providers: [],
  exports: [],
})
export class DriversModule {}
