import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { Payment, PaymentDocument, PaymentStatus } from "./schemas/payment.schema";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    private readonly logger: Logger,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentDocument> {
    try {
      const createdPayment = new this.paymentModel(createPaymentDto);
      return await createdPayment.save();
    }
    catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to create payment");
    }
  }

  async findAll(limit?: number, offset?: number): Promise<PaymentDocument[]> {
    try {
      let query = this.paymentModel.find();

      if (offset) {
        query = query.skip(offset);
      }

      if (limit) {
        query = query.limit(limit);
      }

      return await query.exec();
    }
    catch (error) {
      this.logger.error(`Error finding all payments: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve payments");
    }
  }

  async findOne(id: string): Promise<PaymentDocument> {
    try {
      const payment = await this.paymentModel.findById(id).exec();
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return payment;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve payment");
    }
  }

  async findByUserId(userId: string): Promise<PaymentDocument[]> {
    try {
      return await this.paymentModel.find({ userId }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding payments by user ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to find payments by user ID");
    }
  }

  async findBySubscriptionId(subscriptionId: string): Promise<PaymentDocument[]> {
    try {
      return await this.paymentModel.find({ subscriptionId }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding payments by subscription ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to find payments by subscription ID");
    }
  }

  async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<PaymentDocument | null> {
    try {
      return await this.paymentModel.findOne({ stripePaymentIntentId }).exec();
    }
    catch (error) {
      this.logger.error(`Error finding payment by Stripe payment intent ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to find payment by Stripe payment intent ID");
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentDocument> {
    try {
      const updatedPayment = await this.paymentModel.findByIdAndUpdate(id, updatePaymentDto, { new: true }).exec();
      if (!updatedPayment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return updatedPayment;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update payment");
    }
  }

  async updateByStripePaymentIntentId(
    stripePaymentIntentId: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentDocument> {
    try {
      const updatedPayment = await this.paymentModel.findOneAndUpdate(
        { stripePaymentIntentId },
        updatePaymentDto,
        { new: true },
      ).exec();
      if (!updatedPayment) {
        throw new NotFoundException(`Payment with Stripe payment intent ID ${stripePaymentIntentId} not found`);
      }
      return updatedPayment;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating payment by Stripe payment intent ID: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update payment by Stripe payment intent ID");
    }
  }

  async remove(id: string): Promise<PaymentDocument> {
    try {
      const deletedPayment = await this.paymentModel.findByIdAndDelete(id).exec();
      if (!deletedPayment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return deletedPayment;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to delete payment");
    }
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<PaymentDocument> {
    try {
      const updatedPayment = await this.paymentModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      ).exec();
      if (!updatedPayment) {
        throw new NotFoundException(`Payment with ID ${id} not found`);
      }
      return updatedPayment;
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating payment status: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to update payment status");
    }
  }
}
