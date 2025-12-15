import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../../../database/entities/trip.entity';
import { Driver } from '../../../database/entities/driver.entity';

interface DestinationModeConfig {
  driverId: string;
  destinationLat: number;
  destinationLng: number;
  mode: 'flexible' | 'fastest';
  maxDetour?: number; // in km, only for flexible mode
}

interface RouteOption {
  tripId: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  estimatedEarnings: number;
  detourDistance: number; // additional distance from direct route
  detourTime: number; // additional time in minutes
  score: number; // overall score for ranking
}

interface DestinationModeResponse {
  mode: 'flexible' | 'fastest';
  destination: { lat: number; lng: number };
  availableTrips: RouteOption[];
  directRoute: {
    distance: number;
    estimatedTime: number;
  };
  recommendations: string[];
}

@Injectable()
export class DestinationModeService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(Driver)
    private readonly driverRepository: EntityRepository<Driver>,
  ) {}

  /**
   * Activate destination mode for a driver
   */
  async activateDestinationMode(config: DestinationModeConfig): Promise<DestinationModeResponse> {
    const driver = await this.driverRepository.findOne({ id: config.driverId });
    if (!driver) {
      throw new Error('Driver not found');
    }

    const currentLat = driver.currentLat || 0;
    const currentLng = driver.currentLng || 0;

    // Calculate direct route
    const directRoute = {
      distance: this.calculateDistance(
        currentLat,
        currentLng,
        config.destinationLat,
        config.destinationLng,
      ),
      estimatedTime: this.estimateTime(
        currentLat,
        currentLng,
        config.destinationLat,
        config.destinationLng,
      ),
    };

    // Find available trips along the route
    const availableTrips =
      config.mode === 'flexible'
        ? await this.findTripsAlongRoute(config, currentLat, currentLng, directRoute.distance)
        : [];

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      config.mode,
      availableTrips,
      directRoute,
    );

    return {
      mode: config.mode,
      destination: {
        lat: config.destinationLat,
        lng: config.destinationLng,
      },
      availableTrips,
      directRoute,
      recommendations,
    };
  }

  /**
   * Find trips along the route to destination
   */
  private async findTripsAlongRoute(
    config: DestinationModeConfig,
    currentLat: number,
    currentLng: number,
    directDistance: number,
  ): Promise<RouteOption[]> {
    const maxDetour = config.maxDetour || 5; // Default 5km max detour

    // Get available trips
    const availableTrips = await this.tripRepository.find({
      status: 'REQUESTED',
    });

    const routeOptions: RouteOption[] = [];

    for (const trip of availableTrips) {
      // Calculate if trip is along the route
      const pickupDistance = this.calculateDistance(
        currentLat,
        currentLng,
        trip.pickupLat,
        trip.pickupLng,
      );

      const dropoffToDestination = this.calculateDistance(
        trip.dropoffLat,
        trip.dropoffLng,
        config.destinationLat,
        config.destinationLng,
      );

      const totalDistance = pickupDistance + trip.actualDistance + dropoffToDestination;
      const detourDistance = totalDistance - directDistance;

      // Only include trips with acceptable detour
      if (detourDistance <= maxDetour) {
        const detourTime = (detourDistance / 40) * 60; // Assume 40 km/h average speed
        const estimatedEarnings = trip.fare || 0;

        // Calculate score (higher is better)
        // Factors: earnings, detour distance, detour time
        const score =
          estimatedEarnings * 10 - detourDistance * 2 - detourTime * 0.5;

        routeOptions.push({
          tripId: trip.id,
          pickupLat: trip.pickupLat,
          pickupLng: trip.pickupLng,
          dropoffLat: trip.dropoffLat,
          dropoffLng: trip.dropoffLng,
          estimatedEarnings,
          detourDistance,
          detourTime,
          score,
        });
      }
    }

    // Sort by score (best opportunities first)
    return routeOptions.sort((a, b) => b.score - a.score);
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
   * Estimate time to destination
   */
  private estimateTime(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
    const avgSpeed = 40; // km/h
    return (distance / avgSpeed) * 60; // minutes
  }

  /**
   * Generate recommendations based on destination mode
   */
  private generateRecommendations(
    mode: 'flexible' | 'fastest',
    availableTrips: RouteOption[],
    directRoute: { distance: number; estimatedTime: number },
  ): string[] {
    const recommendations: string[] = [];

    if (mode === 'fastest') {
      recommendations.push(
        `Direct route to destination: ${directRoute.distance.toFixed(1)}km, ${directRoute.estimatedTime.toFixed(0)} minutes`,
      );
      recommendations.push('You will not receive trip requests while in fastest mode');
    } else {
      // Flexible mode
      if (availableTrips.length > 0) {
        const bestTrip = availableTrips[0];
        recommendations.push(
          `${availableTrips.length} trip opportunities found along your route`,
        );
        recommendations.push(
          `Best opportunity: Earn ${bestTrip.estimatedEarnings.toFixed(0)} YER with only ${bestTrip.detourDistance.toFixed(1)}km detour`,
        );
      } else {
        recommendations.push('No trips currently available along your route');
        recommendations.push('You will be notified when new trips become available');
      }

      recommendations.push(
        `Direct route: ${directRoute.distance.toFixed(1)}km, ${directRoute.estimatedTime.toFixed(0)} minutes`,
      );
    }

    return recommendations;
  }

  /**
   * Deactivate destination mode
   */
  async deactivateDestinationMode(driverId: string): Promise<void> {
    const driver = await this.driverRepository.findOne({ id: driverId });
    if (!driver) {
      throw new Error('Driver not found');
    }

    // Reset driver to normal mode
    // This would typically update a field in the driver entity
    // For now, we just return
  }
}
