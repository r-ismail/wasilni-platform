export interface SMSProvider {
  sendSMS(to: string, message: string): Promise<SMSResult>;
  sendOTP(to: string, otp: string): Promise<SMSResult>;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}
