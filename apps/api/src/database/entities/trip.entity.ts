import { Entity, Property, ManyToOne, Enum, Index, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Driver } from './driver.entity';
import { TripStatus, TripType, Currency } from '@wasilni/shared';
import { TripEvent } from './trip-event.entity';

@Entity({ tableName: 'trips' })
@Index({ properties: ['tenantId', 'status'] })
@Index({ properties: ['customerId'] })
@Index({ properties: ['driverId'] })
export class Trip extends BaseEntity {
  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Property()
  tenantId: string;

  @ManyToOne(() => User)
  customer: User;

  @Property()
  customerId: string;

  @ManyToOne(() => Driver, { nullable: true })
  driver?: Driver;

  @Property({ nullable: true })
  driverId?: string;

  @Enum(() => TripType)
  @Index()
  type: TripType;

  @Enum(() => TripStatus)
  @Index()
  status: TripStatus = TripStatus.REQUESTED;

  // Locations
  @Property({ type: 'point' })
  pickupLocation: { type: 'Point'; coordinates: [number, number] };

  @Property({ type: 'json' })
  pickupAddress: {
    street?: string;
    city: string;
    district?: string;
    landmark?: string;
  };

  @Property({ type: 'point' })
  dropoffLocation: { type: 'Point'; coordinates: [number, number] };

  @Property({ type: 'json' })
  dropoffAddress: {
    street?: string;
    city: string;
    district?: string;
    landmark?: string;
  };

  // Scheduling
  @Property({ nullable: true })
  scheduledPickupTime?: Date;

  @Property({ default: false })
  isScheduled: boolean = false;

  // Pricing
  @Property({ type: 'decimal', precision: 10, scale: 2 })
  estimatedFare: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalFare?: number;

  @Enum(() => Currency)
  currency: Currency = Currency.YER;

  @Property({ type: 'json', nullable: true })
  pricingBreakdown?: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    rushHourMultiplier?: number;
    vipMultiplier?: number;
    discount?: number;
    total: number;
  };

  // Trip Details
  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  estimatedDistance?: number; // in km

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  actualDistance?: number; // in km

  @Property({ nullable: true })
  estimatedDuration?: number; // in minutes

  @Property({ nullable: true })
  actualDuration?: number; // in minutes

  // Shared ride specific
  @Property({ default: 1 })
  passengerCount: number = 1;

  @Property({ nullable: true })
  sharedRideGroupId?: string;

  // Timestamps
  @Property({ nullable: true })
  requestedAt?: Date;

  @Property({ nullable: true })
  assignedAt?: Date;

  @Property({ nullable: true })
  driverArrivedAt?: Date;

  @Property({ nullable: true })
  startedAt?: Date;

  @Property({ nullable: true })
  completedAt?: Date;

  @Property({ nullable: true })
  cancelledAt?: Date;

  @Property({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Property({ nullable: true })
  cancelledBy?: string; // userId

  // Rating
  @Property({ nullable: true })
  customerRating?: number;

  @Property({ type: 'text', nullable: true })
  customerReview?: string;

  @Property({ nullable: true })
  driverRating?: number;

  @Property({ type: 'text', nullable: true })
  driverReview?: string;

  // Notes
  @Property({ type: 'text', nullable: true })
  customerNotes?: string;

  @Property({ type: 'text', nullable: true })
  driverNotes?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => TripEvent, (event) => event.trip, { orphanRemoval: true })
  events = new Collection<TripEvent>(this);
}
