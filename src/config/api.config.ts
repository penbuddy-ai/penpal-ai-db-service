import { registerAs } from "@nestjs/config";

export default registerAs("api", () => ({
  prefix: process.env.API_PREFIX || "/api",
  version: process.env.API_VERSION || "v1",
  port: process.env.PORT || 3001,
  environment: process.env.NODE_ENV || "development",
  documentation: {
    title: "Penpal AI API",
    description: "The Penpal AI API documentation",
    version: "1.0.0",
    contact: {
      name: "Penpal AI Support",
      email: "support@penpal.ai",
      url: "https://penpal.ai",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  validation: {
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    disableErrorMessages: process.env.NODE_ENV === "production",
  },
  logging: {
    level: process.env.LOG_LEVEL || "debug",
    timestamp: true,
    prettyPrint: process.env.NODE_ENV !== "production",
  },
})); 