import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { catchError, firstValueFrom, timeout } from "rxjs";

export type SubscriptionEmailData = {
  email: string;
  firstName: string;
  lastName: string;
  plan: "monthly" | "yearly";
  status: "trial" | "active";
  trialEnd?: Date;
  nextBillingDate?: Date;
  amount?: number;
  currency?: string;
  userId?: string;
};

export type NotificationResponse = {
  success: boolean;
  message: string;
  timestamp: Date;
};

@Injectable()
export class NotificationServiceClient {
  private readonly logger = new Logger(NotificationServiceClient.name);
  private readonly notificationServiceUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationServiceUrl
      = this.configService.get<string>("NOTIFICATION_SERVICE_URL")
        || "http://localhost:3002";
    this.apiKey
      = this.configService.get<string>("NOTIFICATION_SERVICE_API_KEY")
        || "default-api-key";
  }

  /**
   * Send subscription confirmation email
   * Returns false if notification service is unavailable to avoid blocking subscription creation
   */
  async sendSubscriptionConfirmationEmail(
    subscriptionData: SubscriptionEmailData,
  ): Promise<boolean> {
    const url = `${this.notificationServiceUrl}/notifications/subscription-confirmation`;

    try {
      this.logger.log(`Sending subscription confirmation email to ${subscriptionData.email} via notification service`);

      const payload = {
        email: subscriptionData.email,
        firstName: subscriptionData.firstName,
        lastName: subscriptionData.lastName,
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        trialEnd: subscriptionData.trialEnd?.toISOString(),
        nextBillingDate: subscriptionData.nextBillingDate?.toISOString(),
        amount: subscriptionData.amount,
        currency: subscriptionData.currency,
        userId: subscriptionData.userId,
      };

      const { data } = await firstValueFrom(
        this.httpService
          .post<NotificationResponse>(url, payload, {
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": this.apiKey,
            },
            timeout: 10000, // 10 second timeout
          })
          .pipe(
            timeout(15000),
            catchError((error: AxiosError) => {
              this.logger.error(
                `Error sending subscription confirmation email: ${error.message}`,
                error.stack,
              );
              throw error;
            }),
          ),
      );

      if (data.success) {
        this.logger.log(`Subscription confirmation email sent successfully to ${subscriptionData.email}`);
        return true;
      }
      else {
        this.logger.warn(`Notification service returned failure for ${subscriptionData.email}: ${data.message}`);
        return false;
      }
    }
    catch (error) {
      this.logger.warn(
        `Failed to send subscription confirmation email for ${subscriptionData.email}, notification service may be down: ${error.message}`,
      );
      return false; // Don't block subscription creation if email fails
    }
  }

  /**
   * Check notification service health
   */
  async checkHealth(): Promise<boolean> {
    const url = `${this.notificationServiceUrl}/notifications/health`;

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<{ status: string; email_service: string; timestamp: Date }>(url, {
            headers: {
              "X-API-Key": this.apiKey,
            },
            timeout: 5000,
          })
          .pipe(
            timeout(10000),
            catchError((error: AxiosError) => {
              this.logger.debug(`Notification service health check failed: ${error.message}`);
              throw error;
            }),
          ),
      );

      return data.status === "healthy";
    }
    catch (error) {
      this.logger.debug(`Notification service is not available: ${error.message}`);
      return false;
    }
  }
}
