import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Tenant } from '../../../database/entities/tenant.entity';
import { User } from '../../../database/entities/user.entity';
import { UserRole } from '@wasilni/shared';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: EntityRepository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async findAll() {
    return this.tenantRepository.findAll({
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.tenantRepository.findOneOrFail(id);
  }

  async create(data: Partial<Tenant>) {
    const tenant = this.tenantRepository.create(data);
    await this.tenantRepository.persistAndFlush(tenant);
    return tenant;
  }

  async update(id: string, data: Partial<Tenant>) {
    const tenant = await this.tenantRepository.findOneOrFail(id);
    this.tenantRepository.assign(tenant, data);
    await this.tenantRepository.flush();
    return tenant;
  }

  async createAgentAccount(tenantId: string, agentData: Partial<User>) {
    const agent = this.userRepository.create({
      ...agentData,
      tenant: tenantId as any,
      role: UserRole.AGENCY_ADMIN,
      isActive: true,
    });
    await this.userRepository.persistAndFlush(agent);
    return agent;
  }

  async getAgencyAgents(tenantId: string) {
    return this.userRepository.find({
      tenant: tenantId as any,
      role: { $in: [UserRole.AGENCY_ADMIN, UserRole.DISPATCHER] },
    });
  }
}
