import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { TripType, ParcelSize, Currency } from '@wasilni/shared';

@Entity({ tableName: 'pricing_rules' })
@Index({ properties: ['tenantId', 'isActive'] })
export class PricingRule extends BaseEntity {
  @Property({ nullable: true })
  tenantId?: string;

  @Property()
  name: string;

  @Property({ nullable: true })
  nameAr?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  // Applicable to
  @Enum(() => TripType)
  tripType?: TripType;

  @Enum(() => ParcelSize)
  parcelSize?: ParcelSize;

  @Property({ nullable: true })
  fromCity?: string;

  @Property({ nullable: true })
  toCity?: string;

  @Property({ nullable: true })
  corridor?: string;

  // Pricing components
  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseFare?: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  perKmRate?: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  perMinuteRate?: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumFare?: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumFare?: number;

  // Multipliers
  @Property({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rushHourMultiplier?: number;

  @Property({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  vipMultiplier?: number;

  @Property({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  sharedRideDiscount?: number;

  // Rush hour configuration
  @Property({ type: 'json', nullable: true })
  rushHourWindows?: Array<{
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }>;

  // COD fee
  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  codFeeFixed?: number;

  @Property({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  codFeePercentage?: number;

  @Enum(() => Currency)
  currency: Currency = Currency.YER;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  validFrom?: Date;

  @Property({ nullable: true })
  validUntil?: Date;

  @Property({ default: 0 })
  priority: number = 0;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}
