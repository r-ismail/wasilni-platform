import { Entity, Property, ManyToOne, Enum, Unique, Index, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { UserRole } from '@wasilni/shared';
import { Trip } from './trip.entity';
import { Parcel } from './parcel.entity';

@Entity({ tableName: 'users' })
@Index({ properties: ['tenant', 'phone'] })
export class User extends BaseEntity {
  @ManyToOne(() => Tenant, { nullable: true, fieldName: 'tenant_id' })
  tenant?: Tenant;

  @Property()
  @Unique()
  phone: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  firstNameAr?: string;

  @Property({ nullable: true })
  lastNameAr?: string;

  @Property({ nullable: true })
  avatarUrl?: string;

  @Enum(() => UserRole)
  @Index()
  role: UserRole = UserRole.CUSTOMER;

  @Property({ nullable: true, hidden: true })
  passwordHash?: string;

  @Property({ nullable: true, hidden: true })
  refreshToken?: string;

  @Property({ nullable: true })
  deviceToken?: string;

  @Property({ nullable: true })
  preferredLanguage?: string = 'ar';

  @Property({ default: false })
  isPhoneVerified: boolean = false;

  @Property({ nullable: true })
  phoneVerifiedAt?: Date;

  @Property({ default: false })
  isIdVerified: boolean = false;

  @Property({ nullable: true })
  idVerifiedAt?: Date;

  @Property({ type: 'json', nullable: true })
  idDocument?: {
    type: string;
    number: string;
    photoUrl?: string;
    verifiedBy?: string;
  };

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  lastLoginAt?: Date;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => Trip, (trip) => trip.customer)
  trips = new Collection<Trip>(this);

  @OneToMany(() => Parcel, (parcel) => parcel.sender)
  sentParcels = new Collection<Parcel>(this);

  @OneToMany(() => Parcel, (parcel) => parcel.receiver)
  receivedParcels = new Collection<Parcel>(this);
}
