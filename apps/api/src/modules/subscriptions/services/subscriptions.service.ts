import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../database/entities/subscription.entity';
import { User } from '../../../database/entities/user.entity';

interface PlanDetails {
  plan: SubscriptionPlan;
  monthlyPrice: number;
  benefits: {
    freeRidesPerMonth?: number;
    discountPercentage?: number;
    prioritySupport?: boolean;
    noSurgePricing?: boolean;
    freeDeliveries?: number;
  };
  features: string[];
}

@Injectable()
export class SubscriptionsService {
  private readonly planDetails: Record<SubscriptionPlan, PlanDetails> = {
    [SubscriptionPlan.FREE]: {
      plan: SubscriptionPlan.FREE,
      monthlyPrice: 0,
      benefits: {},
      features: ['Basic ride booking', 'Standard support'],
    },
    [SubscriptionPlan.BASIC]: {
      plan: SubscriptionPlan.BASIC,
      monthlyPrice: 5000, // YER
      benefits: {
        freeRidesPerMonth: 2,
        discountPercentage: 5,
      },
      features: [
        '2 free rides per month',
        '5% discount on all rides',
        'Priority booking',
        'Email support',
      ],
    },
    [SubscriptionPlan.PREMIUM]: {
      plan: SubscriptionPlan.PREMIUM,
      monthlyPrice: 10000, // YER
      benefits: {
        freeRidesPerMonth: 5,
        discountPercentage: 10,
        prioritySupport: true,
        freeDeliveries: 3,
      },
      features: [
        '5 free rides per month',
        '10% discount on all rides',
        '3 free parcel deliveries',
        'Priority support 24/7',
        'No surge pricing',
        'Exclusive offers',
      ],
    },
    [SubscriptionPlan.ENTERPRISE]: {
      plan: SubscriptionPlan.ENTERPRISE,
      monthlyPrice: 25000, // YER
      benefits: {
        freeRidesPerMonth: 15,
        discountPercentage: 20,
        prioritySupport: true,
        noSurgePricing: true,
        freeDeliveries: 10,
      },
      features: [
        '15 free rides per month',
        '20% discount on all rides',
        '10 free parcel deliveries',
        'Dedicated account manager',
        'No surge pricing',
        'Custom billing',
        'Priority support 24/7',
      ],
    },
  };

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: EntityRepository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  /**
   * Get all available plans
   */
  async getAvailablePlans(): Promise<PlanDetails[]> {
    return Object.values(this.planDetails);
  }

  /**
   * Subscribe user to a plan
   */
  async subscribe(
    userId: string,
    tenantId: string,
    plan: SubscriptionPlan,
  ): Promise<Subscription> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      user: { id: userId },
      status: SubscriptionStatus.ACTIVE,
    });

    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    const planDetails = this.planDetails[plan];
    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const subscription = this.subscriptionRepository.create({
      tenant: { id: tenantId } as any,
      user: { id: userId } as any,
      plan,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      monthlyPrice: planDetails.monthlyPrice,
      currency: 'YER',
      benefits: planDetails.benefits,
      autoRenew: true,
      nextBillingDate,
    });

    await this.em.persistAndFlush(subscription);

    return subscription;
  }

  /**
   * Upgrade subscription
   */
  async upgrade(
    userId: string,
    newPlan: SubscriptionPlan,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      user: { id: userId },
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const currentPlanOrder = this.getPlanOrder(subscription.plan);
    const newPlanOrder = this.getPlanOrder(newPlan);

    if (newPlanOrder <= currentPlanOrder) {
      throw new BadRequestException('Can only upgrade to a higher plan');
    }

    const planDetails = this.planDetails[newPlan];

    subscription.plan = newPlan;
    subscription.monthlyPrice = planDetails.monthlyPrice;
    subscription.benefits = planDetails.benefits;

    await this.em.persistAndFlush(subscription);

    return subscription;
  }

  /**
   * Downgrade subscription
   */
  async downgrade(
    userId: string,
    newPlan: SubscriptionPlan,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      user: { id: userId },
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const currentPlanOrder = this.getPlanOrder(subscription.plan);
    const newPlanOrder = this.getPlanOrder(newPlan);

    if (newPlanOrder >= currentPlanOrder) {
      throw new BadRequestException('Can only downgrade to a lower plan');
    }

    const planDetails = this.planDetails[newPlan];

    subscription.plan = newPlan;
    subscription.monthlyPrice = planDetails.monthlyPrice;
    subscription.benefits = planDetails.benefits;

    await this.em.persistAndFlush(subscription);

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancel(userId: string, reason?: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      user: { id: userId },
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    subscription.cancelReason = reason;
    subscription.autoRenew = false;

    await this.em.persistAndFlush(subscription);

    return subscription;
  }

  /**
   * Pause subscription
   */
  async pause(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      user: { id: userId },
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.status = SubscriptionStatus.PAUSED;

    await this.em.persistAndFlush(subscription);

    return subscription;
  }

  /**
   * Resume subscription
   */
  async resume(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      user: { id: userId },
      status: SubscriptionStatus.PAUSED,
    });

    if (!subscription) {
      throw new NotFoundException('No paused subscription found');
    }

    subscription.status = SubscriptionStatus.ACTIVE;

    await this.em.persistAndFlush(subscription);

    return subscription;
  }

  /**
   * Get user's subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      user: { id: userId },
      status: SubscriptionStatus.ACTIVE,
    });
  }

  /**
   * Check if user has benefit
   */
  async hasBenefit(
    userId: string,
    benefit: keyof PlanDetails['benefits'],
  ): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || !subscription.benefits) {
      return false;
    }

    return !!subscription.benefits[benefit];
  }

  /**
   * Get remaining free rides
   */
  async getRemainingFreeRides(userId: string): Promise<number> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || !subscription.benefits?.freeRidesPerMonth) {
      return 0;
    }

    // In production, this would track actual usage
    // For now, return the full allocation
    return subscription.benefits.freeRidesPerMonth;
  }

  /**
   * Get discount percentage
   */
  async getDiscountPercentage(userId: string): Promise<number> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || !subscription.benefits?.discountPercentage) {
      return 0;
    }

    return subscription.benefits.discountPercentage;
  }

  /**
   * Get plan order for comparison
   */
  private getPlanOrder(plan: SubscriptionPlan): number {
    const order = {
      [SubscriptionPlan.FREE]: 0,
      [SubscriptionPlan.BASIC]: 1,
      [SubscriptionPlan.PREMIUM]: 2,
      [SubscriptionPlan.ENTERPRISE]: 3,
    };

    return order[plan];
  }
}
