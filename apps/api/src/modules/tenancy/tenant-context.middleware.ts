import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenancyService } from './services/tenancy.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@wasilni/shared';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly tenancyService: TenancyService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = this.jwtService.decode(token) as any;

        if (payload) {
          // Set tenant context
          if (payload.tenantId) {
            this.tenancyService.setTenantId(payload.tenantId);
          }

          // Set super admin flag
          if (payload.role === UserRole.SUPER_ADMIN) {
            this.tenancyService.setSuperAdmin(true);
          }

          // Apply to database connection
          await this.tenancyService.applyTenantContext();
        }
      }
    } catch (error) {
      // If token is invalid, continue without tenant context
      console.error('Error setting tenant context:', error.message);
    }

    next();
  }
}
