import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Trip } from './trip.entity';
import { TripStatus, UserRole } from '@wasilni/shared';

@Entity({ tableName: 'trip_events' })
export class TripEvent extends BaseEntity {
  @ManyToOne(() => Trip, { fieldName: 'trip_id' })
  trip: Trip;

  @Enum(() => TripStatus)
  status: TripStatus;

  @Property()
  timestamp: Date = new Date();

  @Property({ type: 'point', nullable: true })
  location?: { type: 'Point'; coordinates: [number, number] };

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ nullable: true })
  actorId?: string;

  @Enum(() => UserRole, { nullable: true })
  actorRole?: UserRole;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}
