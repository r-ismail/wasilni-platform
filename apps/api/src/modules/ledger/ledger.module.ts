import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { LedgerEntry } from '../../database/entities/ledger-entry.entity';

@Module({
  imports: [MikroOrmModule.forFeature([LedgerEntry])],
  controllers: [],
  providers: [],
  exports: [],
})
export class LedgerModule {}
