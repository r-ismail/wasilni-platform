import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { TwilioAdapter } from './adapters/twilio.adapter';
import { LocalAggregatorAdapterStub } from './adapters/local-aggregator.adapter';

@Module({
  providers: [
    NotificationsService,
    TwilioAdapter,
    LocalAggregatorAdapterStub,
    {
      provide: 'SMS_PROVIDER',
      useFactory: (
        twilioAdapter: TwilioAdapter,
        localAdapter: LocalAggregatorAdapterStub,
      ) => {
        // Choose SMS provider based on environment configuration
        const provider = process.env.SMS_PROVIDER || 'local';
        return provider === 'twilio' ? twilioAdapter : localAdapter;
      },
      inject: [TwilioAdapter, LocalAggregatorAdapterStub],
    },
  ],
  exports: [NotificationsService, 'SMS_PROVIDER'],
})
export class NotificationsModule {}
