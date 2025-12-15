import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../../../database/entities/trip.entity';
import { Parcel } from '../../../database/entities/parcel.entity';
import { Driver } from '../../../database/entities/driver.entity';
import { User } from '../../../database/entities/user.entity';
import { LedgerEntry } from '../../../database/entities/ledger-entry.entity';

interface DashboardKPIs {
  overview: {
    totalRevenue: number;
    totalTrips: number;
    totalParcels: number;
    activeDrivers: number;
    activeCustomers: number;
    growthRate: number; // Percentage
  };
  trips: {
    completed: number;
    inProgress: number;
    cancelled: number;
    averageFare: number;
    averageDuration: number; // minutes
    completionRate: number; // Percentage
  };
  parcels: {
    delivered: number;
    inTransit: number;
    pending: number;
    averageFee: number;
    codTotal: number;
    deliveryRate: number; // Percentage
  };
  drivers: {
    total: number;
    online: number;
    onTrip: number;
    averageRating: number;
    averageEarnings: number;
    utilizationRate: number; // Percentage
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    growth: number; // Percentage
  };
  performance: {
    avgResponseTime: number; // seconds
    avgPickupTime: number; // minutes
    customerSatisfaction: number; // Percentage
    driverSatisfaction: number; // Percentage
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(Parcel)
    private readonly parcelRepository: EntityRepository<Parcel>,
    @InjectRepository(Driver)
    private readonly driverRepository: EntityRepository<Driver>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepository: EntityRepository<LedgerEntry>,
  ) {}

  /**
   * Get comprehensive dashboard KPIs
   */
  async getDashboardKPIs(tenantId: string, dateRange?: { start: Date; end: Date }): Promise<DashboardKPIs> {
    const start = dateRange?.start || this.getStartOfMonth();
    const end = dateRange?.end || new Date();

    // Fetch all data in parallel
    const [
      trips,
      parcels,
      drivers,
      users,
      ledgerEntries,
    ] = await Promise.all([
      this.tripRepository.find({ tenant: { id: tenantId }, createdAt: { $gte: start, $lte: end } }),
      this.parcelRepository.find({ tenant: { id: tenantId }, createdAt: { $gte: start, $lte: end } }),
      this.driverRepository.find({ tenant: { id: tenantId } }),
      this.userRepository.find({ tenant: { id: tenantId } }),
      this.ledgerRepository.find({ tenant: { id: tenantId }, createdAt: { $gte: start, $lte: end } }),
    ]);

    // Calculate KPIs
    const overview = this.calculateOverviewKPIs(trips, parcels, drivers, users, ledgerEntries);
    const tripKPIs = this.calculateTripKPIs(trips);
    const parcelKPIs = this.calculateParcelKPIs(parcels);
    const driverKPIs = this.calculateDriverKPIs(drivers, trips);
    const revenueKPIs = await this.calculateRevenueKPIs(tenantId);
    const performanceKPIs = this.calculatePerformanceKPIs(trips, drivers);

    return {
      overview,
      trips: tripKPIs,
      parcels: parcelKPIs,
      drivers: driverKPIs,
      revenue: revenueKPIs,
      performance: performanceKPIs,
    };
  }

  /**
   * Calculate overview KPIs
   */
  private calculateOverviewKPIs(
    trips: Trip[],
    parcels: Parcel[],
    drivers: Driver[],
    users: User[],
    ledgerEntries: LedgerEntry[],
  ) {
    const totalRevenue = ledgerEntries
      .filter(e => e.type === 'CREDIT')
      .reduce((sum, e) => sum + e.amount, 0);

    const activeDrivers = drivers.filter(d => d.isAvailable).length;
    const activeCustomers = users.filter(u => u.role === 'CUSTOMER').length;

    // Calculate growth rate (simplified - compare with last period)
    const growthRate = 5.2; // Placeholder

    return {
      totalRevenue,
      totalTrips: trips.length,
      totalParcels: parcels.length,
      activeDrivers,
      activeCustomers,
      growthRate,
    };
  }

  /**
   * Calculate trip KPIs
   */
  private calculateTripKPIs(trips: Trip[]) {
    const completed = trips.filter(t => t.status === 'COMPLETED').length;
    const inProgress = trips.filter(t => ['ASSIGNED', 'DRIVER_ARRIVED', 'STARTED'].includes(t.status)).length;
    const cancelled = trips.filter(t => t.status === 'CANCELLED').length;

    const completedTrips = trips.filter(t => t.status === 'COMPLETED');
    const averageFare = completedTrips.length > 0
      ? completedTrips.reduce((sum, t) => sum + t.finalFare, 0) / completedTrips.length
      : 0;

    const averageDuration = completedTrips.length > 0
      ? completedTrips.reduce((sum, t) => {
          if (!t.completedAt) return sum;
          const duration = (t.completedAt.getTime() - t.createdAt.getTime()) / 1000 / 60;
          return sum + duration;
        }, 0) / completedTrips.length
      : 0;

    const completionRate = trips.length > 0 ? (completed / trips.length) * 100 : 0;

    return {
      completed,
      inProgress,
      cancelled,
      averageFare,
      averageDuration,
      completionRate,
    };
  }

  /**
   * Calculate parcel KPIs
   */
  private calculateParcelKPIs(parcels: Parcel[]) {
    const delivered = parcels.filter(p => p.status === 'DELIVERED').length;
    const inTransit = parcels.filter(p => p.status === 'IN_TRANSIT').length;
    const pending = parcels.filter(p => ['CREATED', 'ASSIGNED', 'PICKED_UP'].includes(p.status)).length;

    const deliveredParcels = parcels.filter(p => p.status === 'DELIVERED');
    const averageFee = deliveredParcels.length > 0
      ? deliveredParcels.reduce((sum, p) => sum + p.fee, 0) / deliveredParcels.length
      : 0;

    const codTotal = parcels
      .filter(p => p.isCOD)
      .reduce((sum, p) => sum + (p.codAmount || 0), 0);

    const deliveryRate = parcels.length > 0 ? (delivered / parcels.length) * 100 : 0;

    return {
      delivered,
      inTransit,
      pending,
      averageFee,
      codTotal,
      deliveryRate,
    };
  }

  /**
   * Calculate driver KPIs
   */
  private calculateDriverKPIs(drivers: Driver[], trips: Trip[]) {
    const total = drivers.length;
    const online = drivers.filter(d => d.isAvailable).length;
    const onTrip = trips.filter(t => ['ASSIGNED', 'STARTED'].includes(t.status)).length;

    const averageRating = drivers.length > 0
      ? drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length
      : 0;

    const completedTrips = trips.filter(t => t.status === 'COMPLETED');
    const averageEarnings = drivers.length > 0 && completedTrips.length > 0
      ? completedTrips.reduce((sum, t) => sum + t.finalFare, 0) / drivers.length
      : 0;

    const utilizationRate = online > 0 ? (onTrip / online) * 100 : 0;

    return {
      total,
      online,
      onTrip,
      averageRating,
      averageEarnings,
      utilizationRate,
    };
  }

  /**
   * Calculate revenue KPIs
   */
  private async calculateRevenueKPIs(tenantId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [todayRevenue, weekRevenue, monthRevenue, lastMonthRevenue] = await Promise.all([
      this.getRevenueForPeriod(tenantId, today, now),
      this.getRevenueForPeriod(tenantId, thisWeekStart, now),
      this.getRevenueForPeriod(tenantId, thisMonthStart, now),
      this.getRevenueForPeriod(tenantId, lastMonthStart, lastMonthEnd),
    ]);

    const growth = lastMonthRevenue > 0
      ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return {
      today: todayRevenue,
      thisWeek: weekRevenue,
      thisMonth: monthRevenue,
      lastMonth: lastMonthRevenue,
      growth,
    };
  }

  /**
   * Calculate performance KPIs
   */
  private calculatePerformanceKPIs(trips: Trip[], drivers: Driver[]) {
    // Average response time (time from request to assignment)
    const assignedTrips = trips.filter(t => t.status !== 'REQUESTED');
    const avgResponseTime = assignedTrips.length > 0
      ? assignedTrips.reduce((sum, t) => {
          // Simplified - would need actual assignment timestamp
          return sum + 30; // Placeholder: 30 seconds
        }, 0) / assignedTrips.length
      : 0;

    // Average pickup time (time from assignment to pickup)
    const startedTrips = trips.filter(t => ['STARTED', 'COMPLETED'].includes(t.status));
    const avgPickupTime = startedTrips.length > 0
      ? startedTrips.reduce((sum, t) => {
          // Simplified - would need actual pickup timestamp
          return sum + 5; // Placeholder: 5 minutes
        }, 0) / startedTrips.length
      : 0;

    // Customer satisfaction (based on ratings)
    const ratedTrips = trips.filter(t => t.status === 'COMPLETED');
    const customerSatisfaction = ratedTrips.length > 0 ? 85 : 0; // Placeholder

    // Driver satisfaction
    const driverSatisfaction = drivers.length > 0 ? 80 : 0; // Placeholder

    return {
      avgResponseTime,
      avgPickupTime,
      customerSatisfaction,
      driverSatisfaction,
    };
  }

  /**
   * Get revenue for a specific period
   */
  private async getRevenueForPeriod(tenantId: string, start: Date, end: Date): Promise<number> {
    const entries = await this.ledgerRepository.find({
      tenant: { id: tenantId },
      type: 'CREDIT',
      createdAt: { $gte: start, $lte: end },
    });

    return entries.reduce((sum, e) => sum + e.amount, 0);
  }

  /**
   * Get start of current month
   */
  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeries(
    tenantId: string,
    metric: 'revenue' | 'trips' | 'parcels',
    period: 'day' | 'week' | 'month',
    count: number = 30,
  ): Promise<Array<{ date: string; value: number }>> {
    // Simplified implementation - would use SQL GROUP BY in production
    const data: Array<{ date: string; value: number }> = [];

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      if (period === 'day') {
        date.setDate(date.getDate() - i);
      } else if (period === 'week') {
        date.setDate(date.getDate() - i * 7);
      } else {
        date.setMonth(date.getMonth() - i);
      }

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 10000, // Placeholder
      });
    }

    return data;
  }
}
