import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../../../database/entities/trip.entity';

interface DemandForecast {
  location: { lat: number; lng: number; name: string };
  predictedDemand: number; // Number of trips expected
  confidence: number; // 0-100
  timeWindow: { start: Date; end: Date };
  factors: {
    historical: number;
    timeOfDay: number;
    dayOfWeek: number;
    weather: number;
    events: number;
  };
}

interface HotspotRecommendation {
  location: { lat: number; lng: number; name: string };
  expectedTrips: number;
  estimatedEarnings: number;
  currentDrivers: number;
  recommendedDrivers: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Injectable()
export class DemandForecastingService {
  // Known hotspots in Sana'a and Aden
  private readonly hotspots = [
    { lat: 15.3694, lng: 44.191, name: 'Old City, Sana\'a' },
    { lat: 15.3547, lng: 44.2066, name: 'Tahrir Square, Sana\'a' },
    { lat: 15.3729, lng: 44.2133, name: 'Airport Road, Sana\'a' },
    { lat: 12.7855, lng: 45.0187, name: 'Crater, Aden' },
    { lat: 12.8024, lng: 45.0365, name: 'Ma\'alla, Aden' },
    { lat: 12.7797, lng: 45.0088, name: 'Tawahi, Aden' },
  ];

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
  ) {}

  /**
   * Forecast demand for next hour
   */
  async forecastDemand(tenantId: string): Promise<DemandForecast[]> {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get historical data
    const recentTrips = await this.tripRepository.find({
      tenant: { id: tenantId },
      createdAt: { $gte: weekAgo },
      status: { $in: ['COMPLETED', 'IN_PROGRESS'] },
    });

    const forecasts: DemandForecast[] = [];

    for (const hotspot of this.hotspots) {
      // Calculate historical demand for this hotspot
      const hotspotTrips = recentTrips.filter(trip =>
        this.isNearLocation(trip.pickupLat, trip.pickupLng, hotspot.lat, hotspot.lng, 2),
      );

      // Get same hour last week
      const sameHourLastWeek = new Date(now);
      sameHourLastWeek.setDate(sameHourLastWeek.getDate() - 7);
      sameHourLastWeek.setMinutes(0, 0, 0);

      const sameHourTrips = hotspotTrips.filter(trip => {
        const tripHour = trip.createdAt.getHours();
        const currentHour = now.getHours();
        return tripHour === currentHour;
      });

      // Calculate average demand for this hour
      const avgDemand = sameHourTrips.length / 7; // Average per day over the week

      // Apply multipliers based on factors
      const timeOfDayMultiplier = this.getTimeOfDayMultiplier(now.getHours());
      const dayOfWeekMultiplier = this.getDayOfWeekMultiplier(now.getDay());
      const weatherMultiplier = 1.0; // In production, integrate with weather API

      const predictedDemand = Math.round(
        avgDemand * timeOfDayMultiplier * dayOfWeekMultiplier * weatherMultiplier,
      );

      // Calculate confidence based on data availability
      const confidence = Math.min(95, 50 + hotspotTrips.length);

      forecasts.push({
        location: hotspot,
        predictedDemand,
        confidence,
        timeWindow: {
          start: now,
          end: new Date(now.getTime() + 60 * 60 * 1000),
        },
        factors: {
          historical: avgDemand,
          timeOfDay: timeOfDayMultiplier,
          dayOfWeek: dayOfWeekMultiplier,
          weather: weatherMultiplier,
          events: 1.0, // In production, integrate with events calendar
        },
      });
    }

    return forecasts.sort((a, b) => b.predictedDemand - a.predictedDemand);
  }

  /**
   * Get hotspot recommendations for drivers
   */
  async getHotspotRecommendations(
    tenantId: string,
    driverLocation?: { lat: number; lng: number },
  ): Promise<HotspotRecommendation[]> {
    const forecasts = await this.forecastDemand(tenantId);

    const recommendations: HotspotRecommendation[] = forecasts.map(forecast => {
      const avgFarePerTrip = 1500; // YER - in production, calculate from historical data
      const estimatedEarnings = forecast.predictedDemand * avgFarePerTrip;

      // In production, get actual driver count from database
      const currentDrivers = Math.floor(Math.random() * 10);
      const recommendedDrivers = Math.ceil(forecast.predictedDemand / 3); // 1 driver per 3 trips

      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (forecast.predictedDemand > 10 && currentDrivers < recommendedDrivers) {
        priority = 'HIGH';
      } else if (forecast.predictedDemand > 5) {
        priority = 'MEDIUM';
      }

      return {
        location: forecast.location,
        expectedTrips: forecast.predictedDemand,
        estimatedEarnings,
        currentDrivers,
        recommendedDrivers,
        priority,
      };
    });

    // Sort by priority and distance from driver
    if (driverLocation) {
      return recommendations.sort((a, b) => {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

        if (priorityDiff !== 0) return priorityDiff;

        // If same priority, sort by distance
        const distA = this.calculateDistance(
          driverLocation.lat,
          driverLocation.lng,
          a.location.lat,
          a.location.lng,
        );
        const distB = this.calculateDistance(
          driverLocation.lat,
          driverLocation.lng,
          b.location.lat,
          b.location.lng,
        );

        return distA - distB;
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Predict surge pricing areas
   */
  async predictSurgeAreas(tenantId: string): Promise<
    Array<{
      location: { lat: number; lng: number; name: string };
      surgeMultiplier: number;
      reason: string;
    }>
  > {
    const forecasts = await this.forecastDemand(tenantId);

    return forecasts
      .filter(f => f.predictedDemand > 8) // High demand threshold
      .map(forecast => {
        // Calculate surge multiplier based on demand
        let surgeMultiplier = 1.0;
        if (forecast.predictedDemand > 15) {
          surgeMultiplier = 2.0;
        } else if (forecast.predictedDemand > 10) {
          surgeMultiplier = 1.5;
        } else if (forecast.predictedDemand > 8) {
          surgeMultiplier = 1.25;
        }

        return {
          location: forecast.location,
          surgeMultiplier,
          reason: `High demand predicted: ${forecast.predictedDemand} trips expected in next hour`,
        };
      });
  }

  /**
   * Get time of day multiplier
   */
  private getTimeOfDayMultiplier(hour: number): number {
    // Peak hours: 7-9 AM, 12-2 PM, 5-8 PM
    if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 20)) {
      return 1.5;
    }
    // Off-peak: 10 PM - 6 AM
    if (hour >= 22 || hour <= 6) {
      return 0.5;
    }
    // Normal hours
    return 1.0;
  }

  /**
   * Get day of week multiplier
   */
  private getDayOfWeekMultiplier(dayOfWeek: number): number {
    // 0 = Sunday, 6 = Saturday
    // Friday (5) is weekend in Yemen
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return 1.3; // Higher demand on weekends
    }
    // Thursday (4) - pre-weekend
    if (dayOfWeek === 4) {
      return 1.1;
    }
    return 1.0;
  }

  /**
   * Check if a location is near another location
   */
  private isNearLocation(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    radiusKm: number,
  ): boolean {
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
    return distance <= radiusKm;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
