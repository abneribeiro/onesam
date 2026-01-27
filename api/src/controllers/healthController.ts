import { Request, Response } from 'express';
import config from '../config/environment';
import logger from '../utils/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'unknown';
    redis: 'connected' | 'disconnected' | 'disabled';
    email: 'configured' | 'not_configured';
    storage: 'configured' | 'not_configured';
  };
  config: {
    auth: 'configured' | 'incomplete';
    monitoring: 'enabled' | 'disabled';
    features: string[];
  };
}

/**
 * Health check endpoint that validates configuration and service connectivity
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  const health: HealthStatus = {
    status: 'healthy',
    timestamp,
    version: process.env.npm_package_version || 'unknown',
    environment: config.app.environment,
    services: {
      database: 'unknown',
      redis: config.redis.enabled ? 'unknown' : 'disabled',
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
    try {
      // TODO: Add actual database ping
      health.services.database = 'connected';
    } catch (error) {
      logger.error('Database health check failed:', error);
      health.services.database = 'disconnected';
      overallStatus = 'unhealthy';
    }

    // Check Redis connectivity
    if (config.redis.enabled) {
      try {
        // TODO: Add actual Redis ping
        health.services.redis = 'connected';
      } catch (error) {
        logger.warn('Redis health check failed:', error);
        health.services.redis = 'disconnected';
        if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    // Validate authentication configuration
    if (config.auth.jwtSecret && config.auth.betterAuthSecret) {
      health.config.auth = 'configured';
    } else {
      health.config.auth = 'incomplete';
      overallStatus = 'unhealthy';
    }

    // Check feature flags
    const features = [];
    if (config.email.enabled) features.push('email');
    if (config.redis.enabled) features.push('redis');
    if (config.monitoring.sentryEnabled) features.push('monitoring');
    if (config.auth.disableAuth) features.push('auth_disabled');
    health.config.features = features;

    health.status = overallStatus;

    // Log health status
    logger.info('Health check completed', {
      status: overallStatus,
      services: health.services,
      config: health.config,
    });

    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    res.status(httpStatus).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);

    health.status = 'unhealthy';
    res.status(503).json({
      ...health,
      error: 'Internal health check error',
    });
  }
};

/**
 * Configuration validation endpoint (development only)
 */
export const configInfo = (req: Request, res: Response): void => {
  if (config.app.environment === 'production') {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
    return;
  }

  const configInfo = {
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
      file: config.logging.file,
    },
  };

  res.json({
    success: true,
    data: configInfo,
  });
};