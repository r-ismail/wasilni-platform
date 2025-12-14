import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../../database/entities/user.entity';
import { Driver } from '../../../database/entities/driver.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Payload contains: { sub: userId, phone, role, tenantId }
    const userId = payload.sub;

    // Verify user still exists and is active
    let user: User | Driver | null = null;

    if (payload.role === 'DRIVER') {
      user = await this.em.findOne(Driver, { id: userId, isActive: true });
    } else {
      user = await this.em.findOne(User, { id: userId, isActive: true });
    }

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: userId,
      phone: payload.phone,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
