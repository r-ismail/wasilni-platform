import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bull';
import mikroOrmConfig from './mikro-orm.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { UsersModule } from './modules/users/users.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { TripsModule } from './modules/trips/trips.module';
import { ParcelsModule } from './modules/parcels/parcels.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { AdminModule } from './modules/admin/admin.module';
import { AgenciesModule } from './modules/agencies/agencies.module';
import { MatchingModule } from './modules/matching/matching.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { SafetyModule } from './modules/safety/safety.module';
import { VoiceModule } from './modules/voice/voice.module';
import { FraudDetectionModule } from './modules/fraud-detection/fraud-detection.module';
import { MLModule } from './modules/ml/ml.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    MikroOrmModule.forRoot(mikroOrmConfig),

    // Redis & Queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // Feature Modules
    TenancyModule,
    AuthModule,
    UsersModule,
    DriversModule,
    AgenciesModul    AgenciesModule,
    MatchingModule,
    RatingsModule,
    SafetyModule,
    VoiceModule,
    FraudDetectionModule,
    MLModule,
    WalletModule,
    AnalyticsModule,
    ParcelsModule,
    PricingModule,
    LedgerModule,
    NotificationsModule,
    FilesModule,
    WebsocketModule,
    AdminModule,
  ],
})
export class AppModule {}
