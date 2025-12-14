import { Module, Global } from '@nestjs/common';
import { TenancyService } from './services/tenancy.service';
import { TenantContextMiddleware } from './tenant-context.middleware';

@Global()
@Module({
  providers: [TenancyService],
  exports: [TenancyService],
})
export class TenancyModule {}
