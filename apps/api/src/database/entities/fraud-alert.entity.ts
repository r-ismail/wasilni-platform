import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Driver } from './driver.entity';
import { Trip } from './trip.entity';

export enum FraudType {
  GPS_SPOOFING = 'GPS_SPOOFING',
  CIRCULAR_ROUTE = 'CIRCULAR_ROUTE',
  IMPOSSIBLE_SPEED = 'IMPOSSIBLE_SPEED',
  DUPLICATE_COORDINATES = 'DUPLICATE_COORDINATES',
  EXCESSIVE_CANCELLATIONS = 'EXCESSIVE_CANCELLATIONS',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN',
  PAYMENT_FRAUD = 'PAYMENT_FRAUD',
  FAKE_TRIP = 'FAKE_TRIP',
  ACCOUNT_TAKEOVER = 'ACCOUNT_TAKEOVER',
  OTHER = 'OTHER',
}

export enum FraudSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FraudStatus {
  PENDING = 'PENDING',
  INVESTIGATING = 'INVESTIGATING',
  CONFIRMED = 'CONFIRMED',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
  RESOLVED = 'RESOLVED',
}

@Entity({ tableName: 'fraud_alerts' })
@Index({ properties: ['tenant', 'status'] })
@Index({ properties: ['type', 'severity'] })
@Index({ properties: ['user'] })
@Index({ properties: ['driver'] })
export class FraudAlert extends BaseEntity {
  @ManyToOne(() => Tenant, { fieldName: 'tenant_id' })
  tenant: Tenant;

  @Enum(() => FraudType)
  type: FraudType;

  @Enum(() => FraudSeverity)
  severity: FraudSeverity;

  @Enum(() => FraudStatus)
  status: FraudStatus = FraudStatus.PENDING;

  @ManyToOne(() => User, { nullable: true, fieldName: 'user_id' })
  user?: User;

  @ManyToOne(() => Driver, { nullable: true, fieldName: 'driver_id' })
  driver?: Driver;

  @ManyToOne(() => Trip, { nullable: true, fieldName: 'trip_id' })
  trip?: Trip;

  @Property({ type: 'text' })
  description: string;

  @Property({ type: 'json' })
  evidence: Record<string, any>;

  @Property({ type: 'decimal', precision: 5, scale: 2 })
  confidenceScore: number; // 0-100

  @Property({ default: false })
  autoSuspended: boolean = false;

  @Property({ nullable: true })
  reviewedAt?: Date;

  @Property({ nullable: true })
  reviewedBy?: string;

  @Property({ type: 'text', nullable: true })
  reviewNotes?: string;

  @Property({ type: 'json', nullable: true })
  actionsTaken?: Array<{
    action: string;
    timestamp: string;
    performedBy: string;
  }>;
}
