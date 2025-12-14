import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../../database/entities/user.entity';
import { Driver } from '../../../database/entities/driver.entity';
import { SendOtpDto, VerifyOtpDto, AuthResponseDto } from '../dto/auth.dto';
import { UserRole } from '@wasilni/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { otp: string; expiresAt: Date }>();

  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const { phone, role } = dto;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Store OTP (in production, use Redis with TTL)
    const key = `${phone}:${role}`;
    this.otpStore.set(key, { otp, expiresAt });

    // TODO: Send SMS via provider
    console.log(`📱 OTP for ${phone}: ${otp} (expires at ${expiresAt.toISOString()})`);

    // In development, return OTP in response (REMOVE IN PRODUCTION)
    if (this.configService.get('NODE_ENV') === 'development') {
      return { message: `OTP sent successfully. DEV MODE: ${otp}` };
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    const { phone, otp, role, deviceToken } = dto;

    // Verify OTP
    const key = `${phone}:${role}`;
    const stored = this.otpStore.get(key);

    if (!stored) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (stored.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(key);
      throw new UnauthorizedException('OTP has expired');
    }

    // Clear OTP
    this.otpStore.delete(key);

    // Find or create user/driver
    let user: User | Driver;

    if (role === UserRole.DRIVER) {
      user = await this.em.findOne(Driver, { phone });
      if (!user) {
        throw new BadRequestException('Driver not found. Please contact admin.');
      }
    } else {
      user = await this.em.findOne(User, { phone });
      if (!user) {
        // Auto-create customer
        user = this.em.create(User, {
          phone,
          role: UserRole.CUSTOMER,
          isPhoneVerified: true,
          phoneVerifiedAt: new Date(),
        });
        await this.em.persistAndFlush(user);
      } else {
        // Update verification status
        user.isPhoneVerified = true;
        user.phoneVerifiedAt = new Date();
      }
    }

    // Update device token
    if (deviceToken) {
      user.deviceToken = deviceToken;
    }

    user.lastLoginAt = new Date();
    await this.em.flush();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        phone: user.phone,
        role: role === UserRole.DRIVER ? UserRole.DRIVER : (user as User).role,
        tenantId: user.tenantId,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      let user: User | Driver | null;

      if (payload.role === UserRole.DRIVER) {
        user = await this.em.findOne(Driver, { id: payload.sub });
      } else {
        user = await this.em.findOne(User, { id: payload.sub });
      }

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          phone: user.phone,
          role: payload.role,
          tenantId: user.tenantId,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: User | Driver): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user instanceof Driver ? UserRole.DRIVER : (user as User).role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token
    user.refreshToken = refreshToken;
    await this.em.flush();

    return { accessToken, refreshToken };
  }
}
