import { Injectable, Logger } from '@nestjs/common';
import { SMSProvider, SMSResult } from '../interfaces/sms-provider.interface';

/**
 * Local SMS Aggregator Adapter Stub
 * This is a placeholder for integrating with local Yemeni SMS providers/aggregators.
 * Replace the implementation with actual API calls to your SMS provider.
 */
@Injectable()
export class LocalAggregatorAdapterStub implements SMSProvider {
  private readonly logger = new Logger(LocalAggregatorAdapterStub.name);

  constructor() {
    this.logger.log('Local SMS Aggregator adapter initialized (STUB)');
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    // TODO: Replace with actual API call to local SMS provider
    // Example: POST to https://sms-provider.ye/api/send
    
    this.logger.log(`[STUB] Would send SMS to ${to}: ${message}`);

    // In development, simulate success
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`[DEV MODE] SMS to ${to}: ${message}`);
      return {
        success: true,
        messageId: `stub-${Date.now()}`,
        provider: 'local-aggregator-stub',
      };
    }

    // In production, this should make actual API call
    try {
      // Example implementation (replace with actual provider):
      // const response = await axios.post('https://sms-provider.ye/api/send', {
      //   phone: to,
      //   message: message,
      //   api_key: process.env.LOCAL_SMS_API_KEY,
      // });
      //
      // return {
      //   success: true,
      //   messageId: response.data.message_id,
      //   provider: 'local-aggregator',
      // };

      return {
        success: false,
        error: 'Local SMS aggregator not implemented',
        provider: 'local-aggregator-stub',
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS via local aggregator: ${error.message}`);
      return {
        success: false,
        error: error.message,
        provider: 'local-aggregator-stub',
      };
    }
  }

  async sendOTP(to: string, otp: string): Promise<SMSResult> {
    const message = `رمز التحقق الخاص بك في وصلني: ${otp}. صالح لمدة 10 دقائق.`;
    return this.sendSMS(to, message);
  }
}
