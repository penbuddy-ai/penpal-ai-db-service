import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check API health' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-04-14T12:00:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        service: { type: 'string', example: 'penpal-ai-db-service' },
        environment: { type: 'string', example: 'development' },
      },
    },
  })
  checkHealth() {
    return this.appService.checkHealth();
  }
}
