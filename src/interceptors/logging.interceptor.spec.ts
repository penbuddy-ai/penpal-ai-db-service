import { CallHandler, ExecutionContext, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { of } from "rxjs";

import { LoggingInterceptor } from "./logging.interceptor";

describe("loggingInterceptor", () => {
  let interceptor: LoggingInterceptor;
  let logger: jest.Mocked<Logger>;

  const mockRequest = (method = "GET", url = "/test", body = {}, params = {}, query = {}) => ({
    method,
    url,
    body,
    params,
    query,
  });

  const mockExecutionContext = (request: any) => ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as ExecutionContext;

  const mockCallHandler = (returnValue: any = "test response") => ({
    handle: () => of(returnValue),
  }) as CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

    // Mock the logger
    logger = {
      debug: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      verbose: jest.fn(),
    } as any;

    // Replace logger by overriding the private property
    Object.defineProperty(interceptor, "logger", {
      value: logger,
      writable: true,
    });
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  describe("intercept", () => {
    beforeEach(() => {
      jest.spyOn(Date, "now")
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1100); // End time
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should log GET request with parameters", (done) => {
      const request = mockRequest("GET", "/users/123", {}, { id: "123" }, { limit: "10" });
      const context = mockExecutionContext(request);
      const handler = mockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(logger.debug).toHaveBeenCalledWith(
          "GET /users/123 +100ms - Params: {\"id\":\"123\"} - Query: {\"limit\":\"10\"} - Body: empty",
        );
        done();
      });
    });

    it("should log POST request with body", (done) => {
      const request = mockRequest("POST", "/users", { name: "John", email: "john@test.com" });
      const context = mockExecutionContext(request);
      const handler = mockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(logger.debug).toHaveBeenCalledWith(
          "POST /users +100ms - Params: {} - Query: {} - Body: {\"name\":\"John\",\"email\":\"john@test.com\"}",
        );
        done();
      });
    });

    it("should log request with empty body", (done) => {
      const request = mockRequest("GET", "/health");
      const context = mockExecutionContext(request);
      const handler = mockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(logger.debug).toHaveBeenCalledWith(
          "GET /health +100ms - Params: {} - Query: {} - Body: empty",
        );
        done();
      });
    });

    it("should handle request with null body", (done) => {
      const request = mockRequest("DELETE", "/users/123");
      request.body = null as any;
      const context = mockExecutionContext(request);
      const handler = mockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(logger.debug).toHaveBeenCalledWith(
          "DELETE /users/123 +100ms - Params: {} - Query: {} - Body: empty",
        );
        done();
      });
    });

    it("should handle request with undefined properties", (done) => {
      const request = {
        method: "PUT",
        url: "/users/123",
        body: undefined,
        params: undefined,
        query: undefined,
      };
      const context = mockExecutionContext(request);
      const handler = mockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(logger.debug).toHaveBeenCalledWith(
          "PUT /users/123 +100ms - Params: {} - Query: {} - Body: empty",
        );
        done();
      });
    });

    it("should calculate correct response time", (done) => {
      // Clear previous mocks
      jest.restoreAllMocks();

      // Mock different times for more realistic test
      const mockNow = jest.spyOn(Date, "now");
      mockNow.mockReturnValueOnce(1000); // Start time
      mockNow.mockReturnValueOnce(1250); // End time (250ms later)

      const request = mockRequest("PATCH", "/users/123");
      const context = mockExecutionContext(request);
      const handler = mockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(logger.debug).toHaveBeenCalledWith(
          expect.stringContaining("+250ms"),
        );
        mockNow.mockRestore();
        done();
      });
    });

    it("should pass through the original response", (done) => {
      const expectedResponse = { id: 1, name: "Test User" };
      const request = mockRequest("GET", "/users/1");
      const context = mockExecutionContext(request);
      const handler = mockCallHandler(expectedResponse);

      interceptor.intercept(context, handler).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it("should log complex nested objects in body", (done) => {
      const complexBody = {
        user: {
          name: "John",
          preferences: {
            language: "en",
            notifications: true,
          },
        },
        metadata: {
          source: "api",
        },
      };

      const request = mockRequest("POST", "/users", complexBody);
      const context = mockExecutionContext(request);
      const handler = mockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(logger.debug).toHaveBeenCalledWith(
          expect.stringContaining(JSON.stringify(complexBody)),
        );
        done();
      });
    });

    it("should handle arrays in query parameters", (done) => {
      const request = mockRequest("GET", "/users", {}, {}, { tags: ["admin", "user"] });
      const context = mockExecutionContext(request);
      const handler = mockCallHandler();

      interceptor.intercept(context, handler).subscribe(() => {
        expect(logger.debug).toHaveBeenCalledWith(
          expect.stringContaining("Query: {\"tags\":[\"admin\",\"user\"]}"),
        );
        done();
      });
    });
  });
});
