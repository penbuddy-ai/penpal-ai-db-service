import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, NotFoundException, Param, Post, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ServiceAuthGuard } from "src/common/guards/service-auth.guard";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentsService } from "./payments.service";
import { Payment, PaymentDocument, PaymentStatus } from "./schemas/payment.schema";

@ApiTags("payments")
@Controller("payments")
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
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new payment" })
  @ApiResponse({ status: 201, description: "The payment has been successfully created.", type: Payment })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 500, description: "Internal server error during payment creation." })
  @ApiBody({ type: CreatePaymentDto })
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentDocument> {
    this.logger.log(`Creating new payment for user: ${createPaymentDto.userId}`);
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey("all_payments")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get all payments" })
  @ApiResponse({ status: 200, description: "Return all payments.", type: [Payment] })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving payments." })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of payments to return" })
  @ApiQuery({ name: "offset", required: false, type: Number, description: "Number of payments to skip" })
  async findAll(@Query("limit") limit?: number, @Query("offset") offset?: number): Promise<PaymentDocument[]> {
    this.logger.log(`Retrieving all payments (limit: ${limit}, offset: ${offset})`);
    return this.paymentsService.findAll(limit, offset);
  }

  @Get(":id")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("payment_by_id")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get a payment by ID" })
  @ApiParam({ name: "id", type: "string", description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Return the payment.", type: Payment })
  @ApiResponse({ status: 404, description: "Payment not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving payment." })
  async findOne(@Param("id") id: string): Promise<PaymentDocument> {
    this.logger.log(`Retrieving payment with ID: ${id}`);
    return this.paymentsService.findOne(id);
  }

  @Get("user/:userId")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("payments_by_user")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get payments by user ID" })
  @ApiParam({ name: "userId", type: "string", description: "User ID" })
  @ApiResponse({ status: 200, description: "Return the payments.", type: [Payment] })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving payments." })
  async findByUserId(@Param("userId") userId: string): Promise<PaymentDocument[]> {
    this.logger.log(`Retrieving payments for user: ${userId}`);
    return this.paymentsService.findByUserId(userId);
  }

  @Get("subscription/:subscriptionId")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("payments_by_subscription")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get payments by subscription ID" })
  @ApiParam({ name: "subscriptionId", type: "string", description: "Subscription ID" })
  @ApiResponse({ status: 200, description: "Return the payments.", type: [Payment] })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving payments." })
  async findBySubscriptionId(@Param("subscriptionId") subscriptionId: string): Promise<PaymentDocument[]> {
    this.logger.log(`Retrieving payments for subscription: ${subscriptionId}`);
    return this.paymentsService.findBySubscriptionId(subscriptionId);
  }

  @Get("stripe-payment-intent/:stripePaymentIntentId")
  @UseInterceptors(CacheInterceptor)
  @CacheKey("payment_by_stripe_intent")
  @CacheTTL(3600)
  @ApiOperation({ summary: "Get payment by Stripe payment intent ID" })
  @ApiParam({ name: "stripePaymentIntentId", type: "string", description: "Stripe Payment Intent ID" })
  @ApiResponse({ status: 200, description: "Return the payment.", type: Payment })
  @ApiResponse({ status: 404, description: "Payment not found." })
  @ApiResponse({ status: 500, description: "Internal server error while retrieving payment." })
  async findByStripePaymentIntentId(@Param("stripePaymentIntentId") stripePaymentIntentId: string): Promise<PaymentDocument> {
    this.logger.log(`Retrieving payment with Stripe payment intent ID: ${stripePaymentIntentId}`);
    const payment = await this.paymentsService.findByStripePaymentIntentId(stripePaymentIntentId);
    if (!payment) {
      this.logger.warn(`Payment with Stripe payment intent ID ${stripePaymentIntentId} not found`);
      throw new NotFoundException(`Payment with Stripe payment intent ID ${stripePaymentIntentId} not found`);
    }
    return payment;
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a payment" })
  @ApiParam({ name: "id", type: "string", description: "Payment ID" })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: "The payment has been successfully updated.", type: Payment })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 404, description: "Payment not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating payment." })
  async update(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentDto): Promise<PaymentDocument> {
    this.logger.log(`Updating payment with ID: ${id}`);
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Put("stripe-payment-intent/:stripePaymentIntentId")
  @ApiOperation({ summary: "Update payment by Stripe payment intent ID" })
  @ApiParam({ name: "stripePaymentIntentId", type: "string", description: "Stripe Payment Intent ID" })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: "The payment has been successfully updated.", type: Payment })
  @ApiResponse({ status: 400, description: "Bad request - invalid input data." })
  @ApiResponse({ status: 404, description: "Payment not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating payment." })
  async updateByStripePaymentIntentId(
    @Param("stripePaymentIntentId") stripePaymentIntentId: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentDocument> {
    this.logger.log(`Updating payment with Stripe payment intent ID: ${stripePaymentIntentId}`);
    return this.paymentsService.updateByStripePaymentIntentId(stripePaymentIntentId, updatePaymentDto);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update payment status" })
  @ApiParam({ name: "id", type: "string", description: "Payment ID" })
  @ApiBody({ schema: { type: "object", properties: { status: { enum: Object.values(PaymentStatus) } } } })
  @ApiResponse({ status: 200, description: "The payment status has been successfully updated.", type: Payment })
  @ApiResponse({ status: 400, description: "Bad request - invalid status." })
  @ApiResponse({ status: 404, description: "Payment not found." })
  @ApiResponse({ status: 500, description: "Internal server error while updating payment status." })
  async updateStatus(@Param("id") id: string, @Body() body: { status: PaymentStatus }): Promise<PaymentDocument> {
    this.logger.log(`Updating payment status for ID: ${id} to: ${body.status}`);
    return this.paymentsService.updateStatus(id, body.status);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a payment" })
  @ApiParam({ name: "id", type: "string", description: "Payment ID" })
  @ApiResponse({ status: 204, description: "The payment has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Payment not found." })
  @ApiResponse({ status: 500, description: "Internal server error while deleting payment." })
  async remove(@Param("id") id: string): Promise<void> {
    this.logger.log(`Deleting payment with ID: ${id}`);
    await this.paymentsService.remove(id);
  }
}
