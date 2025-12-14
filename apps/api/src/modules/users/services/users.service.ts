import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ id, isActive: true });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    
    // Only allow updating specific fields
    const allowedFields = ['firstName', 'lastName', 'firstNameAr', 'lastNameAr', 'email', 'avatarUrl', 'preferredLanguage'];
    
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        user[field] = data[field];
      }
    });

    await this.em.flush();
    return user;
  }

  async verifyId(userId: string, idDocument: any): Promise<User> {
    const user = await this.findById(userId);
    user.idDocument = idDocument;
    user.isIdVerified = true;
    user.idVerifiedAt = new Date();
    await this.em.flush();
    return user;
  }
}
