import { Entity, Property, ManyToOne, Enum, Index, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { KYCStatus, DriverStatus, VehicleType } from '@wasilni/shared';
import { Trip } from './trip.entity';
import { Parcel } from './parcel.entity';

@Entity({ tableName: 'drivers' })
@Index({ properties: ['tenantId', 'phone'] })
@Index({ properties: ['status'] })
export class Driver extends BaseEntity {
  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @Property()
  tenantId: string;

  @Property()
  phone: string;

  @Property({ nullable: true })
  email?: string;

  @Property()
  firstName: string;

  @Property()
  lastName: string;

  @Property({ nullable: true })
  firstNameAr?: string;

  @Property({ nullable: true })
  lastNameAr?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Property({ nullable: true, hidden: true })
  passwordHash?: string;

  @Property({ nullable: true, hidden: true })
  refreshToken?: string;

  @Property({ nullable: true })
  deviceToken?: string;

  @Property({ nullable: true })
  preferredLanguage?: string = 'ar';

  // KYC Information
  @Enum(() => KYCStatus)
  @Index()
  kycStatus: KYCStatus = KYCStatus.PENDING;

  @Property({ type: 'json', nullable: true })
  kycDocuments?: {
    nationalId?: {
      number: string;
      frontPhotoUrl: string;
      backPhotoUrl: string;
    };
    driverLicense?: {
      number: string;
      expiryDate: Date;
      photoUrl: string;
    };
    vehicleRegistration?: {
      number: string;
      photoUrl: string;
    };
    criminalRecord?: {
      photoUrl: string;
    };
  };

  @Property({ nullable: true })
  kycReviewedBy?: string;

  @Property({ nullable: true })
  kycReviewedAt?: Date;

  @Property({ type: 'text', nullable: true })
  kycRejectionReason?: string;

  // Vehicle Information
  @Enum(() => VehicleType)
  vehicleType: VehicleType;

  @Property()
  vehicleMake: string;

  @Property()
  vehicleModel: string;

  @Property()
  vehicleYear: number;

  @Property()
  vehicleColor: string;

  @Property({ nullable: true })
  vehicleColorAr?: string;

  @Property()
  vehiclePlateNumber: string;

  @Property({ nullable: true })
  vehiclePhotoUrl?: string;

  @Property({ default: 4 })
  vehicleCapacity: number = 4;

  // Status and Location
  @Enum(() => DriverStatus)
  @Index()
  status: DriverStatus = DriverStatus.OFFLINE;

  @Property({ type: 'point', nullable: true })
  currentLocation?: { type: 'Point'; coordinates: [number, number] };

  @Property({ nullable: true })
  currentHeading?: number;

  @Property({ nullable: true })
  lastLocationUpdate?: Date;

  // Ratings and Statistics
  @Property({ default: 0 })
  totalTrips: number = 0;

  @Property({ default: 0 })
  totalParcels: number = 0;

  @Property({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number = 0;

  @Property({ default: 0 })
  totalRatings: number = 0;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => Trip, (trip) => trip.driver)
  trips = new Collection<Trip>(this);

  @OneToMany(() => Parcel, (parcel) => parcel.driver)
  parcels = new Collection<Parcel>(this);
}
