import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ServiceAuthGuard } from "src/common/guards/service-auth.guard";

import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { Subscription, SubscriptionDocument, SubscriptionPlan, SubscriptionStatus } from "./schemas/subscription.schema";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("subscriptions")
@Controller("subscriptions")
@UseGuards(ServiceAuthGuard)
@ApiHeader({
  name: "x-api-key",
  description: "Clé API pour l'authentification inter-services",
  required: true,
})
@ApiHeader({
  name: "x-service-name",
  description: "Nom du service appelant (ex: payment-service)",
  required: true,
})
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new subscription" })
  @ApiResponse({ status: 201, description: "The subscription has been successfully created.", type: Subscription })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 409, description: "Conflict - user already has a subscription." })
  @ApiResponse({ status: 500, description: "Internal server error during subscription creation." })
  @ApiBody({ type: CreateSubscriptionDto })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDocument> {
    this.logger.log(`Creating new subscription for user: ${createSubscriptionDto.userId}`);
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_subscriptions")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all subscriptions" })
  @ApiResponse({ status: 200, description: "Return all subscriptions.", type: [Subscription] })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving subscriptions." })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of subscriptions to return" })
  @ApiQuery({ name: "offset", required: false, type: Number, description: "Number of subscriptions to skip" })
  async findAll(@Query("limit") limit?: number, @Query("offset") offset?: number): Promise<SubscriptionDocument[]> {
    this.logger.log(`Retrieving all subscriptions (limit: ${limit}, offset: ${offset})`);
    return this.subscriptionsService.findAll(limit, offset);
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("subscription_by_id")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get a subscription by ID" })
  @ApiParam({ name: "id", type: "string", description: "Subscription ID" })
  @ApiResponse({ status: 200, description: "Return the subscription.", type: Subscription })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving subscription." })
  async findOne(@Param("id") id: string): Promise<SubscriptionDocument> {
    this.logger.log(`Retrieving subscription with ID: ${id}`);
    return this.subscriptionsService.findOne(id);
  }

  @Get("user/:userId")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("subscription_by_user")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get subscription by user ID" })
  @ApiParam({ name: "userId", type: "string", description: "User ID" })
  @ApiResponse({ status: 200, description: "Return the subscription.", type: Subscription })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving subscription." })
  async findByUserId(@Param("userId") userId: string): Promise<SubscriptionDocument> {
    this.logger.log(`Retrieving subscription for user: ${userId}`);
    const subscription = await this.subscriptionsService.findByUserId(userId);
    if (!subscription) {
      this.logger.warn(`Subscription for user ${userId} not found`);
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }
    return subscription;
  }

  @Get("stripe-customer/:stripeCustomerId")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("subscription_by_stripe_customer")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get subscription by Stripe customer ID" })
  @ApiParam({ name: "stripeCustomerId", type: "string", description: "Stripe Customer ID" })
  @ApiResponse({ status: 200, description: "Return the subscription.", type: Subscription })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving subscription." })
  async findByStripeCustomerId(@Param("stripeCustomerId") stripeCustomerId: string): Promise<SubscriptionDocument> {
    this.logger.log(`Retrieving subscription for Stripe customer: ${stripeCustomerId}`);
    const subscription = await this.subscriptionsService.findByStripeCustomerId(stripeCustomerId);
    if (!subscription) {
      this.logger.warn(`Subscription for Stripe customer ${stripeCustomerId} not found`);
      throw new NotFoundException(`Subscription for Stripe customer ${stripeCustomerId} not found`);
    }
    return subscription;
  }

  @Get("stripe-subscription/:stripeSubscriptionId")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("subscription_by_stripe_subscription")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get subscription by Stripe subscription ID" })
  @ApiParam({ name: "stripeSubscriptionId", type: "string", description: "Stripe Subscription ID" })
  @ApiResponse({ status: 200, description: "Return the subscription.", type: Subscription })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving subscription." })
  async findByStripeSubscriptionId(@Param("stripeSubscriptionId") stripeSubscriptionId: string): Promise<SubscriptionDocument> {
    this.logger.log(`Retrieving subscription for Stripe subscription: ${stripeSubscriptionId}`);
    const subscription = await this.subscriptionsService.findByStripeSubscriptionId(stripeSubscriptionId);
    if (!subscription) {
      this.logger.warn(`Subscription for Stripe subscription ${stripeSubscriptionId} not found`);
      throw new NotFoundException(`Subscription for Stripe subscription ${stripeSubscriptionId} not found`);
    }
    return subscription;
  }

  @Get("user/:userId/active")
  @ApiOperation({ summary: "Check if user subscription is active" })
  @ApiParam({ name: "userId", type: "string", description: "User ID" })
  @ApiResponse({ status: 200, description: "Subscription activity status", schema: { type: "object", properties: { isActive: { type: "boolean" } } } })
  @ApiResponse({ status: 500, description: "Internal server error while checking subscription activity." })
  async isActive(@Param("userId") userId: string): Promise<{ isActive: boolean }> {
    this.logger.log(`Checking subscription activity for user: ${userId}`);
    const isActive = await this.subscriptionsService.isActive(userId);
    return { isActive };
  }

  @Get("user/:userId/status")
  @ApiOperation({ summary: "Get subscription status" })
  @ApiParam({ name: "userId", type: "string", description: "User ID" })
  @ApiResponse({ status: 200, description: "Subscription status retrieved" })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving subscription status." })
  async getStatus(@Param("userId") userId: string): Promise<{
    subscription: SubscriptionDocument | null;
    isActive: boolean;
    isTrialActive: boolean;
    daysLeft: number | null;
  }> {
    this.logger.log(`Retrieving subscription status for user: ${userId}`);
    return this.subscriptionsService.getStatus(userId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a subscription" })
  @ApiParam({ name: "id", type: "string", description: "Subscription ID" })
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiResponse({ status: 200, description: "The subscription has been successfully updated.", type: Subscription })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating subscription." })
  async update(@Param("id") id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionDocument> {
    this.logger.log(`Updating subscription with ID: ${id}`);
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Put("user/:userId")
  @ApiOperation({ summary: "Update subscription by user ID" })
  @ApiParam({ name: "userId", type: "string", description: "User ID" })
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiResponse({ status: 200, description: "The subscription has been successfully updated.", type: Subscription })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating subscription." })
  async updateByUserId(@Param("userId") userId: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionDocument> {
    this.logger.log(`Updating subscription for user: ${userId}`);
    return this.subscriptionsService.updateByUserId(userId, updateSubscriptionDto);
  }

  @Put("stripe-subscription/:stripeSubscriptionId")
  @ApiOperation({ summary: "Update subscription by Stripe subscription ID" })
  @ApiParam({ name: "stripeSubscriptionId", type: "string", description: "Stripe Subscription ID" })
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiResponse({ status: 200, description: "The subscription has been successfully updated.", type: Subscription })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating subscription." })
  async updateByStripeSubscriptionId(
    @Param("stripeSubscriptionId") stripeSubscriptionId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    this.logger.log(`Updating subscription with Stripe subscription ID: ${stripeSubscriptionId}`);
    return this.subscriptionsService.updateByStripeSubscriptionId(stripeSubscriptionId, updateSubscriptionDto);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update subscription status" })
  @ApiParam({ name: "id", type: "string", description: "Subscription ID" })
  @ApiBody({ schema: { type: "object", properties: { status: { enum: Object.values(SubscriptionStatus) } } } })
  @ApiResponse({ status: 200, description: "The subscription status has been successfully updated.", type: Subscription })
  @ApiResponse({ status: 400, description: "Bad request - invalid status." })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating subscription status." })
  async updateStatus(@Param("id") id: string, @Body() body: { status: SubscriptionStatus }): Promise<SubscriptionDocument> {
    this.logger.log(`Updating subscription status for ID: ${id} to: ${body.status}`);
    return this.subscriptionsService.updateStatus(id, body.status);
  }

  @Put("user/:userId/plan")
  @ApiOperation({ summary: "Change subscription plan" })
  @ApiParam({ name: "userId", type: "string", description: "User ID" })
  @ApiBody({ schema: { type: "object", properties: { plan: { enum: Object.values(SubscriptionPlan) } } } })
  @ApiResponse({ status: 200, description: "The subscription plan has been successfully changed.", type: Subscription })
  @ApiResponse({ status: 400, description: "Bad request - invalid plan." })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while changing subscription plan." })
  async changePlan(@Param("userId") userId: string, @Body() body: { plan: SubscriptionPlan }): Promise<SubscriptionDocument> {
    this.logger.log(`Changing subscription plan for user: ${userId} to: ${body.plan}`);
    return this.subscriptionsService.changePlan(userId, body.plan);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a subscription" })
  @ApiParam({ name: "id", type: "string", description: "Subscription ID" })
  @ApiResponse({ status: 204, description: "The subscription has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Subscription not found." })
  @ApiResponse({ status: 500, description: "Internal server error while deleting subscription." })
  async remove(@Param("id") id: string): Promise<void> {
    this.logger.log(`Deleting subscription with ID: ${id}`);
    await this.subscriptionsService.remove(id);
  }
}
