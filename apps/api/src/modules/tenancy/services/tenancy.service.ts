import { Injectable, Scope } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

@Injectable({ scope: Scope.REQUEST })
export class TenancyService {
  private tenantId: string | null = null;
  private isSuperAdmin = false;

  constructor(private readonly em: EntityManager) {}

  setTenantId(tenantId: string | null): void {
    this.tenantId = tenantId;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }

  setSuperAdmin(isSuperAdmin: boolean): void {
    this.isSuperAdmin = isSuperAdmin;
  }

  getIsSuperAdmin(): boolean {
    return this.isSuperAdmin;
  }

  async applyTenantContext(): Promise<void> {
    if (this.isSuperAdmin) {
      await this.em.getConnection().execute(`SET app.is_super_admin = 'true'`);
    } else if (this.tenantId) {
      await this.em.getConnection().execute(`SET app.tenant_id = '${this.tenantId}'`);
      await this.em.getConnection().execute(`SET app.is_super_admin = 'false'`);
    }
  }

  async clearTenantContext(): Promise<void> {
    await this.em.getConnection().execute(`RESET app.tenant_id`);
    await this.em.getConnection().execute(`RESET app.is_super_admin`);
  }
}
