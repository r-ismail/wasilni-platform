import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Parcel } from './parcel.entity';
import { ParcelStatus, UserRole } from '@wasilni/shared';

@Entity({ tableName: 'parcel_events' })
export class ParcelEvent extends BaseEntity {
  @ManyToOne(() => Parcel, { fieldName: 'parcel_id' })
  parcel: Parcel;

  @Enum(() => ParcelStatus)
  status: ParcelStatus;

  @Property()
  timestamp: Date = new Date();

  @Property({ type: 'point', nullable: true })
  location?: { type: 'Point'; coordinates: [number, number] };

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ nullable: true })
  photoUrl?: string;

  @Property({ default: false })
  otpVerified: boolean = false;

  @Property({ nullable: true })
  actorId?: string;

  @Enum(() => UserRole)
  actorRole?: UserRole;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}
