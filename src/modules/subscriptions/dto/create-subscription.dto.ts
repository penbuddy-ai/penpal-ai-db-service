import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

import { SubscriptionPlan, SubscriptionStatus } from "../schemas/subscription.schema";

export class CreateSubscriptionDto {
  @ApiProperty({ description: "User ID from the auth service" })
  @IsString()
  userId: string;

  @ApiProperty({ description: "Stripe customer ID" })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: "Stripe subscription ID", required: false })
  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @ApiProperty({ enum: SubscriptionStatus, description: "Current subscription status", default: SubscriptionStatus.TRIAL })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiProperty({ enum: SubscriptionPlan, description: "Subscription plan type", default: SubscriptionPlan.MONTHLY })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @ApiProperty({ description: "Trial start date", required: false })
  @IsOptional()
  @IsDateString()
  trialStart?: Date;

  @ApiProperty({ description: "Trial end date", required: false })
  @IsOptional()
  @IsDateString()
  trialEnd?: Date;

  @ApiProperty({ description: "Current billing period start", required: false })
  @IsOptional()
  @IsDateString()
  currentPeriodStart?: Date;

  @ApiProperty({ description: "Current billing period end", required: false })
  @IsOptional()
  @IsDateString()
  currentPeriodEnd?: Date;

  @ApiProperty({ description: "Whether the subscription should cancel at period end", required: false, default: false })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @ApiProperty({ description: "Whether card is validated", required: false, default: false })
  @IsOptional()
  @IsBoolean()
  cardValidated?: boolean;

  @ApiProperty({ description: "Cancellation date if applicable", required: false })
  @IsOptional()
  @IsDateString()
  canceledAt?: Date;

  @ApiProperty({ description: "Next billing date", required: false })
  @IsOptional()
  @IsDateString()
  nextBillingDate?: Date;

  @ApiProperty({ description: "Monthly price in cents", required: false, default: 2000 })
  @IsOptional()
  @IsNumber()
  monthlyPrice?: number;

  @ApiProperty({ description: "Yearly price in cents", required: false, default: 20000 })
  @IsOptional()
  @IsNumber()
  yearlyPrice?: number;

  @ApiProperty({ description: "Currency code", required: false, default: "eur" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: "Whether user is in trial period", required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isTrialActive?: boolean;

  @ApiProperty({ description: "Metadata for additional information", required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
