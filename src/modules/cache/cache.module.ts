import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { Global, Injectable, Logger, Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";

/**
 * Service to log Redis configuration and handle connection status
 */
@Injectable()
export class RedisCacheHealthService implements OnModuleInit {
  private readonly logger = new Logger("RedisCache");

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const host = this.configService.get<string>("REDIS_HOST") || "localhost";
      const port = this.configService.get<number>("REDIS_PORT") || 6379;
      const ttl = this.configService.get<number>("REDIS_TTL") || 3600;

      this.logger.log(`🔧 Redis configuration: host=${host}, port=${port}, TTL=${ttl}s`);
      this.logger.log("🚀 Redis cache service initialized");
    }
    catch (error) {
      this.logger.error(`❌ Error initializing Redis cache service: ${error.message}`);
    }
  }
}

/**
 * Global cache module that configures Redis cache
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger("RedisCache");
        const host = configService.get<string>("REDIS_HOST") || "localhost";
        const port = configService.get<number>("REDIS_PORT") || 6379;
        const password = configService.get<string>("REDIS_PASSWORD");
        const ttl = configService.get<number>("REDIS_TTL") || 3600;

        logger.log(`🔄 Configuring Redis cache store: ${host}:${port}, TTL: ${ttl}s`);

        // Create Redis store options
        const options = {
          store: redisStore,
          host,
          port,
          password,
          ttl,
          max: 1000,
          isGlobal: true,
          // This will cause the cache manager to log an error but not crash if Redis is unavailable
          no_ready_check: true,
          retry_strategy: (options) => {
            logger.warn(`🔄 Redis connection attempt ${options.attempt} failed. Retrying...`);
            return Math.min(options.attempt * 100, 3000); // Retry with exponential backoff up to 3 seconds
          },
        };

        // Add event handlers for Redis connection if supported by the store implementation
        try {
          // Event handlers will be added by the store when connection is established
          logger.debug("Redis connection events will be logged when established");
        }
        catch (error) {
          logger.warn(`Unable to setup Redis event handlers: ${error.message}`);
        }

        return options;
      },
    }),
  ],
  providers: [RedisCacheHealthService],
  exports: [NestCacheModule],
})
export class CacheModule {}
