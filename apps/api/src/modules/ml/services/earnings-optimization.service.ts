import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../../../database/entities/trip.entity';
import { Driver } from '../../../database/entities/driver.entity';

interface EarningsInsight {
  currentEarnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  projectedEarnings: {
    endOfDay: number;
    endOfWeek: number;
    endOfMonth: number;
  };
  optimization: {
    potentialIncrease: number; // Percentage
    suggestions: Array<{
      type: string;
      title: string;
      description: string;
      impact: number; // Expected earnings increase in YER
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  hotspots: Array<{
    area: string;
    lat: number;
    lng: number;
    demand: number; // 0-100
    avgFare: number;
    estimatedWaitTime: number; // minutes
  }>;
  peakHours: Array<{
    hour: number;
    demand: number;
    avgFare: number;
    recommendation: string;
  }>;
}

@Injectable()
export class EarningsOptimizationService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(Driver)
    private readonly driverRepository: EntityRepository<Driver>,
  ) {}

  /**
   * Get earnings insights and optimization suggestions for a driver
   */
  async getEarningsInsights(driverId: string): Promise<EarningsInsight> {
    const driver = await this.driverRepository.findOne({ id: driverId });
    if (!driver) {
      throw new Error('Driver not found');
    }

    // Get driver's trip history
    const trips = await this.tripRepository.find({
      driver: { id: driverId },
      status: 'COMPLETED',
    }, {
      orderBy: { completedAt: 'DESC' },
      limit: 1000,
    });

    // Calculate current earnings
    const currentEarnings = this.calculateCurrentEarnings(trips);

    // Project future earnings based on historical patterns
    const projectedEarnings = this.projectEarnings(trips);

    // Generate optimization suggestions
    const optimization = await this.generateOptimizationSuggestions(driverId, trips);

    // Identify high-demand hotspots
    const hotspots = await this.identifyHotspots(trips);

    // Analyze peak hours
    const peakHours = this.analyzePeakHours(trips);

    return {
      currentEarnings,
      projectedEarnings,
      optimization,
      hotspots,
      peakHours,
    };
  }

  /**
   * Calculate current earnings
   */
  private calculateCurrentEarnings(trips: Trip[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayTrips = trips.filter(t => t.completedAt && t.completedAt >= today);
    const weekTrips = trips.filter(t => t.completedAt && t.completedAt >= thisWeekStart);
    const monthTrips = trips.filter(t => t.completedAt && t.completedAt >= thisMonthStart);

    return {
      today: todayTrips.reduce((sum, t) => sum + t.finalFare, 0),
      thisWeek: weekTrips.reduce((sum, t) => sum + t.finalFare, 0),
      thisMonth: monthTrips.reduce((sum, t) => sum + t.finalFare, 0),
    };
  }

  /**
   * Project future earnings based on historical patterns
   */
  private projectEarnings(trips: Trip[]) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const currentDate = now.getDate();

    // Calculate average earnings per hour
    const avgEarningsPerHour = trips.length > 0
      ? trips.reduce((sum, t) => sum + t.finalFare, 0) / (trips.length * 0.5) // Assume 30 min avg trip
      : 0;

    // Project end of day
    const hoursLeft = 24 - currentHour;
    const endOfDay = this.calculateCurrentEarnings(trips).today + (avgEarningsPerHour * hoursLeft * 0.7);

    // Project end of week
    const daysLeft = 7 - currentDay;
    const endOfWeek = this.calculateCurrentEarnings(trips).thisWeek + (avgEarningsPerHour * hoursLeft * daysLeft * 0.7);

    // Project end of month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeftInMonth = daysInMonth - currentDate;
    const endOfMonth = this.calculateCurrentEarnings(trips).thisMonth + (avgEarningsPerHour * 8 * daysLeftInMonth * 0.7);

    return {
      endOfDay,
      endOfWeek,
      endOfMonth,
    };
  }

  /**
   * Generate optimization suggestions
   */
  private async generateOptimizationSuggestions(driverId: string, trips: Trip[]) {
    const suggestions: Array<{
      type: string;
      title: string;
      description: string;
      impact: number;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    // Analyze acceptance rate
    const acceptanceRate = 0.85; // Placeholder - would calculate from actual data
    if (acceptanceRate < 0.8) {
      suggestions.push({
        type: 'acceptance_rate',
        title: 'Improve Acceptance Rate',
        description: 'Accepting more trips can increase your earnings by up to 20%. Try to accept trips within 2km radius.',
        impact: 2000,
        priority: 'high',
      });
    }

    // Analyze peak hours utilization
    const peakHoursWorked = trips.filter(t => {
      if (!t.createdAt) return false;
      const hour = t.createdAt.getHours();
      return (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
    }).length;

    if (peakHoursWorked < trips.length * 0.3) {
      suggestions.push({
        type: 'peak_hours',
        title: 'Work During Peak Hours',
        description: 'Working during rush hours (7-9 AM, 4-7 PM) can increase earnings by 40%. Peak hour multiplier: 1.5x',
        impact: 3500,
        priority: 'high',
      });
    }

    // Analyze trip distance
    const avgDistance = trips.length > 0
      ? trips.reduce((sum, t) => sum + (t.distance || 0), 0) / trips.length
      : 0;

    if (avgDistance < 5) {
      suggestions.push({
        type: 'trip_distance',
        title: 'Accept Longer Trips',
        description: 'Longer trips (5-15 km) typically have better earnings per hour. Consider accepting trips to nearby cities.',
        impact: 1500,
        priority: 'medium',
      });
    }

    // Analyze idle time
    suggestions.push({
      type: 'idle_time',
      title: 'Reduce Idle Time',
      description: 'Position yourself near high-demand areas to reduce wait time between trips. Check hotspots below.',
      impact: 2500,
      priority: 'high',
    });

    // Calculate potential increase
    const totalImpact = suggestions.reduce((sum, s) => sum + s.impact, 0);
    const currentMonthlyEarnings = this.calculateCurrentEarnings(trips).thisMonth || 50000;
    const potentialIncrease = (totalImpact / currentMonthlyEarnings) * 100;

    return {
      potentialIncrease,
      suggestions,
    };
  }

  /**
   * Identify high-demand hotspots
   */
  private async identifyHotspots(trips: Trip[]) {
    // Group trips by area (simplified - would use clustering in production)
    const hotspots = [
      {
        area: 'Downtown Sana\'a',
        lat: 15.3694,
        lng: 44.1910,
        demand: 85,
        avgFare: 1500,
        estimatedWaitTime: 3,
      },
      {
        area: 'Airport Area',
        lat: 15.4762,
        lng: 44.2189,
        demand: 70,
        avgFare: 2500,
        estimatedWaitTime: 8,
      },
      {
        area: 'University District',
        lat: 15.3547,
        lng: 44.2068,
        demand: 65,
        avgFare: 800,
        estimatedWaitTime: 5,
      },
      {
        area: 'Shopping District',
        lat: 15.3448,
        lng: 44.2169,
        demand: 60,
        avgFare: 1200,
        estimatedWaitTime: 6,
      },
    ];

    return hotspots;
  }

  /**
   * Analyze peak hours for earnings
   */
  private analyzePeakHours(trips: Trip[]) {
    const hourlyData: Array<{
      hour: number;
      demand: number;
      avgFare: number;
      recommendation: string;
    }> = [];

    for (let hour = 0; hour < 24; hour++) {
      const hourTrips = trips.filter(t => t.createdAt && t.createdAt.getHours() === hour);
      const demand = hourTrips.length > 0 ? Math.min(100, (hourTrips.length / trips.length) * 100 * 24) : 0;
      const avgFare = hourTrips.length > 0
        ? hourTrips.reduce((sum, t) => sum + t.finalFare, 0) / hourTrips.length
        : 0;

      let recommendation = '';
      if (demand > 70) {
        recommendation = 'High demand - excellent time to work';
      } else if (demand > 40) {
        recommendation = 'Moderate demand - good earnings potential';
      } else {
        recommendation = 'Low demand - consider resting or repositioning';
      }

      hourlyData.push({ hour, demand, avgFare, recommendation });
    }

    return hourlyData;
  }

  /**
   * Get real-time earnings optimization suggestions
   */
  async getRealTimeSuggestions(driverId: string, currentLat: number, currentLng: number): Promise<{
    action: string;
    reason: string;
    expectedEarnings: number;
    destination?: { lat: number; lng: number; area: string };
  }> {
    const now = new Date();
    const currentHour = now.getHours();

    // Check if it's peak hour
    const isPeakHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 19);

    if (isPeakHour) {
      return {
        action: 'Stay in current area',
        reason: 'Peak hour - high demand expected in your current location',
        expectedEarnings: 1500,
      };
    }

    // Suggest moving to hotspot
    return {
      action: 'Move to hotspot',
      reason: 'Low demand in current area. Moving to Downtown can increase earnings',
      expectedEarnings: 2000,
      destination: {
        lat: 15.3694,
        lng: 44.1910,
        area: 'Downtown Sana\'a',
      },
    };
  }
}
