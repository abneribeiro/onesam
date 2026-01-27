import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import logger from '../utils/logger';

// In-memory fallback if Redis is not available
const memoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

class RateLimiter {
  private redis: Redis | null = null;
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Muitas tentativas. Tente novamente mais tarde.',
      skipSuccessfulRequests: false,
      keyGenerator: (req) => req.ip || req.connection.remoteAddress || 'unknown',
      ...options,
    };

    // Try to connect to Redis if available
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
      }
    } catch (error) {
      logger.warn('Redis not available for rate limiting, using memory store', { error });
    }
  }

  private async getCount(key: string): Promise<number> {
    if (this.redis) {
      try {
        const count = await this.redis.get(key);
        return count ? parseInt(count, 10) : 0;
      } catch (error) {
        logger.warn('Redis error in rate limiter', { error });
        return this.getMemoryCount(key);
      }
    }
    return this.getMemoryCount(key);
  }

  private async incrementCount(key: string): Promise<number> {
    if (this.redis) {
      try {
        const multi = this.redis.multi();
        multi.incr(key);
        multi.expire(key, Math.ceil(this.options.windowMs / 1000));
        const results = await multi.exec();
        return results?.[0]?.[1] as number || 1;
      } catch (error) {
        logger.warn('Redis error in rate limiter', { error });
        return this.incrementMemoryCount(key);
      }
    }
    return this.incrementMemoryCount(key);
  }

  private getMemoryCount(key: string): number {
    const entry = memoryStore.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    return entry.count;
  }

  private incrementMemoryCount(key: string): number {
    const now = Date.now();
    const entry = memoryStore.get(key);

    if (!entry || now > entry.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + this.options.windowMs });
      return 1;
    }

    entry.count++;
    memoryStore.set(key, entry);
    return entry.count;
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = `rate_limit:${this.options.keyGenerator!(req)}`;
        const count = await this.incrementCount(key);

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', this.options.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, this.options.maxRequests - count));
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + this.options.windowMs).toISOString());

        if (count > this.options.maxRequests) {
          logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            count,
            limit: this.options.maxRequests,
          });

          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: this.options.message,
            },
          });
        }

        next();
      } catch (error) {
        logger.error('Rate limiter error', { error });
        // In case of error, allow request to continue
        next();
      }
    };
  }
}

// Predefined rate limiters for different use cases
export const generalRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
}).middleware();

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  keyGenerator: (req) => `auth:${req.ip}`,
}).middleware();

export const apiRateLimit = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 50, // 50 requests per 5 minutes
}).middleware();

export const uploadRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
  keyGenerator: (req) => `upload:${req.ip}`,
}).middleware();

export { RateLimiter };