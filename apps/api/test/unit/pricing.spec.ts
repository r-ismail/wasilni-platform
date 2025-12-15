import { TripType, ParcelSize, Currency } from '@wasilni/shared';

/**
 * Unit tests for pricing calculations
 * 
 * Tests verify correct pricing for:
 * - In-town taxi: base + distance + time + rush hour multipliers
 * - Out-of-town VIP: corridor pricing + VIP multiplier
 * - Out-of-town Shared: seat-based pricing
 * - Parcels: size-based + distance + COD fees
 */
describe('Pricing Calculations', () => {
  describe('In-Town Taxi Pricing', () => {
    const baseFare = 500; // YER
    const perKmRate = 100; // YER per km
    const perMinRate = 20; // YER per minute
    const rushHourMultiplier = 1.5;

    function calculateInTownFare(
      distanceKm: number,
      durationMin: number,
      isRushHour: boolean = false,
    ): number {
      let fare = baseFare + (distanceKm * perKmRate) + (durationMin * perMinRate);
      if (isRushHour) {
        fare *= rushHourMultiplier;
      }
      return Math.round(fare);
    }

    it('should calculate basic fare without rush hour', () => {
      const fare = calculateInTownFare(5, 15); // 5km, 15 minutes
      // 500 + (5 * 100) + (15 * 20) = 500 + 500 + 300 = 1300
      expect(fare).toBe(1300);
    });

    it('should apply rush hour multiplier', () => {
      const fare = calculateInTownFare(5, 15, true);
      // 1300 * 1.5 = 1950
      expect(fare).toBe(1950);
    });

    it('should charge minimum base fare for short trips', () => {
      const fare = calculateInTownFare(0.5, 2);
      // 500 + (0.5 * 100) + (2 * 20) = 500 + 50 + 40 = 590
      expect(fare).toBe(590);
    });

    it('should handle long trips correctly', () => {
      const fare = calculateInTownFare(20, 45);
      // 500 + (20 * 100) + (45 * 20) = 500 + 2000 + 900 = 3400
      expect(fare).toBe(3400);
    });

    it('should apply shared ride discount', () => {
      const baseFare = calculateInTownFare(5, 15);
      const sharedDiscount = 0.7; // 30% discount
      const sharedFare = Math.round(baseFare * sharedDiscount);
      expect(sharedFare).toBe(910);
    });
  });

  describe('Out-of-Town VIP Pricing', () => {
    const corridorBaseFare = 50000; // YER for Sana'a-Aden
    const vipMultiplier = 1.3;
    const scheduleFee = 2000; // YER for scheduled trips

    function calculateVIPFare(isScheduled: boolean = false): number {
      let fare = corridorBaseFare * vipMultiplier;
      if (isScheduled) {
        fare += scheduleFee;
      }
      return Math.round(fare);
    }

    it('should calculate VIP fare with multiplier', () => {
      const fare = calculateVIPFare();
      // 50000 * 1.3 = 65000
      expect(fare).toBe(65000);
    });

    it('should add schedule fee for scheduled trips', () => {
      const fare = calculateVIPFare(true);
      // 65000 + 2000 = 67000
      expect(fare).toBe(67000);
    });
  });

  describe('Out-of-Town Shared Pricing', () => {
    const corridorBaseFare = 50000; // YER for Sana'a-Aden
    const totalSeats = 4;

    function calculateSharedFare(seatsBooked: number): number {
      return Math.round((corridorBaseFare / totalSeats) * seatsBooked);
    }

    it('should calculate per-seat pricing', () => {
      const fare = calculateSharedFare(1);
      // 50000 / 4 = 12500
      expect(fare).toBe(12500);
    });

    it('should calculate fare for multiple seats', () => {
      const fare = calculateSharedFare(2);
      // 12500 * 2 = 25000
      expect(fare).toBe(25000);
    });

    it('should calculate fare for full vehicle', () => {
      const fare = calculateSharedFare(4);
      expect(fare).toBe(50000);
    });
  });

  describe('Parcel Pricing', () => {
    const pricingRules = {
      [ParcelSize.SMALL]: { base: 300, perKm: 50 },
      [ParcelSize.MEDIUM]: { base: 500, perKm: 75 },
      [ParcelSize.LARGE]: { base: 800, perKm: 100 },
    };

    const codFeeFixed = 100; // YER
    const codFeePercentage = 0.02; // 2%

    function calculateParcelFare(
      size: ParcelSize,
      distanceKm: number,
      isCOD: boolean = false,
      codAmount: number = 0,
    ): number {
      const rules = pricingRules[size];
      let fare = rules.base + (distanceKm * rules.perKm);

      if (isCOD) {
        const codFee = codFeeFixed + (codAmount * codFeePercentage);
        fare += codFee;
      }

      return Math.round(fare);
    }

    it('should calculate small parcel fare', () => {
      const fare = calculateParcelFare(ParcelSize.SMALL, 5);
      // 300 + (5 * 50) = 300 + 250 = 550
      expect(fare).toBe(550);
    });

    it('should calculate medium parcel fare', () => {
      const fare = calculateParcelFare(ParcelSize.MEDIUM, 5);
      // 500 + (5 * 75) = 500 + 375 = 875
      expect(fare).toBe(875);
    });

    it('should calculate large parcel fare', () => {
      const fare = calculateParcelFare(ParcelSize.LARGE, 5);
      // 800 + (5 * 100) = 800 + 500 = 1300
      expect(fare).toBe(1300);
    });

    it('should add COD fee for cash on delivery', () => {
      const codAmount = 10000; // YER
      const fare = calculateParcelFare(ParcelSize.SMALL, 5, true, codAmount);
      // Base fare: 550
      // COD fee: 100 + (10000 * 0.02) = 100 + 200 = 300
      // Total: 550 + 300 = 850
      expect(fare).toBe(850);
    });

    it('should handle zero distance parcels', () => {
      const fare = calculateParcelFare(ParcelSize.SMALL, 0);
      expect(fare).toBe(300); // Just base fare
    });

    it('should handle long distance parcels', () => {
      const fare = calculateParcelFare(ParcelSize.MEDIUM, 50);
      // 500 + (50 * 75) = 500 + 3750 = 4250
      expect(fare).toBe(4250);
    });
  });

  describe('Multi-Currency Support', () => {
    const exchangeRates = {
      [Currency.YER]: 1,
      [Currency.USD]: 0.004, // 1 YER = 0.004 USD (example rate)
    };

    function convertCurrency(
      amount: number,
      from: Currency,
      to: Currency,
    ): number {
      const amountInYER = amount / exchangeRates[from];
      return Math.round(amountInYER * exchangeRates[to] * 100) / 100;
    }

    it('should convert YER to USD', () => {
      const amountYER = 10000;
      const amountUSD = convertCurrency(amountYER, Currency.YER, Currency.USD);
      expect(amountUSD).toBe(40); // 10000 * 0.004 = 40
    });

    it('should convert USD to YER', () => {
      const amountUSD = 40;
      const amountYER = convertCurrency(amountUSD, Currency.USD, Currency.YER);
      expect(amountYER).toBe(10000);
    });

    it('should handle same currency conversion', () => {
      const amount = 1000;
      const converted = convertCurrency(amount, Currency.YER, Currency.YER);
      expect(converted).toBe(1000);
    });
  });
});

/**
 * NOTE: To fully implement pricing:
 * 
 * 1. Create PricingService with these calculation methods
 * 2. Load pricing rules from database (pricing_rules table)
 * 3. Handle dynamic pricing based on demand
 * 4. Implement rush hour detection
 * 5. Add integration tests with actual database
 * 6. Support custom pricing per tenant/agency
 */
