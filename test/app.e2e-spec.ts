import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";

describe("App e2e (no DB)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ConfigService, useValue: { get: () => "test" } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET / should return welcome message", async () => {
    await request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Welcome to Penpal AI API!");
  });

  it("GET /health should return ok status", async () => {
    const res = await request(app.getHttpServer()).get("/health").expect(200);

    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("penpal-ai-db-service");
    expect(res.body.environment).toBeDefined();
  });
});
