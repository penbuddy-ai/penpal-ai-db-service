import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const body = req.body || {};
    const userAgent = req.get("user-agent") || "";
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `[REQUEST] ${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    // Capture response
    const originalSend = res.send;
    res.send = function (body) {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get("content-length") || 0;

      // Log response
      Logger.log(
        `[RESPONSE] ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms - ${contentLength}b`,
        "HTTP",
      );

      // Optional: Log response body in debug mode
      if (process.env.LOG_LEVEL === "debug" && body) {
        try {
          const stringBody = typeof body === "object" ? JSON.stringify(body) : body;
          const truncatedBody = stringBody.length > 1000 ? `${stringBody.substring(0, 1000)}...` : stringBody;
          Logger.debug(`Response Body: ${truncatedBody}`, "HTTP");
        }
        catch {
          Logger.debug(`Unable to stringify response body`, "HTTP");
        }
      }

      return originalSend.call(this, body);
    };

    next();
  }
}
