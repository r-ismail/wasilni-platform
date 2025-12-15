import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Rating, RatingType } from '../../../database/entities/rating.entity';
import { Trip } from '../../../database/entities/trip.entity';
import { User } from '../../../database/entities/user.entity';
import { Driver } from '../../../database/entities/driver.entity';
import { CreateRatingDto } from '../dto/rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: EntityRepository<Rating>,
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Driver)
    private readonly driverRepository: EntityRepository<Driver>,
  ) {}

  async createCustomerToDriverRating(
    customerId: string,
    dto: CreateRatingDto,
  ): Promise<Rating> {
    const trip = await this.tripRepository.findOne(
      { id: dto.tripId },
      { populate: ['customer', 'driver', 'tenant'] },
    );

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.customer.id !== customerId) {
      throw new BadRequestException('You can only rate your own trips');
    }

    if (!trip.driver) {
      throw new BadRequestException('Trip has no assigned driver');
    }

    // Check if already rated
    const existingRating = await this.ratingRepository.findOne({
      trip: trip.id,
      type: RatingType.CUSTOMER_TO_DRIVER,
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this trip');
    }

    // AI moderation stub - check for abusive content
    const isAbusive = await this.moderateContent(dto.comment, dto.tags);

    const rating = this.ratingRepository.create({
      tenant: trip.tenant,
      trip,
      type: RatingType.CUSTOMER_TO_DRIVER,
      ratedBy: trip.customer,
      ratedDriver: trip.driver,
      stars: dto.stars,
      comment: dto.comment,
      tags: dto.tags,
      flaggedAsAbusive: isAbusive,
    });

    await this.ratingRepository.persistAndFlush(rating);

    // Update driver's average rating
    await this.updateDriverRating(trip.driver.id);

    return rating;
  }

  async createDriverToCustomerRating(
    driverId: string,
    dto: CreateRatingDto,
  ): Promise<Rating> {
    const trip = await this.tripRepository.findOne(
      { id: dto.tripId },
      { populate: ['customer', 'driver', 'tenant'] },
    );

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driver?.id !== driverId) {
      throw new BadRequestException('You can only rate trips you completed');
    }

    // Check if already rated
    const existingRating = await this.ratingRepository.findOne({
      trip: trip.id,
      type: RatingType.DRIVER_TO_CUSTOMER,
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this customer');
    }

    // AI moderation stub
    const isAbusive = await this.moderateContent(dto.comment, dto.tags);

    const rating = this.ratingRepository.create({
      tenant: trip.tenant,
      trip,
      type: RatingType.DRIVER_TO_CUSTOMER,
      ratedByDriver: trip.driver,
      ratedUser: trip.customer,
      stars: dto.stars,
      comment: dto.comment,
      tags: dto.tags,
      flaggedAsAbusive: isAbusive,
    });

    await this.ratingRepository.persistAndFlush(rating);

    // Update customer's average rating
    await this.updateCustomerRating(trip.customer.id);

    return rating;
  }

  private async updateDriverRating(driverId: string): Promise<void> {
    const ratings = await this.ratingRepository.find({
      ratedDriver: driverId,
      flaggedAsAbusive: false,
    });

    const driver = await this.driverRepository.findOne({ id: driverId });
    if (!driver) return;

    const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
    driver.rating = ratings.length > 0 ? totalStars / ratings.length : 0;
    driver.totalRatings = ratings.length;

    await this.driverRepository.flush();
  }

  private async updateCustomerRating(userId: string): Promise<void> {
    const ratings = await this.ratingRepository.find({
      ratedUser: userId,
      flaggedAsAbusive: false,
    });

    const user = await this.userRepository.findOne({ id: userId });
    if (!user) return;

    const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
    user.rating = ratings.length > 0 ? totalStars / ratings.length : 0;
    user.totalRatings = ratings.length;

    await this.userRepository.flush();
  }

  /**
   * AI moderation stub - In production, integrate with NLP API
   * to detect abusive language, spam, fake reviews
   */
  private async moderateContent(
    comment?: string,
    tags?: string[],
  ): Promise<boolean> {
    if (!comment && !tags) return false;

    // Simple keyword-based moderation (replace with AI in production)
    const abusiveKeywords = [
      'scam',
      'fraud',
      'terrible',
      'worst',
      'hate',
      'stupid',
      'idiot',
    ];

    const textToCheck = [comment, ...(tags || [])].join(' ').toLowerCase();

    return abusiveKeywords.some((keyword) => textToCheck.includes(keyword));
  }

  async getRatingsForDriver(driverId: string, page: number = 1, limit: number = 20) {
    const [ratings, total] = await this.ratingRepository.findAndCount(
      { ratedDriver: driverId, flaggedAsAbusive: false },
      {
        populate: ['ratedBy', 'trip'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset: (page - 1) * limit,
      },
    );

    return {
      data: ratings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRatingsForCustomer(userId: string, page: number = 1, limit: number = 20) {
    const [ratings, total] = await this.ratingRepository.findAndCount(
      { ratedUser: userId, flaggedAsAbusive: false },
      {
        populate: ['ratedByDriver', 'trip'],
        orderBy: { createdAt: 'DESC' },
        limit,
        offset: (page - 1) * limit,
      },
    );

    return {
      data: ratings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
