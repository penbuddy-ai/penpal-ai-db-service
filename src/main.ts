import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger";
import * as compression from "compression";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";

async function bootstrap() {
  const logger = new Logger("Database Service");
  logger.log("Starting Penpal AI Database Service...");

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"], // Active tous les niveaux de log en développement
  });
  const configService = app.get(ConfigService);

  // Configuration du niveau de log basé sur l'environnement
  const logLevel = configService.get<string>("LOG_LEVEL") || "debug";
  logger.log(`Application running with LOG_LEVEL: ${logLevel}`);

  // Interceptor global pour le logging
  if (process.env.NODE_ENV !== "production") {
    app.useGlobalInterceptors(new LoggingInterceptor());
    logger.log("Logging interceptor enabled for detailed request/response logging");
  }

  // Security
  app.use(helmet());
  app.enableCors(configService.get("security.cors") || {});

  // Performance
  app.use(compression());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      disableErrorMessages: configService.get<boolean>("api.validation.disableErrorMessages") || false,
    }),
  );

  // Global prefix
  const prefix = configService.get<string>("API_PREFIX") || "/api";
  const version = configService.get<string>("API_VERSION") || "v1";
  const globalPrefix = `${prefix}/${version}`;
  app.setGlobalPrefix(globalPrefix);

  // Documentation
  const config = new DocumentBuilder()
    .setTitle("Penpal AI API")
    .setDescription(`
      API de gestion pour l'application Penpal AI.
      
      ## Caractéristiques
      
      - **Authentication**: JWT token-based
      - **Cache Redis**: Optimisation des performances avec mise en cache des requêtes GET
      - **Base de données**: MongoDB
      - **Documentation**: OpenAPI/Swagger
      
      ## Notes sur le cache
      
      Les routes GET principales sont mises en cache avec Redis pour optimiser les performances.
      Durée de mise en cache par défaut: 3600 secondes (configurable via REDIS_TTL).
      
      ## Configuration
      
      Consultez le fichier README.md pour plus d'informations sur la configuration.
    `)
    .setVersion("1.0.0")
    .setContact(
      "Penpal AI Team",
      "https://penpal.ai",
      "support@penpal.ai",
    )
    .setLicense(
      "MIT",
      "https://opensource.org/licenses/MIT",
    )
    .addBearerAuth()
    .addTag("languages", "Gestion des langues disponibles")
    .addTag("users", "Gestion des utilisateurs")
    .addTag("roles", "Gestion des rôles et permissions")
    .addTag("ai-characters", "Gestion des personnages IA")
    .addTag("health", "Monitoring et statut de l'API")
    .addServer(`http://localhost:${configService.get<number>("PORT") || 3001}`)
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    extraModels: [],
  });

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      displayRequestDuration: true,
    },
    customSiteTitle: "Penpal AI API Documentation",
    customCss: ".swagger-ui .topbar { display: none }",
  };

  SwaggerModule.setup("api/v1/docs", app, document, customOptions);

  // Log connection details
  const mongoURI = configService.get<string>("MONGODB_URI") || "mongodb://localhost:27017/penpal-ai";
  const sanitizedMongoURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  logger.log(`MongoDB connection: ${sanitizedMongoURI}`);

  const redisHost = configService.get<string>("REDIS_HOST") || "localhost";
  const redisPort = configService.get<number>("REDIS_PORT") || 6379;
  logger.log(`Redis connection: ${redisHost}:${redisPort}`);

  // Start server
  await app.listen(configService.get<number>("PORT") || 3001);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`API documentation available at: ${await app.getUrl()}${globalPrefix}/docs`);
  logger.log("API is ready to accept connections");
}

bootstrap();
