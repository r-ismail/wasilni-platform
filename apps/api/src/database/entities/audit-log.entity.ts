import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { UserRole } from '@wasilni/shared';

@Entity({ tableName: 'audit_logs' })
@Index({ properties: ['tenantId', 'action'] })
@Index({ properties: ['actorId'] })
@Index({ properties: ['entityType', 'entityId'] })
export class AuditLog extends BaseEntity {
  @Property({ nullable: true })
  tenantId?: string;

  @Property()
  action: string; // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'APPROVE_KYC', etc.

  @Property()
  entityType: string; // 'user', 'trip', 'parcel', 'driver', etc.

  @Property({ nullable: true })
  entityId?: string;

  @Property({ nullable: true })
  actorId?: string;

  @Enum(() => UserRole, { nullable: true })
  actorRole?: UserRole;

  @Property({ nullable: true })
  actorIp?: string;

  @Property({ nullable: true })
  actorUserAgent?: string;

  @Property({ type: 'json', nullable: true })
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Property()
  timestamp: Date = new Date();
}
