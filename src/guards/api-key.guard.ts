import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("INTERNAL_API_KEY") || "";

    if (!this.apiKey) {
      this.logger.error("INTERNAL_API_KEY environment variable not set");
      throw new Error("INTERNAL_API_KEY environment variable must be set for inter-service communication");
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      this.logger.warn("API key missing from inter-service request");
      throw new UnauthorizedException("Missing API key");
    }

    if (apiKey !== this.apiKey) {
      this.logger.warn("Invalid API key in inter-service request");
      throw new UnauthorizedException("Invalid API key");
    }

    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    // Prioritize header, fallback to body if header not present
    const headerApiKey = request.headers["x-api-key"] as string;

    if (headerApiKey) {
      return headerApiKey;
    }

    if (request.body && request.body.apiKey) {
      return request.body.apiKey;
    }

    return undefined;
  }
}
