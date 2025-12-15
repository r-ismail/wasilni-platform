import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Driver } from '../../../database/entities/driver.entity';
import { Trip } from '../../../database/entities/trip.entity';
import { Parcel } from '../../../database/entities/parcel.entity';
import { DriverStatus, TripType } from '@wasilni/shared';

interface MatchingCriteria {
  location: { lat: number; lng: number };
  tenantId?: string;
  vehicleType?: string;
  maxDistance?: number; // in kilometers
  tripType?: TripType;
  requiredCapacity?: number;
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: EntityRepository<Driver>,
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(Parcel)
    private readonly parcelRepository: EntityRepository<Parcel>,
  ) {}

  /**
   * Find available drivers near a location using PostGIS spatial queries
   */
  async findNearbyDrivers(criteria: MatchingCriteria): Promise<Driver[]> {
    const { location, tenantId, vehicleType, maxDistance = 5 } = criteria;

    // Build PostGIS query to find drivers within radius
    const qb = this.driverRepository.createQueryBuilder('d');
    
    qb.where({
      status: DriverStatus.ONLINE,
      isActive: true,
    });

    if (tenantId) {
      qb.andWhere({ tenant: tenantId as any });
    }

    if (vehicleType) {
      qb.andWhere({ vehicleType });
    }

    // PostGIS distance query (ST_DWithin uses meters)
    qb.andWhere(
      `ST_DWithin(
        d.current_location,
        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
        ?
      )`,
      [location.lng, location.lat, maxDistance * 1000],
    );

    // Order by distance (closest first)
    qb.orderByRaw(
      `ST_Distance(
        d.current_location,
        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
      )`,
      [location.lng, location.lat],
    );

    qb.limit(10);

    return qb.getResultList();
  }

  /**
   * Assign a driver to a trip based on proximity and availability
   */
  async assignDriverToTrip(tripId: string): Promise<Driver | null> {
    const trip = await this.tripRepository.findOneOrFail(tripId, {
      populate: ['tenant'],
    });

    const pickupCoords = trip.pickupLocation.coordinates;
    const criteria: MatchingCriteria = {
      location: { lat: pickupCoords[1], lng: pickupCoords[0] },
      tenantId: (trip.tenant as any).id,
      tripType: trip.type,
      maxDistance: 10, // 10km radius
    };

    const availableDrivers = await this.findNearbyDrivers(criteria);

    if (availableDrivers.length === 0) {
      return null;
    }

    // Simple assignment: pick the closest driver
    const assignedDriver = availableDrivers[0];

    // Update trip with assigned driver
    trip.driver = assignedDriver as any;
    trip.status = 'ASSIGNED' as any;
    await this.tripRepository.flush();

    return assignedDriver;
  }

  /**
   * Assign a driver to a parcel delivery
   */
  async assignDriverToParcel(parcelId: string): Promise<Driver | null> {
    const parcel = await this.parcelRepository.findOneOrFail(parcelId, {
      populate: ['tenant'],
    });

    const pickupCoords = parcel.pickupLocation.coordinates;
    const criteria: MatchingCriteria = {
      location: { lat: pickupCoords[1], lng: pickupCoords[0] },
      tenantId: (parcel.tenant as any).id,
      maxDistance: 15, // 15km radius for parcels
    };

    const availableDrivers = await this.findNearbyDrivers(criteria);

    if (availableDrivers.length === 0) {
      return null;
    }

    const assignedDriver = availableDrivers[0];

    parcel.driver = assignedDriver as any;
    parcel.status = 'ASSIGNED' as any;
    await this.parcelRepository.flush();

    return assignedDriver;
  }

  /**
   * Find potential shared ride matches for out-of-town trips
   */
  async findSharedRideMatches(tripId: string): Promise<Trip[]> {
    const trip = await this.tripRepository.findOneOrFail(tripId);

    // Find trips with similar route and time window
    const qb = this.tripRepository.createQueryBuilder('t');

    qb.where({
      type: TripType.OUT_TOWN_SHARED,
      status: 'REQUESTED' as any,
      tenant: trip.tenant,
    });

    qb.andWhere('t.id != ?', [tripId]);

    // Find trips within 1 hour of scheduled pickup
    if (trip.scheduledPickupTime) {
      qb.andWhere(
        `t.scheduled_pickup_time BETWEEN ? AND ?`,
        [
          new Date(trip.scheduledPickupTime.getTime() - 30 * 60 * 1000),
          new Date(trip.scheduledPickupTime.getTime() + 30 * 60 * 1000),
        ],
      );
    }

    // TODO: Add spatial proximity checks for pickup/dropoff locations

    qb.limit(5);

    return qb.getResultList();
  }

  /**
   * Calculate pooling capacity for a driver
   */
  async getDriverAvailableCapacity(driverId: string): Promise<number> {
    const driver = await this.driverRepository.findOneOrFail(driverId);

    // Count active trips assigned to this driver
    const activeTrips = await this.tripRepository.count({
      driver: driverId as any,
      status: { $in: ['ASSIGNED', 'DRIVER_ARRIVED', 'STARTED'] as any[] },
    });

    const totalCapacity = driver.vehicleCapacity || 4;
    return Math.max(0, totalCapacity - activeTrips);
  }

  /**
   * Batch assignment for multiple trips/parcels
   */
  async batchAssign(entityIds: string[], entityType: 'trip' | 'parcel'): Promise<any[]> {
    const results = [];

    for (const id of entityIds) {
      try {
        const driver = entityType === 'trip'
          ? await this.assignDriverToTrip(id)
          : await this.assignDriverToParcel(id);

        results.push({
          entityId: id,
          success: !!driver,
          driverId: driver?.id,
        });
      } catch (error) {
        results.push({
          entityId: id,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}
