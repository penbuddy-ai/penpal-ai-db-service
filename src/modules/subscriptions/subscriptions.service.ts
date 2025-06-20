import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { Subscription, SubscriptionDocument, SubscriptionPlan, SubscriptionStatus } from "./schemas/subscription.schema";

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly logger: Logger,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDocument> {
    try {
      // Check if user already has a subscription using direct MongoDB query to avoid exceptions
      const existingSubscription = await this.subscriptionModel.findOne({ userId: createSubscriptionDto.userId }).exec();
      if (existingSubscription) {
        throw new ConflictException("User already has a subscription");
      }

      const createdSubscription = new this.subscriptionModel(createSubscriptionDto);
      return await createdSubscription.save();
    }
    catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating subscription: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to create subscription");
    }
  }

  async findAll(limit?: number, offset?: number): Promise<SubscriptionDocument[]> {
    try {
      let query = this.subscriptionModel.find();

      if (offset) {
        query = query.skip(offset);
      }

      if (limit) {
        query = query.limit(limit);
      }

      return await query.exec();
    }
    catch (error) {
      this.logger.error(`Error finding all subscriptions: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve subscriptions");
    }
  }

  async findOne(id: string): Promise<SubscriptionDocument> {
    try {
      const subscription = await this.subscriptionModel.findById(id).exec();
      if (!subscription) {
        throw new NotFoundException(`Subscription with ID ${id} not found`);
      }
      return subscription;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding subscription: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve subscription");
    }
  }

  async findByUserId(userId: string): Promise<SubscriptionDocument | null> {
    try {
      return await this.subscriptionModel.findOne({ userId }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding subscription by user ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to find subscription by user ID");
    }
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<SubscriptionDocument | null> {
    try {
      return await this.subscriptionModel.findOne({ stripeCustomerId }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding subscription by Stripe customer ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to find subscription by Stripe customer ID");
    }
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<SubscriptionDocument | null> {
    try {
      return await this.subscriptionModel.findOne({ stripeSubscriptionId }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding subscription by Stripe subscription ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to find subscription by Stripe subscription ID");
    }
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionDocument> {
    try {
      const updatedSubscription = await this.subscriptionModel.findByIdAndUpdate(id, updateSubscriptionDto, { new: true }).exec();
      if (!updatedSubscription) {
        throw new NotFoundException(`Subscription with ID ${id} not found`);
      }
      return updatedSubscription;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating subscription: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update subscription");
    }
  }

  async updateByUserId(userId: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionDocument> {
    try {
      const updatedSubscription = await this.subscriptionModel.findOneAndUpdate(
        { userId },
        updateSubscriptionDto,
        { new: true },
      ).exec();
      if (!updatedSubscription) {
        throw new NotFoundException(`Subscription for user ID ${userId} not found`);
      }
      return updatedSubscription;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating subscription by user ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update subscription by user ID");
    }
  }

  async updateByStripeSubscriptionId(
    stripeSubscriptionId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    try {
      const updatedSubscription = await this.subscriptionModel.findOneAndUpdate(
        { stripeSubscriptionId },
        updateSubscriptionDto,
        { new: true },
      ).exec();
      if (!updatedSubscription) {
        throw new NotFoundException(`Subscription with Stripe subscription ID ${stripeSubscriptionId} not found`);
      }
      return updatedSubscription;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating subscription by Stripe subscription ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update subscription by Stripe subscription ID");
    }
  }

  async remove(id: string): Promise<SubscriptionDocument> {
    try {
      const deletedSubscription = await this.subscriptionModel.findByIdAndDelete(id).exec();
      if (!deletedSubscription) {
        throw new NotFoundException(`Subscription with ID ${id} not found`);
      }
      return deletedSubscription;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing subscription: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to delete subscription");
    }
  }

  async isActive(userId: string): Promise<boolean> {
    try {
      const subscription = await this.findByUserId(userId);
      if (!subscription) {
        return false;
      }

      const now = new Date();
      const isTrialActive = subscription.isTrialActive === true
        && subscription.trialEnd
        && subscription.trialEnd > now;

      const isPaidActive = subscription.status === SubscriptionStatus.ACTIVE
        && subscription.currentPeriodEnd
        && subscription.currentPeriodEnd > now;

      return Boolean(isTrialActive || isPaidActive);
    }
    catch (error) {
      this.logger.error(`Error checking subscription activity: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to check subscription activity");
    }
  }

  async getStatus(userId: string): Promise<{
    subscription: SubscriptionDocument | null;
    isActive: boolean;
    isTrialActive: boolean;
    daysLeft: number | null;
  }> {
    try {
      const subscription = await this.findByUserId(userId);
      if (!subscription) {
        return {
          subscription: null,
          isActive: false,
          isTrialActive: false,
          daysLeft: null,
        };
      }

      const now = new Date();
      const isTrialActive = subscription.isTrialActive === true
        && subscription.trialEnd
        && subscription.trialEnd > now;

      const isPaidActive = subscription.status === SubscriptionStatus.ACTIVE
        && subscription.currentPeriodEnd
        && subscription.currentPeriodEnd > now;

      const isActive = Boolean(isTrialActive || isPaidActive);

      let daysLeft: number | null = null;
      if (isTrialActive && subscription.trialEnd) {
        daysLeft = Math.ceil((subscription.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      else if (isPaidActive && subscription.currentPeriodEnd) {
        daysLeft = Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        subscription,
        isActive,
        isTrialActive: Boolean(isTrialActive),
        daysLeft,
      };
    }
    catch (error) {
      this.logger.error(`Error getting subscription status: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to get subscription status");
    }
  }

  /**
   * Get subscription status in auth-service compatible format
   */
  async getStatusForAuthService(userId: string): Promise<{
    hasSubscription: boolean;
    isActive: boolean;
    plan: "monthly" | "yearly" | null;
    status: "trial" | "active" | "past_due" | "canceled" | "unpaid" | null;
    trialActive: boolean;
    daysRemaining: number;
    nextBillingDate?: Date;
    cancelAtPeriodEnd?: boolean;
  }> {
    try {
      const subscription = await this.findByUserId(userId);
      if (!subscription) {
        return {
          hasSubscription: false,
          isActive: false,
          plan: null,
          status: null,
          trialActive: false,
          daysRemaining: 0,
        };
      }

      const now = new Date();
      const isTrialActive = subscription.isTrialActive === true
        && subscription.trialEnd
        && subscription.trialEnd > now;

      const isPaidActive = subscription.status === SubscriptionStatus.ACTIVE
        && subscription.currentPeriodEnd
        && subscription.currentPeriodEnd > now;

      const isActive = Boolean(isTrialActive || isPaidActive);

      let daysRemaining = 0;
      if (isTrialActive && subscription.trialEnd) {
        daysRemaining = Math.ceil((subscription.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      else if (isPaidActive && subscription.currentPeriodEnd) {
        daysRemaining = Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        hasSubscription: true,
        isActive,
        plan: subscription.plan,
        status: subscription.status,
        trialActive: Boolean(isTrialActive),
        daysRemaining: Math.max(0, daysRemaining),
        nextBillingDate: subscription.nextBillingDate,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      };
    }
    catch (error) {
      this.logger.error(`Error getting subscription status for auth-service: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to get subscription status for auth-service");
    }
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<SubscriptionDocument> {
    try {
      const updatedSubscription = await this.subscriptionModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      ).exec();
      if (!updatedSubscription) {
        throw new NotFoundException(`Subscription with ID ${id} not found`);
      }
      return updatedSubscription;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating subscription status: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update subscription status");
    }
  }

  async changePlan(userId: string, newPlan: SubscriptionPlan): Promise<SubscriptionDocument> {
    try {
      const subscription = await this.findByUserId(userId);
      if (!subscription) {
        throw new NotFoundException(`Subscription for user ID ${userId} not found`);
      }

      return await this.updateByUserId(userId, { plan: newPlan });
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error changing subscription plan: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to change subscription plan");
    }
  }
}
