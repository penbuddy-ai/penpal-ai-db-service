import { Test, TestingModule } from "@nestjs/testing";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("appController", () => {
  let appController: AppController;
  let appService: jest.Mocked<AppService>;

  beforeEach(async () => {
    const mockAppService = {
      getHello: jest.fn(),
      checkHealth: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService) as jest.Mocked<AppService>;
  });

  describe("root", () => {
    it("should return 'Welcome to Penpal AI API!'", () => {
      const result = "Welcome to Penpal AI API!";
      appService.getHello.mockReturnValue(result);

      expect(appController.getHello()).toBe(result);
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe("checkHealth", () => {
    it("should return health status", () => {
      const healthStatus = {
        status: "ok",
        timestamp: "2023-04-14T12:00:00.000Z",
        uptime: 3600,
        service: "penpal-ai-db-service",
        environment: "development",
      };
      appService.checkHealth.mockReturnValue(healthStatus);

      expect(appController.checkHealth()).toBe(healthStatus);
      expect(appService.checkHealth).toHaveBeenCalled();
    });
  });
});
