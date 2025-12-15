import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { Wallet } from '../../../database/entities/wallet.entity';
import {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
} from '../../../database/entities/wallet-transaction.entity';
import { User } from '../../../database/entities/user.entity';
import { Driver } from '../../../database/entities/driver.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: EntityRepository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepository: EntityRepository<WalletTransaction>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Driver)
    private readonly driverRepository: EntityRepository<Driver>,
    private readonly em: EntityManager,
  ) {}

  /**
   * Get or create wallet for user
   */
  async getOrCreateWallet(userId: string, tenantId: string): Promise<Wallet> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let wallet = await this.walletRepository.findOne({ user: { id: userId } });

    if (!wallet) {
      wallet = this.walletRepository.create({
        tenant: { id: tenantId } as any,
        user: { id: userId } as any,
        balance: 0,
        currency: 'YER',
      });
      await this.em.persistAndFlush(wallet);
    }

    return wallet;
  }

  /**
   * Get or create wallet for driver
   */
  async getOrCreateDriverWallet(driverId: string, tenantId: string): Promise<Wallet> {
    const driver = await this.driverRepository.findOne({ id: driverId });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    let wallet = await this.walletRepository.findOne({ driver: { id: driverId } });

    if (!wallet) {
      wallet = this.walletRepository.create({
        tenant: { id: tenantId } as any,
        driver: { id: driverId } as any,
        balance: 0,
        currency: 'YER',
      });
      await this.em.persistAndFlush(wallet);
    }

    return wallet;
  }

  /**
   * Deposit money into wallet
   */
  async deposit(
    walletId: string,
    amount: number,
    description?: string,
    reference?: string,
  ): Promise<WalletTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.walletRepository.findOne({ id: walletId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.isLocked) {
      throw new BadRequestException(`Wallet is locked: ${wallet.lockReason}`);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Create transaction
    const transaction = this.transactionRepository.create({
      tenant: wallet.tenant,
      wallet,
      type: WalletTransactionType.DEPOSIT,
      amount,
      currency: wallet.currency,
      balanceBefore,
      balanceAfter,
      status: WalletTransactionStatus.COMPLETED,
      description,
      reference,
      completedAt: new Date(),
    });

    // Update wallet balance
    wallet.balance = balanceAfter;
    wallet.lastTransactionAt = new Date();

    await this.em.persistAndFlush([transaction, wallet]);

    return transaction;
  }

  /**
   * Withdraw money from wallet
   */
  async withdraw(
    walletId: string,
    amount: number,
    description?: string,
    reference?: string,
  ): Promise<WalletTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.walletRepository.findOne({ id: walletId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.isLocked) {
      throw new BadRequestException(`Wallet is locked: ${wallet.lockReason}`);
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    // Create transaction
    const transaction = this.transactionRepository.create({
      tenant: wallet.tenant,
      wallet,
      type: WalletTransactionType.WITHDRAWAL,
      amount,
      currency: wallet.currency,
      balanceBefore,
      balanceAfter,
      status: WalletTransactionStatus.COMPLETED,
      description,
      reference,
      completedAt: new Date(),
    });

    // Update wallet balance
    wallet.balance = balanceAfter;
    wallet.lastTransactionAt = new Date();

    await this.em.persistAndFlush([transaction, wallet]);

    return transaction;
  }

  /**
   * Process trip payment from wallet
   */
  async processTripPayment(
    walletId: string,
    tripId: string,
    amount: number,
  ): Promise<WalletTransaction> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.walletRepository.findOne({ id: walletId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.isLocked) {
      throw new BadRequestException(`Wallet is locked: ${wallet.lockReason}`);
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;

    // Create transaction
    const transaction = this.transactionRepository.create({
      tenant: wallet.tenant,
      wallet,
      type: WalletTransactionType.TRIP_PAYMENT,
      amount,
      currency: wallet.currency,
      balanceBefore,
      balanceAfter,
      status: WalletTransactionStatus.COMPLETED,
      description: `Payment for trip ${tripId}`,
      trip: { id: tripId } as any,
      completedAt: new Date(),
    });

    // Update wallet balance
    wallet.balance = balanceAfter;
    wallet.lastTransactionAt = new Date();

    await this.em.persistAndFlush([transaction, wallet]);

    return transaction;
  }

  /**
   * Transfer money between wallets
   */
  async transfer(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description?: string,
  ): Promise<{ debit: WalletTransaction; credit: WalletTransaction }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const fromWallet = await this.walletRepository.findOne({ id: fromWalletId });
    const toWallet = await this.walletRepository.findOne({ id: toWalletId });

    if (!fromWallet || !toWallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (fromWallet.isLocked) {
      throw new BadRequestException(`Source wallet is locked: ${fromWallet.lockReason}`);
    }

    if (toWallet.isLocked) {
      throw new BadRequestException(`Destination wallet is locked: ${toWallet.lockReason}`);
    }

    if (fromWallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Debit from source wallet
    const debitTransaction = this.transactionRepository.create({
      tenant: fromWallet.tenant,
      wallet: fromWallet,
      type: WalletTransactionType.TRANSFER,
      amount: -amount,
      currency: fromWallet.currency,
      balanceBefore: fromWallet.balance,
      balanceAfter: fromWallet.balance - amount,
      status: WalletTransactionStatus.COMPLETED,
      description: description || `Transfer to wallet ${toWalletId}`,
      completedAt: new Date(),
    });

    // Credit to destination wallet
    const creditTransaction = this.transactionRepository.create({
      tenant: toWallet.tenant,
      wallet: toWallet,
      type: WalletTransactionType.TRANSFER,
      amount,
      currency: toWallet.currency,
      balanceBefore: toWallet.balance,
      balanceAfter: toWallet.balance + amount,
      status: WalletTransactionStatus.COMPLETED,
      description: description || `Transfer from wallet ${fromWalletId}`,
      completedAt: new Date(),
    });

    // Update balances
    fromWallet.balance -= amount;
    fromWallet.lastTransactionAt = new Date();
    toWallet.balance += amount;
    toWallet.lastTransactionAt = new Date();

    await this.em.persistAndFlush([debitTransaction, creditTransaction, fromWallet, toWallet]);

    return { debit: debitTransaction, credit: creditTransaction };
  }

  /**
   * Get wallet balance
   */
  async getBalance(walletId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.walletRepository.findOne({ id: walletId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    walletId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepository.findAndCount(
      { wallet: { id: walletId } },
      {
        limit,
        offset: (page - 1) * limit,
        orderBy: { createdAt: 'DESC' },
      },
    );

    return { transactions, total };
  }

  /**
   * Lock wallet
   */
  async lockWallet(walletId: string, reason: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ id: walletId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.isLocked = true;
    wallet.lockReason = reason;

    await this.em.persistAndFlush(wallet);

    return wallet;
  }

  /**
   * Unlock wallet
   */
  async unlockWallet(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ id: walletId });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.isLocked = false;
    wallet.lockReason = undefined;

    await this.em.persistAndFlush(wallet);

    return wallet;
  }
}
