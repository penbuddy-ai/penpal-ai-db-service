import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { AppService } from "./app.service";

describe("appService", () => {
  let service: AppService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getHello", () => {
    it("should return welcome message", () => {
      const result = service.getHello();
      expect(result).toBe("Welcome to Penpal AI API!");
    });
  });

  describe("checkHealth", () => {
    it("should return health status with development environment", () => {
      configService.get.mockReturnValue("development");

      const result = service.checkHealth();

      expect(result).toEqual({
        status: "ok",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        service: "penpal-ai-db-service",
        environment: "development",
      });
      expect(configService.get).toHaveBeenCalledWith("NODE_ENV");
    });

    it("should return health status with production environment", () => {
      configService.get.mockReturnValue("production");

      const result = service.checkHealth();

      expect(result).toEqual({
        status: "ok",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        service: "penpal-ai-db-service",
        environment: "production",
      });
    });

    it("should default to development environment when NODE_ENV is not set", () => {
      configService.get.mockReturnValue(undefined);

      const result = service.checkHealth();

      expect(result.environment).toBe("development");
    });

    it("should return valid timestamp format", () => {
      const result = service.checkHealth();
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it("should return positive uptime", () => {
      const result = service.checkHealth();

      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
