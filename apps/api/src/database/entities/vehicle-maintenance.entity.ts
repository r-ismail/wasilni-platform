import { Entity, Property, ManyToOne, Enum, Index } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { Driver } from './driver.entity';

export enum MaintenanceType {
  OIL_CHANGE = 'OIL_CHANGE',
  TIRE_ROTATION = 'TIRE_ROTATION',
  BRAKE_SERVICE = 'BRAKE_SERVICE',
  ENGINE_CHECK = 'ENGINE_CHECK',
  GENERAL_INSPECTION = 'GENERAL_INSPECTION',
  REPAIR = 'REPAIR',
  OTHER = 'OTHER',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

@Entity({ tableName: 'vehicle_maintenance' })
@Index({ properties: ['tenant', 'driver'] })
@Index({ properties: ['status'] })
@Index({ properties: ['scheduledDate'] })
export class VehicleMaintenance extends BaseEntity {
  @ManyToOne(() => Tenant, { fieldName: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Driver, { fieldName: 'driver_id' })
  driver: Driver;

  @Enum(() => MaintenanceType)
  type: MaintenanceType;

  @Enum(() => MaintenanceStatus)
  status: MaintenanceStatus = MaintenanceStatus.SCHEDULED;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property()
  scheduledDate: Date;

  @Property({ nullable: true })
  completedDate?: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Property({ nullable: true })
  mileageAtService?: number;

  @Property({ type: 'json', nullable: true })
  issues?: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high';
    reportedAt: string;
  }>;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ nullable: true })
  nextServiceDue?: Date;

  @Property({ nullable: true })
  nextServiceMileage?: number;
}
