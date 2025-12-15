import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FraudAlert, FraudType, FraudSeverity, FraudStatus } from '../../../database/entities/fraud-alert.entity';
import { Trip } from '../../../database/entities/trip.entity';
import { User } from '../../../database/entities/user.entity';
import { Driver } from '../../../database/entities/driver.entity';
import { TripStatus } from '@wasilni/shared';

interface FraudCheckResult {
  isFraudulent: boolean;
  fraudType?: FraudType;
  severity?: FraudSeverity;
  confidence: number;
  evidence: Record<string, any>;
  description: string;
}

@Injectable()
export class FraudDetectionService {
  constructor(
    @InjectRepository(FraudAlert)
    private readonly fraudAlertRepository: EntityRepository<FraudAlert>,
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Driver)
    private readonly driverRepository: EntityRepository<Driver>,
  ) {}

  /**
   * Comprehensive fraud check for a trip
   */
  async checkTripForFraud(tripId: string): Promise<FraudCheckResult | null> {
    const trip = await this.tripRepository.findOne(
      { id: tripId },
      { populate: ['customer', 'driver', 'tenant'] },
    );

    if (!trip) return null;

    // Run multiple fraud detection checks
    const checks = await Promise.all([
      this.checkGPSSpoofing(trip),
      this.checkCircularRoute(trip),
      this.checkImpossibleSpeed(trip),
      this.checkDuplicateCoordinates(trip),
    ]);

    // Find the most severe fraud detected
    const fraudDetected = checks.find(check => check.isFraudulent);

    if (fraudDetected) {
      // Create fraud alert
      await this.createFraudAlert(trip, fraudDetected);
      
      // Auto-suspend if critical
      if (fraudDetected.severity === FraudSeverity.CRITICAL) {
        await this.autoSuspendAccount(trip, fraudDetected);
      }
    }

    return fraudDetected || {
      isFraudulent: false,
      confidence: 100,
      evidence: {},
      description: 'No fraud detected',
    };
  }

  /**
   * Check for GPS spoofing (impossible locations)
   */
  private async checkGPSSpoofing(trip: Trip): Promise<FraudCheckResult> {
    // Check if coordinates are in impossible locations (ocean, restricted areas)
    const pickup = trip.pickupLocation.coordinates;
    const dropoff = trip.dropoffLocation.coordinates;

    // Simple check: coordinates should be within Yemen bounds
    const yemenBounds = {
      minLat: 12.0,
      maxLat: 19.0,
      minLng: 42.0,
      maxLng: 54.0,
    };

    const pickupInBounds =
      pickup[1] >= yemenBounds.minLat &&
      pickup[1] <= yemenBounds.maxLat &&
      pickup[0] >= yemenBounds.minLng &&
      pickup[0] <= yemenBounds.maxLng;

    const dropoffInBounds =
      dropoff[1] >= yemenBounds.minLat &&
      dropoff[1] <= yemenBounds.maxLat &&
      dropoff[0] >= yemenBounds.minLng &&
      dropoff[0] <= yemenBounds.maxLng;

    if (!pickupInBounds || !dropoffInBounds) {
      return {
        isFraudulent: true,
        fraudType: FraudType.GPS_SPOOFING,
        severity: FraudSeverity.HIGH,
        confidence: 95,
        evidence: {
          pickup: { lat: pickup[1], lng: pickup[0], inBounds: pickupInBounds },
          dropoff: { lat: dropoff[1], lng: dropoff[0], inBounds: dropoffInBounds },
        },
        description: 'GPS coordinates outside Yemen boundaries',
      };
    }

    return { isFraudulent: false, confidence: 100, evidence: {}, description: 'GPS coordinates valid' };
  }

  /**
   * Check for circular routes (pickup and dropoff too close)
   */
  private async checkCircularRoute(trip: Trip): Promise<FraudCheckResult> {
    const pickup = trip.pickupLocation.coordinates;
    const dropoff = trip.dropoffLocation.coordinates;

    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(pickup[1], pickup[0], dropoff[1], dropoff[0]);

    // Flag if distance is less than 100 meters but fare is high
    if (distance < 0.1 && trip.estimatedFare > 500) {
      return {
        isFraudulent: true,
        fraudType: FraudType.CIRCULAR_ROUTE,
        severity: FraudSeverity.MEDIUM,
        confidence: 85,
        evidence: {
          distance: `${distance.toFixed(2)} km`,
          fare: trip.estimatedFare,
          threshold: '0.1 km',
        },
        description: 'Circular route detected: pickup and dropoff too close for high fare',
      };
    }

    return { isFraudulent: false, confidence: 100, evidence: {}, description: 'Route distance valid' };
  }

  /**
   * Check for impossible speed (distance vs time)
   */
  private async checkImpossibleSpeed(trip: Trip): Promise<FraudCheckResult> {
    if (trip.status !== TripStatus.COMPLETED || !trip.completedAt) {
      return { isFraudulent: false, confidence: 100, evidence: {}, description: 'Trip not completed yet' };
    }

    const pickup = trip.pickupLocation.coordinates;
    const dropoff = trip.dropoffLocation.coordinates;
    const distance = this.calculateDistance(pickup[1], pickup[0], dropoff[1], dropoff[0]);

    const duration = (trip.completedAt.getTime() - trip.createdAt.getTime()) / 1000 / 60; // minutes
    const speed = (distance / duration) * 60; // km/h

    // Flag if speed exceeds 200 km/h (impossible for ground transport)
    if (speed > 200) {
      return {
        isFraudulent: true,
        fraudType: FraudType.IMPOSSIBLE_SPEED,
        severity: FraudSeverity.CRITICAL,
        confidence: 98,
        evidence: {
          distance: `${distance.toFixed(2)} km`,
          duration: `${duration.toFixed(2)} minutes`,
          speed: `${speed.toFixed(2)} km/h`,
          threshold: '200 km/h',
        },
        description: 'Impossible speed detected: trip completed too quickly',
      };
    }

    return { isFraudulent: false, confidence: 100, evidence: {}, description: 'Speed within normal range' };
  }

  /**
   * Check for duplicate coordinates (fake GPS data)
   */
  private async checkDuplicateCoordinates(trip: Trip): Promise<FraudCheckResult> {
    const pickup = trip.pickupLocation.coordinates;
    const dropoff = trip.dropoffLocation.coordinates;

    // Check if pickup and dropoff are exactly the same
    if (pickup[0] === dropoff[0] && pickup[1] === dropoff[1]) {
      return {
        isFraudulent: true,
        fraudType: FraudType.DUPLICATE_COORDINATES,
        severity: FraudSeverity.HIGH,
        confidence: 90,
        evidence: {
          pickup: { lat: pickup[1], lng: pickup[0] },
          dropoff: { lat: dropoff[1], lng: dropoff[0] },
        },
        description: 'Duplicate coordinates: pickup and dropoff are identical',
      };
    }

    return { isFraudulent: false, confidence: 100, evidence: {}, description: 'Coordinates are unique' };
  }

  /**
   * Check user behavior patterns
   */
  async checkUserBehavior(userId: string): Promise<FraudCheckResult | null> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) return null;

    // Get user's recent trips
    const recentTrips = await this.tripRepository.find(
      { customer: userId },
      { orderBy: { createdAt: 'DESC' }, limit: 20 },
    );

    // Check cancellation rate
    const cancelledCount = recentTrips.filter(t => t.status === TripStatus.CANCELLED).length;
    const cancellationRate = recentTrips.length > 0 ? (cancelledCount / recentTrips.length) * 100 : 0;

    if (cancellationRate > 50 && recentTrips.length >= 10) {
      const fraudResult: FraudCheckResult = {
        isFraudulent: true,
        fraudType: FraudType.EXCESSIVE_CANCELLATIONS,
        severity: FraudSeverity.MEDIUM,
        confidence: 80,
        evidence: {
          totalTrips: recentTrips.length,
          cancelledTrips: cancelledCount,
          cancellationRate: `${cancellationRate.toFixed(2)}%`,
        },
        description: 'Excessive cancellations detected',
      };

      await this.createUserFraudAlert(user, fraudResult);
      return fraudResult;
    }

    return { isFraudulent: false, confidence: 100, evidence: {}, description: 'User behavior normal' };
  }

  /**
   * Check driver behavior patterns
   */
  async checkDriverBehavior(driverId: string): Promise<FraudCheckResult | null> {
    const driver = await this.driverRepository.findOne({ id: driverId });
    if (!driver) return null;

    // Get driver's recent trips
    const recentTrips = await this.tripRepository.find(
      { driver: driverId },
      { orderBy: { createdAt: 'DESC' }, limit: 20 },
    );

    // Check for suspicious patterns (e.g., too many short trips with high fares)
    const suspiciousTrips = recentTrips.filter(trip => {
      const pickup = trip.pickupLocation.coordinates;
      const dropoff = trip.dropoffLocation.coordinates;
      const distance = this.calculateDistance(pickup[1], pickup[0], dropoff[1], dropoff[0]);
      return distance < 1 && trip.finalFare && trip.finalFare > 1000;
    });

    if (suspiciousTrips.length > 5) {
      const fraudResult: FraudCheckResult = {
        isFraudulent: true,
        fraudType: FraudType.SUSPICIOUS_PATTERN,
        severity: FraudSeverity.HIGH,
        confidence: 85,
        evidence: {
          totalTrips: recentTrips.length,
          suspiciousTrips: suspiciousTrips.length,
          pattern: 'Short distance with high fare',
        },
        description: 'Suspicious trip pattern detected',
      };

      await this.createDriverFraudAlert(driver, fraudResult);
      return fraudResult;
    }

    return { isFraudulent: false, confidence: 100, evidence: {}, description: 'Driver behavior normal' };
  }

  /**
   * Create fraud alert
   */
  private async createFraudAlert(trip: Trip, fraudResult: FraudCheckResult): Promise<FraudAlert> {
    const alert = this.fraudAlertRepository.create({
      tenant: trip.tenant,
      type: fraudResult.fraudType!,
      severity: fraudResult.severity!,
      status: FraudStatus.PENDING,
      user: trip.customer,
      driver: trip.driver,
      trip,
      description: fraudResult.description,
      evidence: fraudResult.evidence,
      confidenceScore: fraudResult.confidence,
    });

    await this.fraudAlertRepository.persistAndFlush(alert);
    return alert;
  }

  /**
   * Create user fraud alert
   */
  private async createUserFraudAlert(user: User, fraudResult: FraudCheckResult): Promise<FraudAlert> {
    const alert = this.fraudAlertRepository.create({
      tenant: user.tenant!,
      type: fraudResult.fraudType!,
      severity: fraudResult.severity!,
      status: FraudStatus.PENDING,
      user,
      description: fraudResult.description,
      evidence: fraudResult.evidence,
      confidenceScore: fraudResult.confidence,
    });

    await this.fraudAlertRepository.persistAndFlush(alert);
    return alert;
  }

  /**
   * Create driver fraud alert
   */
  private async createDriverFraudAlert(driver: Driver, fraudResult: FraudCheckResult): Promise<FraudAlert> {
    const alert = this.fraudAlertRepository.create({
      tenant: driver.tenant,
      type: fraudResult.fraudType!,
      severity: fraudResult.severity!,
      status: FraudStatus.PENDING,
      driver,
      description: fraudResult.description,
      evidence: fraudResult.evidence,
      confidenceScore: fraudResult.confidence,
    });

    await this.fraudAlertRepository.persistAndFlush(alert);
    return alert;
  }

  /**
   * Auto-suspend account for critical fraud
   */
  private async autoSuspendAccount(trip: Trip, fraudResult: FraudCheckResult): Promise<void> {
    if (trip.driver) {
      trip.driver.isActive = false;
      await this.driverRepository.flush();
      console.log(`[FRAUD] Auto-suspended driver ${trip.driver.id} for ${fraudResult.fraudType}`);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
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
   * Get fraud alerts for review
   */
  async getFraudAlerts(status?: FraudStatus, page: number = 1, limit: number = 20) {
    const where = status ? { status } : {};
    
    const [alerts, total] = await this.fraudAlertRepository.findAndCount(where, {
      populate: ['user', 'driver', 'trip'],
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: (page - 1) * limit,
    });

    return {
      data: alerts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Review fraud alert
   */
  async reviewFraudAlert(
    alertId: string,
    status: FraudStatus,
    reviewerId: string,
    notes?: string,
  ): Promise<FraudAlert> {
    const alert = await this.fraudAlertRepository.findOneOrFail(alertId);
    
    alert.status = status;
    alert.reviewedAt = new Date();
    alert.reviewedBy = reviewerId;
    alert.reviewNotes = notes;

    if (!alert.actionsTaken) {
      alert.actionsTaken = [];
    }

    alert.actionsTaken.push({
      action: `Status changed to ${status}`,
      timestamp: new Date().toISOString(),
      performedBy: reviewerId,
    });

    await this.fraudAlertRepository.flush();
    return alert;
  }
}
