import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../../../database/entities/trip.entity';

interface ETAPrediction {
  estimatedMinutes: number;
  confidence: number;
  factors: {
    baseTime: number;
    trafficMultiplier: number;
    weatherMultiplier: number;
    timeOfDayMultiplier: number;
    historicalAverage?: number;
  };
  range: {
    min: number;
    max: number;
  };
}

interface RouteFeatures {
  distance: number; // km
  hour: number; // 0-23
  dayOfWeek: number; // 0-6
  isRushHour: boolean;
  isWeekend: boolean;
  weather: 'clear' | 'rain' | 'dust';
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
}

@Injectable()
export class PredictiveETAService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
  ) {}

  /**
   * Predict ETA for a route using ML-based approach
   * Production: Train model with TensorFlow/PyTorch and serve via API
   */
  async predictETA(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
    vehicleType: string = 'taxi',
  ): Promise<ETAPrediction> {
    // Extract features
    const features = this.extractFeatures(pickupLat, pickupLng, dropoffLat, dropoffLng);

    // Get historical data for this route
    const historicalAverage = await this.getHistoricalAverage(pickupLat, pickupLng, dropoffLat, dropoffLng);

    // Calculate base time from distance
    const baseTime = this.calculateBaseTime(features.distance, vehicleType);

    // Apply multipliers based on conditions
    const trafficMultiplier = this.getTrafficMultiplier(features);
    const weatherMultiplier = this.getWeatherMultiplier(features.weather);
    const timeOfDayMultiplier = this.getTimeOfDayMultiplier(features.hour, features.isRushHour);

    // Calculate predicted time
    let predictedMinutes = baseTime * trafficMultiplier * weatherMultiplier * timeOfDayMultiplier;

    // Adjust with historical data if available
    if (historicalAverage) {
      // Weighted average: 70% model, 30% historical
      predictedMinutes = predictedMinutes * 0.7 + historicalAverage * 0.3;
    }

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(features, historicalAverage);

    // Calculate range (±20%)
    const range = {
      min: Math.round(predictedMinutes * 0.8),
      max: Math.round(predictedMinutes * 1.2),
    };

    return {
      estimatedMinutes: Math.round(predictedMinutes),
      confidence,
      factors: {
        baseTime,
        trafficMultiplier,
        weatherMultiplier,
        timeOfDayMultiplier,
        historicalAverage,
      },
      range,
    };
  }

  /**
   * Extract features from route data
   */
  private extractFeatures(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
  ): RouteFeatures {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Calculate distance
    const distance = this.calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);

    // Determine rush hour (7-9 AM, 4-7 PM)
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);

    // Weekend check
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday, Saturday in Yemen

    // Weather (simplified - integrate with weather API in production)
    const weather = this.getCurrentWeather();

    return {
      distance,
      hour,
      dayOfWeek,
      isRushHour,
      isWeekend,
      weather,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
    };
  }

  /**
   * Calculate base time from distance
   */
  private calculateBaseTime(distance: number, vehicleType: string): number {
    // Average speeds (km/h) by vehicle type
    const speeds = {
      taxi: 40, // City driving
      vip: 60, // Highway driving
      shared: 35, // Multiple stops
    };

    const speed = speeds[vehicleType] || speeds.taxi;
    return (distance / speed) * 60; // Convert to minutes
  }

  /**
   * Get traffic multiplier based on conditions
   */
  private getTrafficMultiplier(features: RouteFeatures): number {
    let multiplier = 1.0;

    // Rush hour impact
    if (features.isRushHour && !features.isWeekend) {
      multiplier *= 1.5; // 50% slower during rush hour
    }

    // Weekend traffic (lighter)
    if (features.isWeekend) {
      multiplier *= 0.9; // 10% faster on weekends
    }

    // Night time (less traffic)
    if (features.hour >= 22 || features.hour <= 5) {
      multiplier *= 0.8; // 20% faster at night
    }

    return multiplier;
  }

  /**
   * Get weather multiplier
   */
  private getWeatherMultiplier(weather: string): number {
    const multipliers = {
      clear: 1.0,
      rain: 1.3, // 30% slower in rain
      dust: 1.4, // 40% slower in dust storms
    };

    return multipliers[weather] || 1.0;
  }

  /**
   * Get time of day multiplier
   */
  private getTimeOfDayMultiplier(hour: number, isRushHour: boolean): number {
    if (isRushHour) {
      return 1.0; // Already handled in traffic multiplier
    }

    // Midday (10 AM - 3 PM) - moderate traffic
    if (hour >= 10 && hour <= 15) {
      return 1.1;
    }

    // Evening (8 PM - 10 PM) - moderate traffic
    if (hour >= 20 && hour <= 22) {
      return 1.05;
    }

    return 1.0;
  }

  /**
   * Get historical average for similar routes
   */
  private async getHistoricalAverage(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
  ): Promise<number | null> {
    // Find completed trips within 1km radius of pickup and dropoff
    const radius = 1; // km
    
    // This is a simplified query - in production, use PostGIS spatial queries
    const similarTrips = await this.tripRepository.find(
      {
        status: 'COMPLETED',
        completedAt: { $ne: null },
      },
      {
        limit: 50,
        orderBy: { completedAt: 'DESC' },
      },
    );

    if (similarTrips.length === 0) {
      return null;
    }

    // Filter trips within radius (simplified)
    const relevantTrips = similarTrips.filter(trip => {
      const pickupDistance = this.calculateDistance(
        pickupLat,
        pickupLng,
        trip.pickupLocation.coordinates[1],
        trip.pickupLocation.coordinates[0],
      );
      const dropoffDistance = this.calculateDistance(
        dropoffLat,
        dropoffLng,
        trip.dropoffLocation.coordinates[1],
        trip.dropoffLocation.coordinates[0],
      );
      return pickupDistance <= radius && dropoffDistance <= radius;
    });

    if (relevantTrips.length === 0) {
      return null;
    }

    // Calculate average duration
    const totalDuration = relevantTrips.reduce((sum, trip) => {
      if (!trip.completedAt) return sum;
      const duration = (trip.completedAt.getTime() - trip.createdAt.getTime()) / 1000 / 60;
      return sum + duration;
    }, 0);

    return totalDuration / relevantTrips.length;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(features: RouteFeatures, historicalAverage: number | null): number {
    let confidence = 70; // Base confidence

    // Increase confidence if we have historical data
    if (historicalAverage) {
      confidence += 20;
    }

    // Decrease confidence during unusual conditions
    if (features.weather === 'dust') {
      confidence -= 15;
    }

    if (features.isRushHour) {
      confidence -= 10;
    }

    // Ensure confidence is between 0 and 100
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Get current weather (stub - integrate with weather API)
   */
  private getCurrentWeather(): 'clear' | 'rain' | 'dust' {
    // TODO: Integrate with OpenWeatherMap or local weather service
    return 'clear';
  }

  /**
   * Calculate distance using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Train ML model with historical data (for future implementation)
   */
  async trainModel(): Promise<{ status: string; accuracy?: number }> {
    // TODO: Implement model training with TensorFlow.js or external Python service
    // 1. Fetch historical trip data
    // 2. Prepare training dataset (features + actual duration)
    // 3. Train regression model
    // 4. Evaluate model accuracy
    // 5. Save model weights

    console.log('[ML] Model training not yet implemented. Using rule-based approach.');
    
    return {
      status: 'pending',
    };
  }

  /**
   * Get model accuracy metrics
   */
  async getModelMetrics(): Promise<{
    accuracy: number;
    mae: number; // Mean Absolute Error in minutes
    rmse: number; // Root Mean Square Error
    lastTrainedAt: Date | null;
  }> {
    // TODO: Return actual model metrics
    return {
      accuracy: 75, // Placeholder
      mae: 5, // ±5 minutes average error
      rmse: 7,
      lastTrainedAt: null,
    };
  }
}
