import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RatingsService } from './services/ratings.service';
import { CreateRatingDto, GetRatingsDto } from './dto/rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('customer-to-driver')
  async rateDriver(
    @CurrentUser() user: any,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.createCustomerToDriverRating(user.sub, dto);
  }

  @Post('driver-to-customer')
  async rateCustomer(
    @CurrentUser() user: any,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.createDriverToCustomerRating(user.sub, dto);
  }

  @Get('driver/:driverId')
  async getDriverRatings(
    @Param('driverId') driverId: string,
    @Query() query: GetRatingsDto,
  ) {
    return this.ratingsService.getRatingsForDriver(
      driverId,
      query.page,
      query.limit,
    );
  }

  @Get('customer/:userId')
  async getCustomerRatings(
    @Param('userId') userId: string,
    @Query() query: GetRatingsDto,
  ) {
    return this.ratingsService.getRatingsForCustomer(
      userId,
      query.page,
      query.limit,
    );
  }
}
