import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PAUSED = 'PAUSED',
}

@Entity({ tableName: 'subscriptions' })
export class Subscription extends BaseEntity {
  @ManyToOne(() => Tenant)
  tenant!: Tenant;

  @ManyToOne(() => User)
  user!: User;

  @Enum(() => SubscriptionPlan)
  plan!: SubscriptionPlan;

  @Enum(() => SubscriptionStatus)
  status!: SubscriptionStatus;

  @Property()
  startDate!: Date;

  @Property({ nullable: true })
  endDate?: Date;

  @Property()
  monthlyPrice!: number;

  @Property({ default: 'YER' })
  currency!: string;

  @Property({ type: 'json', nullable: true })
  benefits?: {
    freeRidesPerMonth?: number;
    discountPercentage?: number;
    prioritySupport?: boolean;
    noSurgePricing?: boolean;
    freeDeliveries?: number;
  };

  @Property({ nullable: true })
  cancelledAt?: Date;

  @Property({ nullable: true })
  cancelReason?: string;

  @Property({ default: true })
  autoRenew!: boolean;

  @Property({ nullable: true })
  nextBillingDate?: Date;
}
