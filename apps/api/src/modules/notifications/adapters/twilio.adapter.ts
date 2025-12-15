import { Injectable, Logger } from '@nestjs/common';
import { SMSProvider, SMSResult } from '../interfaces/sms-provider.interface';

@Injectable()
export class TwilioAdapter implements SMSProvider {
  private readonly logger = new Logger(TwilioAdapter.name);
  private twilioClient: any;

  constructor() {
    // Initialize Twilio client if credentials are provided
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      try {
        // Lazy load twilio package
        const twilio = require('twilio');
        this.twilioClient = twilio(accountSid, authToken);
        this.logger.log('Twilio SMS adapter initialized');
      } catch (error) {
        this.logger.warn('Twilio package not installed or credentials invalid');
      }
    } else {
      this.logger.warn('Twilio credentials not configured');
    }
  }

  async sendSMS(to: string, message: string): Promise<SMSResult> {
    if (!this.twilioClient) {
      return {
        success: false,
        error: 'Twilio client not initialized',
        provider: 'twilio',
      };
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });

      this.logger.log(`SMS sent via Twilio to ${to}: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        provider: 'twilio',
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS via Twilio: ${error.message}`);
      return {
        success: false,
        error: error.message,
        provider: 'twilio',
      };
    }
  }

  async sendOTP(to: string, otp: string): Promise<SMSResult> {
    const message = `Your Wasilni verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSMS(to, message);
  }
}
