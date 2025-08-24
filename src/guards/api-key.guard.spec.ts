import { ExecutionContext, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Request } from "express";

import { ApiKeyGuard } from "./api-key.guard";

describe("apiKeyGuard", () => {
  let guard: ApiKeyGuard;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<Logger>;

  const mockRequest = (headers: any = {}, body: any = {}) => ({
    headers,
    body,
  }) as Request;

  const mockExecutionContext = (request: Request) => ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as ExecutionContext;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    logger = module.get<Logger>(Logger) as jest.Mocked<Logger>;

    // Reset logger mock before each test
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with valid API key", () => {
      configService.get.mockReturnValue("test-api-key");

      expect(() => new ApiKeyGuard(configService)).not.toThrow();
      expect(configService.get).toHaveBeenCalledWith("INTERNAL_API_KEY");
    });

    it("should throw error when API key is not configured", () => {
      configService.get.mockReturnValue("");

      expect(() => new ApiKeyGuard(configService)).toThrow(
        "INTERNAL_API_KEY environment variable must be set for inter-service communication",
      );
    });

    it("should throw error when API key is undefined", () => {
      configService.get.mockReturnValue(undefined);

      expect(() => new ApiKeyGuard(configService)).toThrow(
        "INTERNAL_API_KEY environment variable must be set for inter-service communication",
      );
    });
  });

  describe("canActivate", () => {
    beforeEach(() => {
      configService.get.mockReturnValue("test-api-key");
      guard = new ApiKeyGuard(configService);
      // Replace logger by overriding the private property
      Object.defineProperty(guard, "logger", {
        value: logger,
        writable: true,
      });
    });

    it("should return true when valid API key is provided in header", () => {
      const request = mockRequest({ "x-api-key": "test-api-key" });
      const context = mockExecutionContext(request);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should return true when valid API key is provided in body", () => {
      const request = mockRequest({}, { apiKey: "test-api-key" });
      const context = mockExecutionContext(request);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should prioritize header API key over body API key", () => {
      const request = mockRequest(
        { "x-api-key": "test-api-key" },
        { apiKey: "wrong-key" },
      );
      const context = mockExecutionContext(request);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should throw UnauthorizedException when API key is missing", () => {
      const request = mockRequest();
      const context = mockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow("Missing API key");
      expect(logger.warn).toHaveBeenCalledWith("API key missing from inter-service request");
    });

    it("should throw UnauthorizedException when API key is invalid", () => {
      const request = mockRequest({ "x-api-key": "invalid-key" });
      const context = mockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow("Invalid API key");
      expect(logger.warn).toHaveBeenCalledWith("Invalid API key in inter-service request");
    });

    it("should throw UnauthorizedException when body API key is invalid", () => {
      const request = mockRequest({}, { apiKey: "invalid-key" });
      const context = mockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow("Invalid API key");
      expect(logger.warn).toHaveBeenCalledWith("Invalid API key in inter-service request");
    });

    it("should handle empty header API key", () => {
      const request = mockRequest({ "x-api-key": "" });
      const context = mockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow("Missing API key");
    });

    it("should handle empty body API key", () => {
      const request = mockRequest({}, { apiKey: "" });
      const context = mockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow("Missing API key");
    });

    it("should handle undefined body", () => {
      const request = { headers: {}, body: undefined } as Request;
      const context = mockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow("Missing API key");
    });

    it("should handle null body", () => {
      const request = { headers: {}, body: null } as Request;
      const context = mockExecutionContext(request);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow("Missing API key");
    });
  });

  // Note: extractApiKey is a private method, so we test it indirectly through canActivate
  // All the extraction logic behaviors are already covered in the canActivate tests above
});
