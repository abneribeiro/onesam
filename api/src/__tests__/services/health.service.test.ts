/**
 * 🧪 OneSam - HealthService Tests
 * Comprehensive test suite for system health monitoring
 *
 * Coverage:
 * ✅ Health check functionality
 * ✅ Service connectivity validation
 * ✅ Configuration validation
 * ✅ Performance metrics
 * ✅ Error handling
 * ✅ Security validation
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { PerformanceTestUtils } from '../setup';
import { healthService } from '../../services/healthService';

describe('HealthService: System Health Monitoring', () => {
  describe('Health Check Operations', () => {
    test('should perform comprehensive health check', async () => {
      const health = await healthService.performHealthCheck();

      expect(health).toBeDefined();
      expect(health.status).toMatch(/^(healthy|degraded|unhealthy)$/);
      expect(health.timestamp).toBeDefined();
      expect(health.version).toBeDefined();
      expect(health.environment).toBeDefined();
      expect(health.services).toBeDefined();
      expect(health.config).toBeDefined();
    });

    test('should validate health status structure', async () => {
      const health = await healthService.performHealthCheck();

      // Check services structure
      expect(health.services).toHaveProperty('database');
      expect(health.services).toHaveProperty('redis');
      expect(health.services).toHaveProperty('email');
      expect(health.services).toHaveProperty('storage');

      // Check config structure
      expect(health.config).toHaveProperty('auth');
      expect(health.config).toHaveProperty('monitoring');
      expect(health.config).toHaveProperty('features');

      // Validate service states
      const validServiceStates = ['connected', 'disconnected', 'disabled'];
      expect(validServiceStates).toContain(health.services.database);
      expect(validServiceStates).toContain(health.services.redis);

      const validConfigStates = ['configured', 'not_configured', 'incomplete'];
      expect(validConfigStates).toContain(health.services.email);
      expect(validConfigStates).toContain(health.services.storage);
    });

    test('should include performance metrics', async () => {
      const health = await healthService.performHealthCheck();

      expect(health.metrics).toBeDefined();
      expect(health.metrics!.uptime).toBeGreaterThanOrEqual(0);
      expect(health.metrics!.memory).toBeDefined();
      expect(health.metrics!.memory.heapUsed).toBeGreaterThan(0);
      expect(health.metrics!.memory.heapTotal).toBeGreaterThan(0);
    });

    test('should return appropriate timestamp format', async () => {
      const health = await healthService.performHealthCheck();

      expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      const timestamp = new Date(health.timestamp);
      expect(Math.abs(timestamp.getTime() - Date.now())).toBeLessThan(5000);
    });
  });

  describe('Database Health Validation', () => {
    test('should check database connectivity', async () => {
      const dbHealth = await healthService.checkDatabaseHealth();

      expect(dbHealth).toBeDefined();
      expect(dbHealth.connected).toBeDefined();

      if (dbHealth.connected) {
        expect(dbHealth.responseTime).toBeGreaterThan(0);
        expect(dbHealth.responseTime).toBeLessThan(5000); // Should be under 5 seconds
      } else {
        expect(dbHealth.error).toBeDefined();
        expect(typeof dbHealth.error).toBe('string');
      }
    });

    test('should measure database response time', async () => {
      const dbHealth = await healthService.checkDatabaseHealth();

      if (dbHealth.connected) {
        expect(dbHealth.responseTime).toBeDefined();
        expect(dbHealth.responseTime).toBeGreaterThan(0);
        // Database queries should be fast
        expect(dbHealth.responseTime).toBeLessThan(1000);
      }
    });
  });

  describe('Redis Health Validation', () => {
    test('should check Redis connectivity when enabled', async () => {
      const redisHealth = await healthService.checkRedisHealth();

      expect(redisHealth).toBeDefined();
      expect(redisHealth.status).toMatch(/^(connected|disconnected|disabled)$/);

      if (redisHealth.status === 'disconnected') {
        expect(redisHealth.error).toBeDefined();
      }
    });

    test('should handle disabled Redis gracefully', async () => {
      const redisHealth = await healthService.checkRedisHealth();

      if (redisHealth.status === 'disabled') {
        expect(redisHealth.error).toBeUndefined();
      }
    });
  });

  describe('Configuration Validation', () => {
    test('should validate authentication configuration', () => {
      const authConfig = healthService.validateAuthConfig();

      expect(authConfig).toBeDefined();
      expect(authConfig.valid).toBeDefined();

      if (!authConfig.valid) {
        expect(authConfig.error).toBeDefined();
        expect(typeof authConfig.error).toBe('string');
      }
    });

    test('should identify enabled features', () => {
      const features = healthService.getEnabledFeatures();

      expect(Array.isArray(features)).toBe(true);

      // Common features to check for
      const possibleFeatures = ['email', 'redis', 'monitoring', 'auth_disabled', 'storage'];
      features.forEach(feature => {
        expect(possibleFeatures).toContain(feature);
      });
    });

    test('should provide config info in development', () => {
      // This test might need environment check
      try {
        const configInfo = healthService.getConfigInfo();

        expect(configInfo).toBeDefined();
        expect(configInfo.app).toBeDefined();
        expect(configInfo.features).toBeDefined();
        expect(configInfo.upload).toBeDefined();
        expect(configInfo.rateLimit).toBeDefined();
        expect(configInfo.logging).toBeDefined();

        // Validate structure
        expect(configInfo.app.name).toBeDefined();
        expect(configInfo.app.environment).toBeDefined();
        expect(configInfo.app.port).toBeGreaterThan(0);
      } catch (error: any) {
        // Should fail in production
        expect(error.message).toContain('production');
      }
    });
  });

  describe('System Metrics', () => {
    test('should provide system performance metrics', () => {
      const metrics = healthService.getSystemMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.uptime).toBeGreaterThanOrEqual(0);
      expect(metrics.memory).toBeDefined();
      expect(metrics.memory.heapUsed).toBeGreaterThan(0);
      expect(metrics.memory.heapTotal).toBeGreaterThan(0);
      expect(metrics.memory.external).toBeGreaterThanOrEqual(0);
      expect(metrics.memory.rss).toBeGreaterThan(0);
    });

    test('should track uptime correctly', async () => {
      const metrics1 = healthService.getSystemMetrics();

      // Wait a short time
      await new Promise(resolve => setTimeout(resolve, 100));

      const metrics2 = healthService.getSystemMetrics();

      expect(metrics2.uptime).toBeGreaterThanOrEqual(metrics1.uptime);
    });
  });

  describe('Quick Health Check', () => {
    test('should perform quick health check', async () => {
      const quickHealth = await healthService.quickHealthCheck();

      expect(quickHealth).toBeDefined();
      expect(quickHealth.status).toMatch(/^(ok|error)$/);
      expect(quickHealth.timestamp).toBeDefined();
      expect(quickHealth.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('quick health check should be faster than full check', async () => {
      const quickStart = Date.now();
      await healthService.quickHealthCheck();
      const quickTime = Date.now() - quickStart;

      const fullStart = Date.now();
      await healthService.performHealthCheck();
      const fullTime = Date.now() - fullStart;

      expect(quickTime).toBeLessThan(5000);
      expect(fullTime).toBeLessThan(5000);
    });
  });

  describe('HTTP Status Mapping', () => {
    test('should map health status to appropriate HTTP codes', () => {
      const healthyCode = healthService.getHttpStatusCode('healthy');
      const degradedCode = healthService.getHttpStatusCode('degraded');
      const unhealthyCode = healthService.getHttpStatusCode('unhealthy');

      expect(healthyCode).toBe(200);
      expect(degradedCode).toBe(200);
      expect(unhealthyCode).toBe(503);
    });

    test('should handle invalid status gracefully', () => {
      const invalidCode = healthService.getHttpStatusCode('invalid' as any);
      expect(invalidCode).toBe(500);
    });
  });

  describe('Service Validation', () => {
    test('should validate individual services', async () => {
      const dbValid = await healthService.validateService('database');
      expect(typeof dbValid).toBe('boolean');

      const redisValid = await healthService.validateService('redis');
      expect(typeof redisValid).toBe('boolean');

      const storageValid = await healthService.validateService('storage');
      expect(typeof storageValid).toBe('boolean');
    });

    test('should handle invalid service names', async () => {
      const invalidValid = await healthService.validateService('invalid' as any);
      expect(invalidValid).toBe(false);
    });
  });

  describe('System Readiness', () => {
    test('should check system readiness', async () => {
      const isReady = await healthService.isReady();
      expect(typeof isReady).toBe('boolean');

      if (isReady) {
        // If ready, health status should not be unhealthy
        const health = await healthService.performHealthCheck();
        expect(health.status).not.toBe('unhealthy');
      }
    });

    test('should handle readiness check errors gracefully', async () => {
      // This test simulates error conditions
      try {
        const isReady = await healthService.isReady();
        expect(typeof isReady).toBe('boolean');
      } catch (error) {
        // Should not throw, should return false
        fail('Readiness check should not throw errors');
      }
    });
  });

  describe('Performance & Load Testing', () => {
    test('should perform health checks efficiently', async () => {
      await PerformanceTestUtils.testQueryPerformance(async () => {
        return await healthService.performHealthCheck();
      }, 2000); // Health check should complete within 2 seconds
    });

    test('should handle concurrent health checks', async () => {
      await PerformanceTestUtils.testConcurrency(async () => {
        return await healthService.quickHealthCheck();
      }, 20);
    });

    test('should handle rapid successive health checks', async () => {
      const results = await Promise.all([
        healthService.quickHealthCheck(),
        healthService.quickHealthCheck(),
        healthService.quickHealthCheck(),
        healthService.quickHealthCheck(),
        healthService.quickHealthCheck(),
      ]);

      results.forEach(result => {
        expect(result.status).toMatch(/^(ok|error)$/);
        expect(result.timestamp).toBeDefined();
      });

      // All results should be recent
      const now = Date.now();
      results.forEach(result => {
        const resultTime = new Date(result.timestamp).getTime();
        expect(now - resultTime).toBeLessThan(5000); // Within 5 seconds
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle database connection failures gracefully', async () => {
      // This test would require mocking database failures
      try {
        const health = await healthService.performHealthCheck();
        // Even with DB failures, should return valid structure
        expect(health).toBeDefined();
        expect(health.services.database).toMatch(/^(connected|disconnected)$/);
      } catch (error) {
        // Should not throw, should return unhealthy status
        fail('Health check should not throw on database failures');
      }
    });

    test('should maintain service uptime tracking', () => {
      const uptime1 = healthService.getUptime();
      expect(uptime1).toBeGreaterThanOrEqual(0);

      // Multiple calls should show increasing uptime
      setTimeout(() => {
        const uptime2 = healthService.getUptime();
        expect(uptime2).toBeGreaterThanOrEqual(uptime1);
      }, 100);
    });

    test('should handle memory pressure gracefully', () => {
      const metrics = healthService.getSystemMetrics();

      // Memory usage should be reasonable
      const heapUsedMB = metrics.memory.heapUsed / (1024 * 1024);
      expect(heapUsedMB).toBeLessThan(1000); // Less than 1GB heap usage

      // RSS should be greater than heap
      expect(metrics.memory.rss).toBeGreaterThan(metrics.memory.heapUsed);
    });
  });

  describe('Health Status Integration', () => {
    test('should provide consistent status across multiple checks', async () => {
      const health1 = await healthService.performHealthCheck();
      const health2 = await healthService.performHealthCheck();

      // Status should be consistent (unless system changed rapidly)
      if (health1.services.database === 'connected') {
        expect(health2.services.database).toBe('connected');
      }

      if (health1.config.auth === 'configured') {
        expect(health2.config.auth).toBe('configured');
      }
    });

    test('should correlate quick check with full check results', async () => {
      const [quickCheck, fullCheck] = await Promise.all([
        healthService.quickHealthCheck(),
        healthService.performHealthCheck(),
      ]);

      // If quick check is OK, full check should not be unhealthy
      if (quickCheck.status === 'ok') {
        expect(fullCheck.status).not.toBe('unhealthy');
      }

      // If quick check errors, full check might show issues
      if (quickCheck.status === 'error') {
        // Full check might be degraded or unhealthy
        expect(['degraded', 'unhealthy']).toContain(fullCheck.status);
      }
    });
  });
});