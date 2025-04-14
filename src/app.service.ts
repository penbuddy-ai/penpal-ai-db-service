import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return "Welcome to Penpal AI API!";
  }

  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'penpal-ai-db-service',
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    };
  }
}
