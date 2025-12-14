import { IsString, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@wasilni/shared';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+967[0-9]{9}$/, {
    message: 'Phone number must be in format +967XXXXXXXXX',
  })
  phone: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CUSTOMER;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+967[0-9]{9}$/, {
    message: 'Phone number must be in format +967XXXXXXXXX',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{6}$/, {
    message: 'OTP must be 6 digits',
  })
  otp: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CUSTOMER;

  @IsString()
  @IsOptional()
  deviceToken?: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    role: UserRole;
    tenantId?: string;
  };
}
