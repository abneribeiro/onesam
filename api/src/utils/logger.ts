import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

interface LogMetadata {
  [key: string]: any;
}

interface HttpLogMetadata extends LogMetadata {
  method: string;
  url: string;
  status: number;
  duration: string;
  userAgent?: string;
  userId: number | string;
  userRole?: string;
  requestId?: string;
}

class Logger {
  private winston!: winston.Logger;
  private logDir: string;

  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
    this.initializeWinston();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private initializeWinston(): void {
    const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

    const jsonFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'stack'] }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let logMessage = `[${timestamp}] ${level}: ${message}`;

        if (stack) {
          logMessage += `\n${stack}`;
        }

        const filteredMeta = { ...meta };
        delete filteredMeta.timestamp;
        delete filteredMeta.level;
        delete filteredMeta.message;

        if (Object.keys(filteredMeta).length > 0) {
          logMessage += `\nMeta: ${JSON.stringify(filteredMeta, null, 2)}`;
        }

        return logMessage;
      })
    );

    const transports: winston.transport[] = [];

    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          level: logLevel
        })
      );
    }

    transports.push(
      new winston.transports.File({
        filename: path.join(this.logDir, 'application.log'),
        format: jsonFormat,
        level: logLevel,
        maxsize: 10 * 1024 * 1024,
        maxFiles: 10,
        tailable: true
      })
    );

    transports.push(
      new winston.transports.File({
        filename: path.join(this.logDir, 'error.log'),
        format: jsonFormat,
        level: 'error',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
        tailable: true
      })
    );

    this.winston = winston.createLogger({
      level: logLevel,
      format: jsonFormat,
      defaultMeta: { service: 'onesam-api' },
      transports,
      exitOnError: false,
      silent: false
    });
  }

  private enrichMetadata(meta: LogMetadata = {}): LogMetadata {
    const baseMetadata: LogMetadata = {
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development'
    };

    if (this.winston.level === 'debug') {
      const memUsage = process.memoryUsage();
      baseMetadata.memory = {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
      };
    }

    return { ...baseMetadata, ...meta };
  }

  info(message: string, meta: LogMetadata = {}): void {
    this.winston.info(message, this.enrichMetadata(meta));
  }

  warn(message: string, meta: LogMetadata = {}): void {
    this.winston.warn(message, this.enrichMetadata(meta));
  }

  error(message: string, meta: LogMetadata | Error = {}): void {
    if (meta instanceof Error) {
      this.winston.error(message, this.enrichMetadata({
        error: meta.message,
        stack: meta.stack,
        name: meta.name
      }));
    } else {
      this.winston.error(message, this.enrichMetadata(meta));
    }
  }

  debug(message: string, meta: LogMetadata = {}): void {
    this.winston.debug(message, this.enrichMetadata(meta));
  }

  httpRequest(req: Request, res: Response, duration: number): void {
    const requestMeta: HttpLogMetadata = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      userId: (req as any).utilizador?.id || 'anonymous',
      userRole: (req as any).utilizador?.tipoPerfil || 'unknown',
      requestId: (req as any).requestId
    };

    if (res.statusCode >= 400 || duration > 5000) {
      this.winston.warn('HTTP Request', this.enrichMetadata(requestMeta));
    } else {
      this.winston.info('HTTP Request', this.enrichMetadata(requestMeta));
    }
  }

  database(operation: string, table: string, meta: LogMetadata = {}): void {
    this.winston.debug('Database Operation', this.enrichMetadata({
      operation,
      table,
      ...meta
    }));
  }

  auth(action: string, meta: LogMetadata = {}): void {
    this.winston.info('Authentication', this.enrichMetadata({
      action,
      ...meta
    }));
  }

  performance(operation: string, duration: number, meta: LogMetadata = {}): void {
    const performanceMeta = this.enrichMetadata({
      operation,
      duration: `${duration}ms`,
      ...meta
    });

    if (duration > 1000) {
      this.winston.warn('Performance - Slow Operation', performanceMeta);
    } else {
      this.winston.info('Performance', performanceMeta);
    }
  }

  service(serviceName: string, operation: string, meta: LogMetadata = {}): void {
    this.winston.info('Service Operation', this.enrichMetadata({
      service: serviceName,
      operation,
      ...meta
    }));
  }

  business(message: string, meta: LogMetadata = {}): void {
    this.winston.warn('Business Logic', this.enrichMetadata({
      message,
      ...meta
    }));
  }
}

export default new Logger();
