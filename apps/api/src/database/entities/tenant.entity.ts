import { Entity, Property, Unique, Collection, OneToMany } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Driver } from './driver.entity';
import { Trip } from './trip.entity';
import { Parcel } from './parcel.entity';

@Entity({ tableName: 'tenants' })
export class Tenant extends BaseEntity {
  @Property()
  @Unique()
  name: string;

  @Property({ nullable: true })
  nameAr?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property()
  @Unique()
  slug: string;

  @Property({ nullable: true })
  logoUrl?: string;

  @Property({ nullable: true })
  contactEmail?: string;

  @Property({ nullable: true })
  contactPhone?: string;

  @Property({ type: 'json', nullable: true })
  address?: {
    street?: string;
    city: string;
    district?: string;
  };

  @Property({ type: 'json', nullable: true })
  settings?: {
    defaultCurrency?: string;
    commissionRate?: number;
    features?: string[];
  };

  @Property({ default: true })
  isActive: boolean = true;

  @OneToMany(() => User, (user) => user.tenant)
  users = new Collection<User>(this);

  @OneToMany(() => Driver, (driver) => driver.tenant)
  drivers = new Collection<Driver>(this);

  @OneToMany(() => Trip, (trip) => trip.tenant)
  trips = new Collection<Trip>(this);

  @OneToMany(() => Parcel, (parcel) => parcel.tenant)
  parcels = new Collection<Parcel>(this);
}
