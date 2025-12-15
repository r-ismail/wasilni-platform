import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../../../database/entities/trip.entity';
import { Driver } from '../../../database/entities/driver.entity';
import { TripStatus } from '@wasilni/shared';

interface HeatmapZone {
  lat: number;
  lng: number;
  radius: number; // in meters
  color: 'red' | 'orange' | 'yellow' | 'purple';
  avgWaitTime: number; // in minutes
  surgeMultiplier?: number;
  demandLevel: 'high' | 'medium' | 'low';
}

interface HeatmapResponse {
  zones: HeatmapZone[];
  lastUpdated: Date;
  recommendations: string[];
}

@Injectable()
export class HeatmapService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(Driver)
    private readonly driverRepository: EntityRepository<Driver>,
  ) {}

  /**
   * Get enhanced heatmap with wait times and surge areas
   */
  async getEnhancedHeatmap(
    driverId: string,
    currentLat: number,
    currentLng: number,
    radiusKm: number = 10,
  ): Promise<HeatmapResponse> {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Get recent trips in the area
    const recentTrips = await this.tripRepository.find({
      createdAt: { $gte: thirtyMinutesAgo },
      status: { $in: [TripStatus.REQUESTED, TripStatus.ASSIGNED, TripStatus.STARTED] },
    });

    // Get available drivers in the area
    const availableDrivers = await this.driverRepository.find({
      isOnline: true,
      isAvailable: true,
    });

    // Analyze demand patterns
    const zones = this.analyzeZones(
      recentTrips,
      availableDrivers,
      currentLat,
      currentLng,
      radiusKm,
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(zones, currentLat, currentLng);

    return {
      zones,
      lastUpdated: now,
      recommendations,
    };
  }

  /**
   * Analyze zones to determine wait times and demand levels
   */
  private analyzeZones(
    trips: Trip[],
    drivers: Driver[],
    centerLat: number,
    centerLng: number,
    radiusKm: number,
  ): HeatmapZone[] {
    const zones: HeatmapZone[] = [];

    // Define grid cells (1km x 1km)
    const cellSize = 0.01; // approximately 1km
    const gridCells = Math.ceil(radiusKm / 1);

    for (let i = -gridCells; i <= gridCells; i++) {
      for (let j = -gridCells; j <= gridCells; j++) {
        const zoneLat = centerLat + i * cellSize;
        const zoneLng = centerLng + j * cellSize;

        // Count trips and drivers in this zone
        const tripsInZone = trips.filter((trip) =>
          this.isInZone(trip.pickupLat, trip.pickupLng, zoneLat, zoneLng, 1),
        );

        const driversInZone = drivers.filter((driver) =>
          this.isInZone(driver.currentLat || 0, driver.currentLng || 0, zoneLat, zoneLng, 1),
        );

        if (tripsInZone.length === 0 && driversInZone.length === 0) {
          continue; // Skip empty zones
        }

        // Calculate metrics
        const demandSupplyRatio = driversInZone.length > 0 
          ? tripsInZone.length / driversInZone.length 
          : tripsInZone.length * 10;

        const avgWaitTime = this.calculateAvgWaitTime(tripsInZone);
        const surgeMultiplier = demandSupplyRatio > 2 ? 1 + (demandSupplyRatio - 2) * 0.2 : 1;

        // Determine zone color and demand level
        let color: 'red' | 'orange' | 'yellow' | 'purple';
        let demandLevel: 'high' | 'medium' | 'low';

        if (surgeMultiplier > 1.5) {
          color = 'purple'; // Surge area
          demandLevel = 'high';
        } else if (avgWaitTime < 3) {
          color = 'red'; // Shortest wait times
          demandLevel = 'high';
        } else if (avgWaitTime < 5) {
          color = 'orange'; // Medium wait times
          demandLevel = 'medium';
        } else {
          color = 'yellow'; // Longer wait times
          demandLevel = 'low';
        }

        zones.push({
          lat: zoneLat,
          lng: zoneLng,
          radius: 1000, // 1km radius
          color,
          avgWaitTime,
          surgeMultiplier: surgeMultiplier > 1 ? surgeMultiplier : undefined,
          demandLevel,
        });
      }
    }

    return zones;
  }

  /**
   * Check if a point is within a zone
   */
  private isInZone(
    lat: number,
    lng: number,
    zoneLat: number,
    zoneLng: number,
    radiusKm: number,
  ): boolean {
    const distance = this.calculateDistance(lat, lng, zoneLat, zoneLng);
    return distance <= radiusKm;
  }

  /**
   * Calculate distance between two points (Haversine formula)
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

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate average wait time for trips in a zone
   */
  private calculateAvgWaitTime(trips: Trip[]): number {
    if (trips.length === 0) return 0;

    const waitTimes = trips
      .filter((trip) => trip.assignedAt)
      .map((trip) => {
        const waitTime = trip.assignedAt!.getTime() - trip.createdAt.getTime();
        return waitTime / (1000 * 60); // Convert to minutes
      });

    if (waitTimes.length === 0) return 5; // Default 5 minutes

    return waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
  }

  /**
   * Generate personalized recommendations for the driver
   */
  private generateRecommendations(
    zones: HeatmapZone[],
    currentLat: number,
    currentLng: number,
  ): string[] {
    const recommendations: string[] = [];

    // Find best zones
    const surgeZones = zones.filter((z) => z.surgeMultiplier && z.surgeMultiplier > 1.3);
    const shortWaitZones = zones.filter((z) => z.avgWaitTime < 3 && z.color === 'red');

    if (surgeZones.length > 0) {
      const nearest = this.findNearestZone(surgeZones, currentLat, currentLng);
      recommendations.push(
        `High demand area ${nearest.distance.toFixed(1)}km away with ${nearest.zone.surgeMultiplier}x surge pricing`,
      );
    }

    if (shortWaitZones.length > 0) {
      const nearest = this.findNearestZone(shortWaitZones, currentLat, currentLng);
      recommendations.push(
        `Hot zone ${nearest.distance.toFixed(1)}km away with average wait time of ${nearest.zone.avgWaitTime.toFixed(1)} minutes`,
      );
    }

    // Time-based recommendations
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) {
      recommendations.push('Morning rush hour - consider heading to residential areas');
    } else if (hour >= 17 && hour <= 19) {
      recommendations.push('Evening rush hour - business districts have high demand');
    } else if (hour >= 22) {
      recommendations.push('Late night - focus on entertainment districts and airports');
    }

    if (recommendations.length === 0) {
      recommendations.push('Stay in your current area - demand is steady');
    }

    return recommendations;
  }

  /**
   * Find nearest zone from current location
   */
  private findNearestZone(
    zones: HeatmapZone[],
    currentLat: number,
    currentLng: number,
  ): { zone: HeatmapZone; distance: number } {
    let nearest = zones[0];
    let minDistance = this.calculateDistance(currentLat, currentLng, nearest.lat, nearest.lng);

    for (const zone of zones) {
      const distance = this.calculateDistance(currentLat, currentLng, zone.lat, zone.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = zone;
      }
    }

    return { zone: nearest, distance: minDistance };
  }
}
