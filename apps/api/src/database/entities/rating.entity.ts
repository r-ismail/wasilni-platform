import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Driver } from './driver.entity';
import { Trip } from './trip.entity';

export enum RatingType {
  CUSTOMER_TO_DRIVER = 'CUSTOMER_TO_DRIVER',
  DRIVER_TO_CUSTOMER = 'DRIVER_TO_CUSTOMER',
}

@Entity({ tableName: 'ratings' })
@Index({ properties: ['tenant', 'trip'] })
@Index({ properties: ['ratedBy'] })
@Index({ properties: ['ratedUser'] })
@Index({ properties: ['ratedDriver'] })
export class Rating extends BaseEntity {
  @ManyToOne(() => Tenant, { fieldName: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Trip, { fieldName: 'trip_id' })
  trip: Trip;

  @Enum(() => RatingType)
  type: RatingType;

  // Who gave the rating
  @ManyToOne(() => User, { nullable: true, fieldName: 'rated_by_user_id' })
  ratedBy?: User;

  @ManyToOne(() => Driver, { nullable: true, fieldName: 'rated_by_driver_id' })
  ratedByDriver?: Driver;

  // Who received the rating
  @ManyToOne(() => User, { nullable: true, fieldName: 'rated_user_id' })
  ratedUser?: User;

  @ManyToOne(() => Driver, { nullable: true, fieldName: 'rated_driver_id' })
  ratedDriver?: Driver;

  @Property({ type: 'smallint' })
  stars: number; // 1-5

  @Property({ type: 'text', nullable: true })
  comment?: string;

  @Property({ type: 'json', nullable: true })
  tags?: string[]; // e.g., ['clean', 'polite', 'fast']

  @Property({ default: false })
  flaggedAsAbusive: boolean = false;

  @Property({ nullable: true })
  moderatedAt?: Date;

  @Property({ nullable: true })
  moderatedBy?: string;
}
