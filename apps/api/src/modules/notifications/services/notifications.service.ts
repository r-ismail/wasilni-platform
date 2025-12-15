import { Injectable, Inject, Logger } from '@nestjs/common';
import { SMSProvider } from '../interfaces/sms-provider.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject('SMS_PROVIDER')
    private readonly smsProvider: SMSProvider,
  ) {}

  async sendSMS(to: string, message: string) {
    this.logger.log(`Sending SMS to ${to}`);
    return this.smsProvider.sendSMS(to, message);
  }

  async sendOTP(to: string, otp: string) {
    this.logger.log(`Sending OTP to ${to}`);
    return this.smsProvider.sendOTP(to, otp);
  }

  async sendTripNotification(to: string, tripStatus: string, details: any) {
    const message = `Your trip status: ${tripStatus}. Driver: ${details.driverName || 'Assigned'}`;
    return this.sendSMS(to, message);
  }

  async sendParcelNotification(to: string, parcelStatus: string, trackingCode: string) {
    const message = `Parcel ${trackingCode} status: ${parcelStatus}`;
    return this.sendSMS(to, message);
  }

  // Stub for push notifications
  async sendPushNotification(deviceToken: string, title: string, body: string) {
    this.logger.log(`[STUB] Push notification to ${deviceToken}: ${title}`);
    // TODO: Implement FCM/APNS integration
    return { success: true };
  }
}
