import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AgenciesService } from './services/agencies.service';
import { AgenciesController } from './agencies.controller';
import { Tenant } from '../../database/entities/tenant.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Tenant, User])],
  controllers: [AgenciesController],
  providers: [AgenciesService],
  exports: [AgenciesService],
})
export class AgenciesModule {}
