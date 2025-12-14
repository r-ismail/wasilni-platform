import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import { AuthService } from './services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let em: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                OTP_EXPIRY_MINUTES: 10,
                JWT_SECRET: 'test-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
                NODE_ENV: 'test',
              };
              return config[key];
            }),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            persistAndFlush: jest.fn(),
            flush: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    em = module.get<EntityManager>(EntityManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should generate and store OTP', async () => {
      const phone = '+967771234567';
      const result = await service.sendOtp({ phone, role: undefined });

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('OTP sent successfully');
    });
  });

  describe('verifyOtp', () => {
    it('should throw error for invalid OTP', async () => {
      const phone = '+967771234567';
      const otp = '123456';

      await expect(
        service.verifyOtp({ phone, otp, role: undefined }),
      ).rejects.toThrow('Invalid or expired OTP');
    });
  });
});
