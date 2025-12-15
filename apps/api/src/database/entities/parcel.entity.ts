import { Entity, Property, ManyToOne, Enum, Index, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Driver } from './driver.entity';
import { ParcelStatus, ParcelSize, Currency } from '@wasilni/shared';
import { ParcelEvent } from './parcel-event.entity';

@Entity({ tableName: 'parcels' })
@Index({ properties: ['tenant', 'status'] })
@Index({ properties: ['sender'] })
@Index({ properties: ['receiver'] })
@Index({ properties: ['driver'] })
export class Parcel extends BaseEntity {
  @ManyToOne(() => Tenant, { fieldName: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, { fieldName: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { nullable: true, fieldName: 'receiver_id' })
  receiver?: User;

  @Property()
  receiverName: string;

  @Property()
  receiverPhone: string;

  @ManyToOne(() => Driver, { nullable: true, fieldName: 'driver_id' })
  driver?: Driver;

  @Enum(() => ParcelStatus)
  @Index()
  status: ParcelStatus = ParcelStatus.CREATED;

  // Parcel Details
  @Enum(() => ParcelSize)
  size: ParcelSize;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight?: number; // in kg

  @Property({ type: 'json', nullable: true })
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @Property({ default: false })
  isFragile: boolean = false;

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
  deliveryLocation: { type: 'Point'; coordinates: [number, number] };

  @Property({ type: 'json' })
  deliveryAddress: {
    street?: string;
    city: string;
    district?: string;
    landmark?: string;
  };

  // Pricing
  @Property({ type: 'decimal', precision: 10, scale: 2 })
  deliveryFee: number;

  @Enum(() => Currency)
  currency: Currency = Currency.YER;

  @Property({ type: 'json', nullable: true })
  pricingBreakdown?: {
    baseFare: number;
    sizeFee: number;
    distanceFee: number;
    urgencyFee?: number;
    codFee?: number;
    total: number;
  };

  // Cash On Delivery (COD)
  @Property({ default: false })
  isCOD: boolean = false;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  codAmount?: number;

  @Property({ default: false })
  codCollected: boolean = false;

  @Property({ nullable: true })
  codCollectedAt?: Date;

  @Property({ default: false })
  codSettled: boolean = false;

  @Property({ nullable: true })
  codSettledAt?: Date;

  // Verification
  @Property()
  pickupOTP: string;

  @Property({ default: false })
  pickupOTPVerified: boolean = false;

  @Property({ nullable: true })
  pickupOTPVerifiedAt?: Date;

  @Property()
  deliveryOTP: string;

  @Property({ default: false })
  deliveryOTPVerified: boolean = false;

  @Property({ nullable: true })
  deliveryOTPVerifiedAt?: Date;

  // Proof Photos
  @Property({ nullable: true })
  pickupPhotoUrl?: string;

  @Property({ type: 'json', nullable: true })
  pickupPhotoMetadata?: {
    latitude?: number;
    longitude?: number;
    timestamp?: Date;
  };

  @Property({ nullable: true })
  deliveryPhotoUrl?: string;

  @Property({ type: 'json', nullable: true })
  deliveryPhotoMetadata?: {
    latitude?: number;
    longitude?: number;
    timestamp?: Date;
  };

  // Timestamps
  @Property({ nullable: true })
  assignedAt?: Date;

  @Property({ nullable: true })
  pickedUpAt?: Date;

  @Property({ nullable: true })
  deliveredAt?: Date;

  @Property({ nullable: true })
  cancelledAt?: Date;

  @Property({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Property({ nullable: true })
  cancelledBy?: string;

  // Rating
  @Property({ nullable: true })
  senderRating?: number;

  @Property({ type: 'text', nullable: true })
  senderReview?: string;

  // Notes
  @Property({ type: 'text', nullable: true })
  senderNotes?: string;

  @Property({ type: 'text', nullable: true })
  driverNotes?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => ParcelEvent, (event) => event.parcel, { orphanRemoval: true })
  events = new Collection<ParcelEvent>(this);
}
