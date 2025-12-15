import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import { Trip } from '../../src/database/entities/trip.entity';
import { Driver } from '../../src/database/entities/driver.entity';
import { FraudAlert } from '../../src/database/entities/fraud-alert.entity';
import { TripStatus, FraudType, FraudSeverity } from '@wasilni/shared';

describe('Fraud Detection Integration Tests', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let adminToken: string;
  let testTripId: string;
  let testDriverId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    orm = moduleFixture.get<MikroORM>(MikroORM);
    await orm.getSchemaGenerator().refreshDatabase();

    await setupTestData();
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });

  async function setupTestData() {
    const em = orm.em.fork();

    // Create test trip with suspicious data
    const trip = em.create(Trip, {
      pickupLat: 15.3694,
      pickupLng: 44.191,
      dropoffLat: 15.3694, // Same as pickup (circular route)
      dropoffLng: 44.191,
      status: TripStatus.COMPLETED,
      actualDistance: 0.1, // Very short distance
      actualDuration: 60, // 1 minute
      fare: 1000,
    });

    await em.persistAndFlush(trip);
    testTripId = trip.id;

    // Get admin token
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ phone: '+967771111111', otp: '123456', role: 'SUPER_ADMIN' });
    adminToken = response.body.accessToken;
  }

  describe('GPS Spoofing Detection', () => {
    it('should detect impossible speed and flag as fraud', async () => {
      const em = orm.em.fork();

      // Create trip with impossible speed (200+ km/h)
      const trip = em.create(Trip, {
        pickupLat: 15.3694,
        pickupLng: 44.191,
        dropoffLat: 15.4778,
        dropoffLng: 44.2097,
        status: TripStatus.COMPLETED,
        actualDistance: 50, // 50 km
        actualDuration: 10 * 60, // 10 minutes = 300 km/h average speed
        fare: 5000,
      });

      await em.persistAndFlush(trip);

      // Run fraud detection
      const response = await request(app.getHttpServer())
        .post(`/api/v1/fraud-detection/check-trip/${trip.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.fraudDetected).toBe(true);
      expect(response.body.fraudTypes).toContain(FraudType.GPS_SPOOFING);
      expect(response.body.riskScore).toBeGreaterThan(70);
    });

    it('should not flag normal trips as fraud', async () => {
      const em = orm.em.fork();

      // Create normal trip
      const trip = em.create(Trip, {
        pickupLat: 15.3694,
        pickupLng: 44.191,
        dropoffLat: 15.4778,
        dropoffLng: 44.2097,
        status: TripStatus.COMPLETED,
        actualDistance: 12, // 12 km
        actualDuration: 20 * 60, // 20 minutes = 36 km/h average speed
        fare: 1500,
      });

      await em.persistAndFlush(trip);

      // Run fraud detection
      const response = await request(app.getHttpServer())
        .post(`/api/v1/fraud-detection/check-trip/${trip.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.fraudDetected).toBe(false);
      expect(response.body.riskScore).toBeLessThan(30);
    });
  });

  describe('Circular Route Detection', () => {
    it('should detect circular routes with same pickup/dropoff', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/fraud-detection/check-trip/${testTripId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.fraudDetected).toBe(true);
      expect(response.body.fraudTypes).toContain(FraudType.CIRCULAR_ROUTE);
    });
  });

  describe('Excessive Cancellations', () => {
    it('should detect pattern of excessive cancellations', async () => {
      const em = orm.em.fork();

      // Create 10 cancelled trips in 1 hour
      const now = new Date();
      const trips = [];

      for (let i = 0; i < 10; i++) {
        const trip = em.create(Trip, {
          pickupLat: 15.3694,
          pickupLng: 44.191,
          dropoffLat: 15.4778,
          dropoffLng: 44.2097,
          status: TripStatus.CANCELLED,
          createdAt: new Date(now.getTime() - i * 5 * 60 * 1000), // 5 min apart
        });
        trips.push(trip);
      }

      await em.persistAndFlush(trips);

      // Check for excessive cancellations
      const response = await request(app.getHttpServer())
        .post('/api/v1/fraud-detection/check-cancellation-pattern')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ driverId: testDriverId })
        .expect(200);

      expect(response.body.fraudDetected).toBe(true);
      expect(response.body.fraudTypes).toContain(FraudType.EXCESSIVE_CANCELLATIONS);
    });
  });

  describe('Auto-Suspension', () => {
    it('should automatically suspend account when risk score exceeds 80', async () => {
      const em = orm.em.fork();

      // Create high-risk fraud alert
      const alert = em.create(FraudAlert, {
        tripId: testTripId,
        fraudType: FraudType.GPS_SPOOFING,
        severity: FraudSeverity.CRITICAL,
        riskScore: 95,
        description: 'Impossible speed detected: 300 km/h',
        autoSuspended: true,
      });

      await em.persistAndFlush(alert);

      // Verify driver is suspended
      const driver = await em.findOne(Driver, { id: testDriverId });
      expect(driver?.isAvailable).toBe(false);
    });
  });

  describe('Performance Testing', () => {
    it('should complete fraud detection within 500ms', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post(`/api/v1/fraud-detection/check-trip/${testTripId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Admin Review', () => {
    it('should allow admin to review and override fraud alerts', async () => {
      const em = orm.em.fork();
      const alert = await em.findOne(FraudAlert, {});

      const response = await request(app.getHttpServer())
        .post(`/api/v1/fraud-detection/alerts/${alert!.id}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'DISMISS',
          notes: 'False positive - legitimate trip',
        })
        .expect(200);

      expect(response.body.status).toBe('DISMISSED');
    });
  });
});
