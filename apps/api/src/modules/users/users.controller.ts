import { Controller, Get, Put, Body } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: CurrentUserPayload): Promise<User> {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() data: Partial<User>,
  ): Promise<User> {
    return this.usersService.updateProfile(user.id, data);
  }
}
