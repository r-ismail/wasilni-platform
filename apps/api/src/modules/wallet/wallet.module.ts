import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WalletController } from './wallet.controller';
import { WalletService } from './services/wallet.service';
import { Wallet } from '../../database/entities/wallet.entity';
import { WalletTransaction } from '../../database/entities/wallet-transaction.entity';
import { User } from '../../database/entities/user.entity';
import { Driver } from '../../database/entities/driver.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Wallet, WalletTransaction, User, Driver]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
