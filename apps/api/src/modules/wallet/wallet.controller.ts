import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('my-wallet')
  async getMyWallet(@CurrentUser() user: any) {
    return this.walletService.getOrCreateWallet(user.sub, user.tenantId);
  }

  @Get('balance')
  async getBalance(@CurrentUser() user: any) {
    const wallet = await this.walletService.getOrCreateWallet(user.sub, user.tenantId);
    return this.walletService.getBalance(wallet.id);
  }

  @Post('deposit')
  async deposit(@CurrentUser() user: any, @Body() dto: DepositDto) {
    const wallet = await this.walletService.getOrCreateWallet(user.sub, user.tenantId);
    return this.walletService.deposit(wallet.id, dto.amount, dto.description, dto.reference);
  }

  @Post('withdraw')
  async withdraw(@CurrentUser() user: any, @Body() dto: WithdrawDto) {
    const wallet = await this.walletService.getOrCreateWallet(user.sub, user.tenantId);
    return this.walletService.withdraw(wallet.id, dto.amount, dto.description, dto.reference);
  }

  @Post('transfer')
  async transfer(@CurrentUser() user: any, @Body() dto: TransferDto) {
    const wallet = await this.walletService.getOrCreateWallet(user.sub, user.tenantId);
    return this.walletService.transfer(wallet.id, dto.toWalletId, dto.amount, dto.description);
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const wallet = await this.walletService.getOrCreateWallet(user.sub, user.tenantId);
    return this.walletService.getTransactionHistory(wallet.id, page, limit);
  }
}
