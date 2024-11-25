import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export interface LoggerOptions {
  enabled?: boolean;
  logRequest?: boolean;
  logHeaders?: boolean;
  logBody?: boolean;
  logResponse?: boolean;
  logLatency?: boolean;
  logUserAgent?: boolean;
  logIP?: boolean;
  logProtocol?: boolean;
  colorized?: boolean;
}

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  orange: '\x1b[38;5;208m',
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private static options: LoggerOptions = {
    enabled: true,
    logRequest: false,
    logHeaders: false,
    logBody: false,
    logResponse: false,
    logLatency: false,
    logUserAgent: false,
    logIP: false,
    logProtocol: false,
    colorized: true,
  };
  private requestNumber = 0;

  static configure(options: LoggerOptions) {
    LoggerMiddleware.options = { ...LoggerMiddleware.options, ...options };
  }

  use(request: Request, response: Response, next: NextFunction): void {
    if (!LoggerMiddleware.options.enabled) {
      return next();
    }

    this.requestNumber++;
    const { method, originalUrl, headers, body, protocol, httpVersion } =
      request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;
    const start = Date.now();

    // Only log request if explicitly enabled
    this.logRequestLine(this.requestNumber, method, originalUrl);

    // Additional logs only if their respective flags are enabled
    if (LoggerMiddleware.options.logHeaders) {
      console.log(
        this.formatLog(
          this.requestNumber,
          'Headers:',
          this.getColor(JSON.stringify(headers), colors.cyan),
        ),
      );
    }

    if (LoggerMiddleware.options.logBody) {
      console.log(
        this.formatLog(
          this.requestNumber,
          'Body:',
          this.getColor(JSON.stringify(body), colors.cyan),
        ),
      );
    }

    if (LoggerMiddleware.options.logUserAgent) {
      console.log(
        this.formatLog(
          this.requestNumber,
          'User-Agent:',
          this.getColor(userAgent, colors.green),
        ),
      );
    }

    if (LoggerMiddleware.options.logIP) {
      console.log(
        this.formatLog(
          this.requestNumber,
          'IP:',
          this.getColor(ip, colors.green),
        ),
      );
    }

    if (LoggerMiddleware.options.logProtocol) {
      console.log(
        this.formatLog(
          this.requestNumber,
          'Protocol:',
          this.getColor(`${protocol} HTTP/${httpVersion}`, colors.cyan),
        ),
      );
    }

    response.on('finish', () => {
      if (
        !LoggerMiddleware.options.logResponse &&
        !LoggerMiddleware.options.logLatency
      ) {
        return;
      }

      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const end = Date.now();
      const latency = end - start;
      const parts = [];

      if (LoggerMiddleware.options.logResponse) {
        parts.push(
          this.getColor(String(statusCode), colors.yellow),
          this.getColor(String(contentLength || '-'), colors.cyan),
        );
      }

      if (LoggerMiddleware.options.logLatency) {
        const latencyColor =
          latency <= 300
            ? colors.green
            : latency <= 1000
              ? colors.yellow
              : colors.red;
        parts.push(this.getColor(`+${latency}ms`, latencyColor));
      }

      if (parts.length > 0) {
        parts.push(this.getColor('[END]', colors.magenta));
        console.log(this.formatLog(this.requestNumber, ...parts));
      }
    });

    next();
  }

  private getColor(text: string, colorCode: string): string {
    return LoggerMiddleware.options.colorized
      ? `${colorCode}${text}${colors.reset}`
      : text;
  }

  private formatLog(number: number, ...parts: string[]): string {
    const numberColor = colors.blue;
    const baseLog = `[#${this.getColor(String(number), numberColor)}] ⇝⫸ `;
    return baseLog + parts.join(' ');
  }

  private logRequestLine(number: number, method: string, url: string) {
    if (LoggerMiddleware.options.logRequest) {
      console.log(
        this.formatLog(
          number,
          this.getColor(method, colors.yellow),
          this.getColor(url, colors.blue),
        ),
      );
    }
  }
}
