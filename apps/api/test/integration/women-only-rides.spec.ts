import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/database/entities/user.entity';
import { Driver } from '../../src/database/entities/driver.entity';
import { Trip } from '../../src/database/entities/trip.entity';
import { UserRole, Gender, TripStatus, TripType } from '@wasilni/shared';

describe('Women-Only Rides Integration Tests', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let femaleCustomerToken: string;
  let maleCustomerToken: string;
  let femaleDriverId: string;
  let maleDriverId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    orm = moduleFixture.get<MikroORM>(MikroORM);
    await orm.getSchemaGenerator().refreshDatabase();

    // Create test users and drivers
    await setupTestData();
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  async function setupTestData() {
    const em = orm.em.fork();

    // Create female customer
    const femaleCustomer = em.create(User, {
      phone: '+967771111001',
      role: UserRole.CUSTOMER,
      gender: Gender.FEMALE,
      fullName: 'Fatima Ahmed',
    });

    // Create male customer
    const maleCustomer = em.create(User, {
      phone: '+967771111002',
      role: UserRole.CUSTOMER,
      gender: Gender.MALE,
      fullName: 'Mohammed Ali',
    });

    // Create female driver
    const femaleDriver = em.create(Driver, {
      user: femaleCustomer, // Simplified for testing
      gender: Gender.FEMALE,
      licenseNumber: 'F123456',
      vehicleModel: 'Toyota Corolla',
      vehiclePlate: 'ABC-123',
      isAvailable: true,
      isOnline: true,
      kycStatus: 'APPROVED',
    });

    // Create male driver
    const maleDriver = em.create(Driver, {
      user: maleCustomer,
      gender: Gender.MALE,
      licenseNumber: 'M123456',
      vehicleModel: 'Honda Civic',
      vehiclePlate: 'XYZ-789',
      isAvailable: true,
      isOnline: true,
      kycStatus: 'APPROVED',
    });

    await em.persistAndFlush([femaleCustomer, maleCustomer, femaleDriver, maleDriver]);

    femaleDriverId = femaleDriver.id;
    maleDriverId = maleDriver.id;

    // Get auth tokens
    const femaleResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ phone: '+967771111001', otp: '123456', role: UserRole.CUSTOMER });
    femaleCustomerToken = femaleResponse.body.accessToken;

    const maleResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ phone: '+967771111002', otp: '123456', role: UserRole.CUSTOMER });
    maleCustomerToken = maleResponse.body.accessToken;
  }

  describe('Women-Only Ride Request', () => {
    it('should allow female passenger to request women-only ride', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${femaleCustomerToken}`)
        .send({
          pickupLat: 15.3694,
          pickupLng: 44.191,
          dropoffLat: 15.4778,
          dropoffLng: 44.2097,
          tripType: TripType.IN_TOWN_TAXI,
          womenOnlyRide: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.womenOnlyRide).toBe(true);
      expect(response.body.status).toBe(TripStatus.REQUESTED);
    });

    it('should reject male passenger requesting women-only ride', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${maleCustomerToken}`)
        .send({
          pickupLat: 15.3694,
          pickupLng: 44.191,
          dropoffLat: 15.4778,
          dropoffLng: 44.2097,
          tripType: TripType.IN_TOWN_TAXI,
          womenOnlyRide: true,
        })
        .expect(400);

      expect(response.body.message).toContain('women-only');
    });

    it('should only match female drivers for women-only rides', async () => {
      // Create women-only trip
      const tripResponse = await request(app.getHttpServer())
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${femaleCustomerToken}`)
        .send({
          pickupLat: 15.3694,
          pickupLng: 44.191,
          dropoffLat: 15.4778,
          dropoffLng: 44.2097,
          tripType: TripType.IN_TOWN_TAXI,
          womenOnlyRide: true,
        });

      const tripId = tripResponse.body.id;

      // Trigger matching
      const matchResponse = await request(app.getHttpServer())
        .post(`/api/v1/matching/find-driver`)
        .send({
          tripId,
          pickupLat: 15.3694,
          pickupLng: 44.191,
        })
        .expect(200);

      // Verify only female driver is in the pool
      expect(matchResponse.body.drivers).toBeDefined();
      const driverIds = matchResponse.body.drivers.map((d: any) => d.id);
      expect(driverIds).toContain(femaleDriverId);
      expect(driverIds).not.toContain(maleDriverId);
    });

    it('should return error when no female drivers available', async () => {
      // Set all female drivers offline
      const em = orm.em.fork();
      const femaleDriver = await em.findOne(Driver, { id: femaleDriverId });
      femaleDriver!.isOnline = false;
      await em.flush();

      const response = await request(app.getHttpServer())
        .post('/api/v1/trips')
        .set('Authorization', `Bearer ${femaleCustomerToken}`)
        .send({
          pickupLat: 15.3694,
          pickupLng: 44.191,
          dropoffLat: 15.4778,
          dropoffLng: 44.2097,
          tripType: TripType.IN_TOWN_TAXI,
          womenOnlyRide: true,
        });

      // Attempt matching
      const matchResponse = await request(app.getHttpServer())
        .post(`/api/v1/matching/find-driver`)
        .send({
          tripId: response.body.id,
          pickupLat: 15.3694,
          pickupLng: 44.191,
        })
        .expect(404);

      expect(matchResponse.body.message).toContain('No available drivers');

      // Restore driver status
      femaleDriver!.isOnline = true;
      await em.flush();
    });
  });

  describe('Performance Testing', () => {
    it('should complete gender filtering within 50ms', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post(`/api/v1/matching/find-driver`)
        .send({
          tripId: 'test-trip-id',
          pickupLat: 15.3694,
          pickupLng: 44.191,
          womenOnlyRide: true,
        });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(50);
    });
  });
});
