import { Entity, Property, Enum, Index, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { LedgerEntryType, Currency } from '@wasilni/shared';

@Entity({ tableName: 'ledger_entries' })
@Index({ properties: ['tenantId', 'type'] })
@Index({ properties: ['relatedEntityType', 'relatedEntityId'] })
export class LedgerEntry extends BaseEntity {
  @Property({ nullable: true })
  tenantId?: string;

  @Enum(() => LedgerEntryType)
  @Index()
  type: LedgerEntryType;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Enum(() => Currency)
  currency: Currency;

  // Multi-currency support
  @Property({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  fxRate?: number;

  @Property({ nullable: true })
  fxSource?: string;

  @Property({ nullable: true })
  fxTimestamp?: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  reportingAmount?: number;

  @Enum(() => Currency, { nullable: true })
  reportingCurrency?: Currency;

  // Double-entry accounting
  @Property()
  debitAccount: string;

  @Property()
  creditAccount: string;

  // Related entity (trip, parcel, etc.)
  @Property()
  relatedEntityType: string; // 'trip', 'parcel', 'adjustment'

  @Property()
  relatedEntityId: string;

  // Actors
  @Property({ nullable: true })
  customerId?: string;

  @Property({ nullable: true })
  driverId?: string;

  // Idempotency
  @Property()
  @Unique()
  idempotencyKey: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Property()
  transactionDate: Date = new Date();
}
