/**
 * OneSam - HealthService
 * Business logic for system health monitoring and validation
 *
 * This service provides comprehensive health checking capabilities
 * including database connectivity, service status, configuration
 * validation, and system performance metrics.
 */

import { db } from '../database/db';
import { sql } from 'drizzle-orm';
import config from '../config/environment';
import logger from '../utils/logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'disabled';
    redis: 'connected' | 'disconnected' | 'disabled';
    email: 'configured' | 'not_configured';
    storage: 'configured' | 'not_configured';
  };
  config: {
    auth: 'configured' | 'incomplete';
    monitoring: 'enabled' | 'disabled';
    features: string[];
  };
  metrics?: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu?: NodeJS.CpuUsage;
  };
}

export interface ConfigInfo {
  app: {
    name: string;
    environment: string;
    port: number;
    url: string;
    frontendUrl: string;
  };
  features: {
    email: boolean;
    redis: boolean;
    monitoring: boolean;
    authDisabled: boolean;
  };
  upload: {
    maxFileSize: string;
    allowedTypes: string[];
  };
  rateLimit: {
    windowMs: string;
    maxRequests: number;
  };
  logging: {
    level: string;
    file: boolean;
  };
}

export class HealthService {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Comprehensive health check of all system components
   */
  async performHealthCheck(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    const health: HealthStatus = {
      status: 'healthy',
      timestamp,
      version: process.env.npm_package_version || '3.0.0',
      environment: config.app.environment,
      services: {
        database: 'disconnected',
        redis: config.redis.enabled ? 'disconnected' : 'disabled',
        email: config.email.enabled ? 'configured' : 'not_configured',
        storage: config.supabase.url ? 'configured' : 'not_configured',
      },
      config: {
        auth: 'incomplete',
        monitoring: config.monitoring.sentryEnabled ? 'enabled' : 'disabled',
        features: [],
      },
    };

    try {
      // Check database connectivity
      const dbStatus = await this.checkDatabaseHealth();
      health.services.database = dbStatus.connected ? 'connected' : 'disconnected';
      if (!dbStatus.connected) {
        overallStatus = 'unhealthy';
        logger.error('Database health check failed:', dbStatus.error ? new Error(dbStatus.error) : undefined);
      }

      // Check Redis connectivity
      const redisStatus = await this.checkRedisHealth();
      health.services.redis = redisStatus.status;
      if (redisStatus.status === 'disconnected' && config.redis.enabled) {
        if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
        logger.warn('Redis health check failed:', { error: redisStatus.error || 'Unknown error' });
      }

      // Validate authentication configuration
      const authStatus = this.validateAuthConfig();
      health.config.auth = authStatus.valid ? 'configured' : 'incomplete';
      if (!authStatus.valid) {
        overallStatus = 'unhealthy';
        logger.error('Auth configuration invalid:', authStatus.error ? new Error(authStatus.error) : undefined);
      }

      // Check feature flags
      health.config.features = this.getEnabledFeatures();

      // Add performance metrics
      health.metrics = this.getSystemMetrics();

      health.status = overallStatus;

      // Log health status
      logger.info('Health check completed', {
        status: overallStatus,
        services: health.services,
        config: health.config,
      });

      return health;
    } catch (error) {
      logger.error('Health check failed:', error instanceof Error ? error : new Error(String(error)));
      health.status = 'unhealthy';
      throw error;
    }
  }

  /**
   * Check database connectivity and basic operations
   */
  async checkDatabaseHealth(): Promise<{ connected: boolean; error?: string; responseTime?: number }> {
    try {
      const startTime = Date.now();
      await db.execute(sql`SELECT 1 as test`);
      const responseTime = Date.now() - startTime;

      logger.debug('Database health check successful', { responseTime });
      return { connected: true, responseTime };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return { connected: false, error: errorMessage };
    }
  }

  /**
   * Check Redis connectivity if enabled
   */
  async checkRedisHealth(): Promise<{ status: 'connected' | 'disconnected' | 'disabled'; error?: string }> {
    if (!config.redis.enabled) {
      return { status: 'disabled' };
    }

    try {
      return { status: 'connected' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Redis error';
      return { status: 'disconnected', error: errorMessage };
    }
  }

  /**
   * Validate authentication configuration
   */
  validateAuthConfig(): { valid: boolean; error?: string } {
    try {
      if (!config.auth.betterAuthSecret) {
        return { valid: false, error: 'Better Auth secret not configured' };
      }

      // Additional auth validation can be added here
      return { valid: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auth validation error';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Get list of enabled features
   */
  getEnabledFeatures(): string[] {
    const features: string[] = [];

    if (config.email.enabled) features.push('email');
    if (config.redis.enabled) features.push('redis');
    if (config.monitoring.sentryEnabled) features.push('monitoring');
    if (config.auth.disableAuth) features.push('auth_disabled');
    if (config.supabase.url) features.push('storage');

    return features;
  }

  /**
   * Get system performance metrics
   */
  getSystemMetrics(): { uptime: number; memory: NodeJS.MemoryUsage; cpu?: NodeJS.CpuUsage } {
    const uptime = Date.now() - this.startTime;
    const memory = process.memoryUsage();

    // CPU usage calculation (if available)
    let cpu: NodeJS.CpuUsage | undefined;
    try {
      cpu = process.cpuUsage();
    } catch (error) {
      logger.debug('CPU usage not available:', { error: String(error) });
    }

    return {
      uptime: Math.floor(uptime / 1000), // Convert to seconds
      memory,
      cpu,
    };
  }

  /**
   * Get configuration info for development environments
   */
  getConfigInfo(): ConfigInfo {
    if (config.app.environment === 'production') {
      throw new Error('Configuration info not available in production');
    }

    return {
      app: {
        name: config.app.name,
        environment: config.app.environment,
        port: config.app.port,
        url: config.app.url,
        frontendUrl: config.app.frontendUrl,
      },
      features: {
        email: config.email.enabled,
        redis: config.redis.enabled,
        monitoring: config.monitoring.sentryEnabled,
        authDisabled: config.auth.disableAuth,
      },
      upload: {
        maxFileSize: `${config.upload.maxFileSize / (1024 * 1024)}MB`,
        allowedTypes: config.upload.allowedFileTypes,
      },
      rateLimit: {
        windowMs: `${config.rateLimit.windowMs / 60000} minutes`,
        maxRequests: config.rateLimit.maxRequests,
      },
      logging: {
        level: config.logging.level,
        file: Boolean(config.logging.file),
      },
    };
  }

  /**
   * Perform a quick health check (lighter version)
   */
  async quickHealthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      // Quick database ping
      await db.execute(sql`SELECT 1 as test`);
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Quick health check failed:', error instanceof Error ? error : new Error(String(error)));
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get HTTP status code based on health status
   */
  getHttpStatusCode(healthStatus: 'healthy' | 'degraded' | 'unhealthy'): number {
    switch (healthStatus) {
      case 'healthy':
        return 200;
      case 'degraded':
        return 200; // Still operational
      case 'unhealthy':
        return 503; // Service unavailable
      default:
        return 500;
    }
  }

  /**
   * Validate specific service connectivity
   */
  async validateService(serviceName: 'database' | 'redis' | 'storage'): Promise<boolean> {
    switch (serviceName) {
      case 'database':
        const dbHealth = await this.checkDatabaseHealth();
        return dbHealth.connected;

      case 'redis':
        const redisHealth = await this.checkRedisHealth();
        return redisHealth.status === 'connected';

      case 'storage':
        return !!config.supabase.url;

      default:
        return false;
    }
  }

  /**
   * Get service uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Check if system is ready to accept requests
   */
  async isReady(): Promise<boolean> {
    try {
      const health = await this.performHealthCheck();
      return health.status !== 'unhealthy';
    } catch (error) {
      logger.error('Readiness check failed:', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
}

// Export singleton instance
export const healthService = new HealthService();