import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { Wallet } from './wallet.entity';
import { Trip } from './trip.entity';
import { Parcel } from './parcel.entity';

export enum WalletTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRIP_PAYMENT = 'TRIP_PAYMENT',
  PARCEL_PAYMENT = 'PARCEL_PAYMENT',
  REFUND = 'REFUND',
  COMMISSION = 'COMMISSION',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY',
  TRANSFER = 'TRANSFER',
}

export enum WalletTransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

@Entity({ tableName: 'wallet_transactions' })
@Index({ properties: ['tenant', 'wallet'] })
@Index({ properties: ['tenant', 'status'] })
@Index({ properties: ['createdAt'] })
export class WalletTransaction extends BaseEntity {
  @ManyToOne(() => Tenant, { fieldName: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Wallet, { fieldName: 'wallet_id' })
  wallet: Wallet;

  @Enum(() => WalletTransactionType)
  type: WalletTransactionType;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Property({ length: 3, default: 'YER' })
  currency: string = 'YER';

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  balanceBefore: number;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  balanceAfter: number;

  @Enum(() => WalletTransactionStatus)
  status: WalletTransactionStatus = WalletTransactionStatus.PENDING;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'text', nullable: true })
  reference?: string; // External reference (e.g., payment gateway transaction ID)

  @ManyToOne(() => Trip, { nullable: true, fieldName: 'trip_id' })
  trip?: Trip;

  @ManyToOne(() => Parcel, { nullable: true, fieldName: 'parcel_id' })
  parcel?: Parcel;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Property({ nullable: true })
  completedAt?: Date;

  @Property({ nullable: true })
  failedAt?: Date;

  @Property({ type: 'text', nullable: true })
  failureReason?: string;
}
