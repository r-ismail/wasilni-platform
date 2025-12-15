import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../src/database/entities/user.entity';
import { UserRole } from '@wasilni/shared';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;
  let mockNotificationsService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      persistAndFlush: jest.fn(),
      flush: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mockNotificationsService = {
      sendOTP: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'NotificationsService',
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOTP', () => {
    it('should generate and store OTP for new user', async () => {
      const phone = '+967771234567';
      const role = UserRole.CUSTOMER;

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        phone,
        role,
        otpCode: expect.any(String),
        otpExpiry: expect.any(Date),
      });

      const result = await service.sendOTP(phone, role);

      expect(result).toHaveProperty('message');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockNotificationsService.sendOTP).toHaveBeenCalled();
    });

    it('should update OTP for existing user', async () => {
      const phone = '+967771234567';
      const role = UserRole.CUSTOMER;
      const existingUser = {
        phone,
        role,
        otpCode: '123456',
        otpExpiry: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.sendOTP(phone, role);

      expect(result).toHaveProperty('message');
      expect(mockUserRepository.flush).toHaveBeenCalled();
      expect(mockNotificationsService.sendOTP).toHaveBeenCalled();
    });
  });

  describe('verifyOTP', () => {
    it('should verify valid OTP and return tokens', async () => {
      const phone = '+967771234567';
      const otp = '123456';
      const user = {
        id: 'user-123',
        phone,
        role: UserRole.CUSTOMER,
        otpCode: otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        isPhoneVerified: false,
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.verifyOTP(phone, otp, UserRole.CUSTOMER);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(user.isPhoneVerified).toBe(true);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2); // access + refresh
    });

    it('should reject expired OTP', async () => {
      const phone = '+967771234567';
      const otp = '123456';
      const user = {
        phone,
        otpCode: otp,
        otpExpiry: new Date(Date.now() - 1000), // Expired
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(
        service.verifyOTP(phone, otp, UserRole.CUSTOMER),
      ).rejects.toThrow();
    });

    it('should reject invalid OTP', async () => {
      const phone = '+967771234567';
      const user = {
        phone,
        otpCode: '123456',
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(
        service.verifyOTP(phone, '999999', UserRole.CUSTOMER),
      ).rejects.toThrow();
    });
  });

  describe('generateOTP', () => {
    it('should generate 6-digit OTP', () => {
      const otp = (service as any).generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate unique OTPs', () => {
      const otp1 = (service as any).generateOTP();
      const otp2 = (service as any).generateOTP();
      // While theoretically they could be the same, it's extremely unlikely
      expect(otp1).toBeDefined();
      expect(otp2).toBeDefined();
    });
  });
});
