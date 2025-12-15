import { Entity, Property, ManyToOne, OneToMany, Collection, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { Driver } from './driver.entity';

@Entity({ tableName: 'wallets' })
@Index({ properties: ['tenant', 'user'] })
@Index({ properties: ['tenant', 'driver'] })
export class Wallet extends BaseEntity {
  @ManyToOne(() => Tenant, { fieldName: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true, fieldName: 'user_id' })
  user?: User;

  @ManyToOne(() => Driver, { nullable: true, fieldName: 'driver_id' })
  driver?: Driver;

  @Property({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number = 0;

  @Property({ length: 3, default: 'YER' })
  currency: string = 'YER';

  @Property({ default: false })
  isLocked: boolean = false;

  @Property({ type: 'text', nullable: true })
  lockReason?: string;

  @Property({ nullable: true })
  lastTransactionAt?: Date;
}
