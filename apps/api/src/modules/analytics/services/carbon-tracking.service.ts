import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../../../database/entities/trip.entity';
import { Parcel } from '../../../database/entities/parcel.entity';
import { User } from '../../../database/entities/user.entity';

interface CarbonFootprint {
  totalCO2Saved: number; // in kg
  totalDistanceTraveled: number; // in km
  totalTrips: number;
  comparisonWithCar: {
    carCO2: number;
    savedCO2: number;
    percentageSaved: number;
  };
  breakdown: {
    byMonth: Array<{ month: string; co2Saved: number }>;
    byTripType: Array<{ type: string; co2Saved: number }>;
  };
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
}

@Injectable()
export class CarbonTrackingService {
  // Emission factors (kg CO2 per km)
  private readonly emissionFactors = {
    car: 0.192, // Average car
    sharedRide: 0.096, // Shared ride (half of car)
    taxi: 0.15, // Taxi (slightly less than car due to optimization)
    publicTransport: 0.089, // Bus/public transport
  };

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(Parcel)
    private readonly parcelRepository: EntityRepository<Parcel>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  /**
   * Calculate carbon footprint for a user
   */
  async getUserCarbonFootprint(userId: string): Promise<CarbonFootprint> {
    const trips = await this.tripRepository.find({
      customer: { id: userId },
      status: 'COMPLETED',
    });

    const totalDistanceTraveled = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalTrips = trips.length;

    // Calculate CO2 saved by using shared rides vs. driving alone
    const sharedTrips = trips.filter(t => t.isShared);
    const regularTrips = trips.filter(t => !t.isShared);

    const sharedCO2 = sharedTrips.reduce(
      (sum, t) => sum + (t.distance || 0) * this.emissionFactors.sharedRide,
      0,
    );

    const regularCO2 = regularTrips.reduce(
      (sum, t) => sum + (t.distance || 0) * this.emissionFactors.taxi,
      0,
    );

    const totalCO2 = sharedCO2 + regularCO2;

    // Calculate what it would have been if they drove a car
    const carCO2 = totalDistanceTraveled * this.emissionFactors.car;
    const savedCO2 = carCO2 - totalCO2;
    const percentageSaved = carCO2 > 0 ? (savedCO2 / carCO2) * 100 : 0;

    // Breakdown by month
    const byMonth = this.calculateMonthlyBreakdown(trips);

    // Breakdown by trip type
    const byTripType = [
      {
        type: 'Shared Rides',
        co2Saved: sharedTrips.reduce(
          (sum, t) =>
            sum +
            (t.distance || 0) * (this.emissionFactors.car - this.emissionFactors.sharedRide),
          0,
        ),
      },
      {
        type: 'Regular Rides',
        co2Saved: regularTrips.reduce(
          (sum, t) =>
            sum + (t.distance || 0) * (this.emissionFactors.car - this.emissionFactors.taxi),
          0,
        ),
      },
    ];

    // Calculate achievements
    const achievements = this.calculateAchievements(savedCO2, totalTrips, sharedTrips.length);

    return {
      totalCO2Saved: savedCO2,
      totalDistanceTraveled,
      totalTrips,
      comparisonWithCar: {
        carCO2,
        savedCO2,
        percentageSaved,
      },
      breakdown: {
        byMonth,
        byTripType,
      },
      achievements,
    };
  }

  /**
   * Calculate platform-wide carbon impact
   */
  async getPlatformCarbonImpact(tenantId: string): Promise<{
    totalCO2Saved: number;
    totalUsers: number;
    totalTrips: number;
    equivalentTrees: number; // Trees needed to offset this CO2
    equivalentCars: number; // Cars taken off the road
  }> {
    const trips = await this.tripRepository.find({
      tenant: { id: tenantId },
      status: 'COMPLETED',
    });

    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const sharedTrips = trips.filter(t => t.isShared);

    const sharedCO2 = sharedTrips.reduce(
      (sum, t) => sum + (t.distance || 0) * this.emissionFactors.sharedRide,
      0,
    );

    const regularCO2 = (trips.length - sharedTrips.length) * this.emissionFactors.taxi;
    const totalCO2 = sharedCO2 + regularCO2;

    const carCO2 = totalDistance * this.emissionFactors.car;
    const savedCO2 = carCO2 - totalCO2;

    // Calculate equivalents
    const equivalentTrees = Math.round(savedCO2 / 21); // 1 tree absorbs ~21 kg CO2/year
    const equivalentCars = Math.round(savedCO2 / 4600); // Average car emits ~4600 kg CO2/year

    const uniqueUsers = new Set(trips.map(t => t.customer?.id).filter(Boolean)).size;

    return {
      totalCO2Saved: savedCO2,
      totalUsers: uniqueUsers,
      totalTrips: trips.length,
      equivalentTrees,
      equivalentCars,
    };
  }

  /**
   * Calculate monthly breakdown
   */
  private calculateMonthlyBreakdown(
    trips: Trip[],
  ): Array<{ month: string; co2Saved: number }> {
    const monthlyData: Record<string, number> = {};

    trips.forEach(trip => {
      if (!trip.completedAt) return;

      const month = trip.completedAt.toISOString().substring(0, 7); // YYYY-MM
      const distance = trip.distance || 0;
      const emissionFactor = trip.isShared
        ? this.emissionFactors.sharedRide
        : this.emissionFactors.taxi;

      const co2Saved = distance * (this.emissionFactors.car - emissionFactor);

      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += co2Saved;
    });

    return Object.entries(monthlyData)
      .map(([month, co2Saved]) => ({ month, co2Saved }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate achievements
   */
  private calculateAchievements(
    savedCO2: number,
    totalTrips: number,
    sharedTrips: number,
  ): Array<{
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }> {
    return [
      {
        title: 'Eco Warrior',
        description: 'Saved 10kg of CO2',
        icon: '🌱',
        unlocked: savedCO2 >= 10,
      },
      {
        title: 'Green Champion',
        description: 'Saved 50kg of CO2',
        icon: '🌿',
        unlocked: savedCO2 >= 50,
      },
      {
        title: 'Planet Protector',
        description: 'Saved 100kg of CO2',
        icon: '🌍',
        unlocked: savedCO2 >= 100,
      },
      {
        title: 'Sharing is Caring',
        description: 'Completed 10 shared rides',
        icon: '🤝',
        unlocked: sharedTrips >= 10,
      },
      {
        title: 'Frequent Rider',
        description: 'Completed 50 trips',
        icon: '🚗',
        unlocked: totalTrips >= 50,
      },
      {
        title: 'Climate Hero',
        description: 'Saved 500kg of CO2',
        icon: '🏆',
        unlocked: savedCO2 >= 500,
      },
    ];
  }

  /**
   * Get carbon savings for a specific trip
   */
  async getTripCarbonSavings(tripId: string): Promise<{
    co2Saved: number;
    comparisonText: string;
  }> {
    const trip = await this.tripRepository.findOne({ id: tripId });
    if (!trip) {
      return { co2Saved: 0, comparisonText: 'Trip not found' };
    }

    const distance = trip.distance || 0;
    const emissionFactor = trip.isShared
      ? this.emissionFactors.sharedRide
      : this.emissionFactors.taxi;

    const tripCO2 = distance * emissionFactor;
    const carCO2 = distance * this.emissionFactors.car;
    const co2Saved = carCO2 - tripCO2;

    const comparisonText = `You saved ${co2Saved.toFixed(2)}kg of CO2 compared to driving alone. That's equivalent to planting ${Math.round(co2Saved / 21)} trees!`;

    return {
      co2Saved,
      comparisonText,
    };
  }
}
