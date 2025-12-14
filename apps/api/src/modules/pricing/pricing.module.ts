import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PricingRule } from '../../database/entities/pricing-rule.entity';

@Module({
  imports: [MikroOrmModule.forFeature([PricingRule])],
  controllers: [],
  providers: [],
  exports: [],
})
export class PricingModule {}
