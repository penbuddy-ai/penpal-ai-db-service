import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

import { PaymentMethod, PaymentStatus } from "../schemas/payment.schema";

export class CreatePaymentDto {
  @ApiProperty({ description: "User ID from the auth service" })
  @IsString()
  userId: string;

  @ApiProperty({ description: "Associated subscription ID" })
  @IsString()
  subscriptionId: string;

  @ApiProperty({ description: "Stripe payment intent ID" })
  @IsString()
  stripePaymentIntentId: string;

  @ApiProperty({ description: "Stripe charge ID", required: false })
  @IsOptional()
  @IsString()
  stripeChargeId?: string;

  @ApiProperty({ enum: PaymentStatus, description: "Payment status" })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod, description: "Payment method used" })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: "Amount in cents" })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Currency code", default: "eur" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: "Description of the payment", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Payment date", required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: Date;

  @ApiProperty({ description: "Failure reason if payment failed", required: false })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiProperty({ description: "Refund amount if refunded", required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  refundedAmount?: number;

  @ApiProperty({ description: "Refund date if applicable", required: false })
  @IsOptional()
  @IsDateString()
  refundedAt?: Date;

  @ApiProperty({ description: "Receipt URL from Stripe", required: false })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({ description: "Invoice ID if applicable", required: false })
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @ApiProperty({ description: "Billing period covered by this payment", required: false })
  @IsOptional()
  @IsDateString()
  billingPeriodStart?: Date;

  @ApiProperty({ description: "Billing period end covered by this payment", required: false })
  @IsOptional()
  @IsDateString()
  billingPeriodEnd?: Date;

  @ApiProperty({ description: "Whether this is a trial period payment", required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isTrial?: boolean;

  @ApiProperty({ description: "Payment metadata", required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
