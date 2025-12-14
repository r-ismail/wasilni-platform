import { MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from '../../mikro-orm.config';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';
import { PricingRule } from '../entities/pricing-rule.entity';
import { UserRole, TripType, ParcelSize, Currency } from '@wasilni/shared';
import * as bcrypt from 'bcrypt';

async function seed() {
  const orm = await MikroORM.init(mikroOrmConfig);
  const em = orm.em.fork();

  console.log('🌱 Starting database seeding...');

  try {
    // Create Tenants (Agencies)
    console.log('Creating tenants...');
    
    const sanaaAgency = em.create(Tenant, {
      name: 'Sana\'a Transport Agency',
      nameAr: 'وكالة نقل صنعاء',
      slug: 'sanaa-agency',
      description: 'Main transport agency in Sana\'a',
      contactEmail: 'info@sanaa-agency.ye',
      contactPhone: '+967771234567',
      address: {
        city: 'SANAA',
        district: 'Al-Tahrir',
      },
      settings: {
        defaultCurrency: 'YER',
        commissionRate: 0.15,
        features: ['IN_TOWN_TAXI', 'OUT_TOWN_VIP', 'OUT_TOWN_SHARED', 'PARCELS'],
      },
      isActive: true,
    });

    const adenAgency = em.create(Tenant, {
      name: 'Aden Transport Agency',
      nameAr: 'وكالة نقل عدن',
      slug: 'aden-agency',
      description: 'Main transport agency in Aden',
      contactEmail: 'info@aden-agency.ye',
      contactPhone: '+967772234567',
      address: {
        city: 'ADEN',
        district: 'Crater',
      },
      settings: {
        defaultCurrency: 'YER',
        commissionRate: 0.15,
        features: ['IN_TOWN_TAXI', 'OUT_TOWN_VIP', 'OUT_TOWN_SHARED', 'PARCELS'],
      },
      isActive: true,
    });

    await em.persistAndFlush([sanaaAgency, adenAgency]);
    console.log('✅ Tenants created');

    // Create Super Admin
    console.log('Creating super admin...');
    
    const superAdmin = em.create(User, {
      phone: '+967771111111',
      email: 'admin@wasilni.ye',
      firstName: 'Super',
      lastName: 'Admin',
      firstNameAr: 'مدير',
      lastNameAr: 'النظام',
      role: UserRole.SUPER_ADMIN,
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
      isActive: true,
    });

    await em.persistAndFlush(superAdmin);
    console.log('✅ Super admin created');

    // Create Pricing Rules
    console.log('Creating pricing rules...');

    // In-town taxi pricing for Sana'a
    const sanaaTaxiPricing = em.create(PricingRule, {
      tenantId: sanaaAgency.id,
      name: 'Sana\'a In-Town Taxi',
      nameAr: 'تاكسي داخل صنعاء',
      tripType: TripType.IN_TOWN_TAXI,
      baseFare: 500,
      perKmRate: 100,
      perMinuteRate: 20,
      minimumFare: 500,
      rushHourMultiplier: 1.5,
      rushHourWindows: [
        { dayOfWeek: 0, startTime: '07:00', endTime: '09:00' },
        { dayOfWeek: 0, startTime: '16:00', endTime: '19:00' },
      ],
      currency: Currency.YER,
      isActive: true,
    });

    // Out-town VIP pricing (Sana'a to Aden)
    const vipPricing = em.create(PricingRule, {
      name: 'Sana\'a-Aden VIP',
      nameAr: 'صنعاء-عدن VIP',
      tripType: TripType.OUT_TOWN_VIP,
      fromCity: 'SANAA',
      toCity: 'ADEN',
      corridor: 'SANAA_ADEN',
      baseFare: 50000,
      vipMultiplier: 1.3,
      minimumFare: 50000,
      currency: Currency.YER,
      isActive: true,
    });

    // Parcel pricing
    const parcelSmall = em.create(PricingRule, {
      name: 'Small Parcel - In City',
      nameAr: 'طرد صغير - داخل المدينة',
      parcelSize: ParcelSize.SMALL,
      baseFare: 300,
      perKmRate: 50,
      codFeeFixed: 100,
      codFeePercentage: 0.02,
      currency: Currency.YER,
      isActive: true,
    });

    const parcelMedium = em.create(PricingRule, {
      name: 'Medium Parcel - In City',
      nameAr: 'طرد متوسط - داخل المدينة',
      parcelSize: ParcelSize.MEDIUM,
      baseFare: 500,
      perKmRate: 75,
      codFeeFixed: 150,
      codFeePercentage: 0.02,
      currency: Currency.YER,
      isActive: true,
    });

    await em.persistAndFlush([
      sanaaTaxiPricing,
      vipPricing,
      parcelSmall,
      parcelMedium,
    ]);
    console.log('✅ Pricing rules created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Tenants: 2 (Sana\'a Agency, Aden Agency)');
    console.log('- Super Admin: 1 (+967771111111)');
    console.log('- Pricing Rules: 4');
    console.log('\n🔐 Super Admin Login:');
    console.log('Phone: +967771111111');
    console.log('Use OTP authentication to login');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await orm.close();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
