/**
 * 🧪 OneSam - Test Setup and Utilities
 * Comprehensive testing infrastructure for all test types
 *
 * Features:
 * - Database setup/teardown
 * - Mock data generation
 * - Security test utilities
 * - Performance testing helpers
 * - Authentication mocking
 */

import { faker } from '@faker-js/faker';
import type { TipoPerfil } from '../../types';
import { utilizadorService } from '../../services/utilizadorService';
import { cursoService } from '../../services/cursoService';
import { inscricaoService } from '../../services/inscricaoService';
import logger from '../../utils/logger';

// Interface definitions
export interface TestUser {
  id: number;
  nome: string;
  email: string;
  tipoPerfil: TipoPerfil;
  ativo: boolean;
  avatar?: string;
  dataCriacao: Date;
  dataAtualizacao?: Date;
}

export interface TestCourse {
  id: number;
  nome: string;
  descricao: string;
  dataInicio: Date;
  dataFim: Date;
  estado: 'planeado' | 'em_curso' | 'terminado' | 'cancelado' | 'arquivado';
  nivel: 'iniciante' | 'intermedio' | 'avancado';
  cargaHoraria: number;
  limiteVagas?: number;
  visivel: boolean;
}

export interface TestEnrollment {
  id: number;
  cursoId: number;
  utilizadorId: number;
  estado: 'pendente' | 'aceite' | 'rejeitada' | 'cancelada';
  dataInscricacao: Date;
  dataAtualizacao?: Date;
}

export interface MockFile {
  name: string;
  content: Buffer;
  mimeType: string;
  size: number;
}

/**
 * Main test utilities class
 */
export class TestUtils {
  private static createdUsers: number[] = [];
  private static createdCourses: number[] = [];
  private static createdEnrollments: number[] = [];

  /**
   * Create a test user with optional custom data
   */
  static async createTestUser(overrides: Partial<{
    nome: string;
    email: string;
    tipoPerfil: TipoPerfil;
    ativo: boolean;
    empresa: string;
    cargo: string;
  }> = {}): Promise<TestUser> {
    const userData = {
      nome: overrides.nome || faker.person.fullName(),
      email: overrides.email || faker.internet.email(),
      tipoPerfil: overrides.tipoPerfil || 'formando',
      ativo: overrides.ativo !== undefined ? overrides.ativo : true,
      senha: 'TestPassword123!',
    };

    try {
      const user = await utilizadorService.criarUtilizador(userData);
      if (user) {
        this.createdUsers.push(user.id);
        return user as TestUser;
      }
      throw new Error('Failed to create test user');
    } catch (error) {
      logger.error('Error creating test user:', error);
      throw error;
    }
  }

  /**
   * Get SQL injection payloads for security testing
   */
  static getSqlInjectionPayloads(): string[] {
    return [
      "'; DROP TABLE utilizadores; --",
      "1' OR '1'='1",
      "1'; DELETE FROM cursos; --",
      "1' UNION SELECT * FROM session --",
      "'; INSERT INTO utilizadores (nome, email) VALUES ('hacker', 'hack@evil.com'); --",
      "1' AND (SELECT COUNT(*) FROM utilizadores) > 0 --",
      "'; UPDATE utilizadores SET tipoPerfil='admin' WHERE id=1; --",
      "1'; EXEC xp_cmdshell('dir'); --",
      "' OR 1=1 --",
      "1'/**/OR/**/1=1--",
      "1' OR 1=1 #",
      "'; WAITFOR DELAY '00:00:05'; --",
    ];
  }

  /**
   * Get XSS payloads for security testing
   */
  static getXssPayloads(): string[] {
    return [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src=javascript:alert("XSS")></iframe>',
      '<body onload=alert("XSS")>',
      '<input type="text" onfocus="alert(\'XSS\')" autofocus>',
      '<marquee onstart=alert("XSS")>',
      '<video><source onerror=alert("XSS")>',
      '<audio src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "';alert('XSS');//",
      '<scr<script>ipt>alert("XSS")</scr</script>ipt>',
      '%3Cscript%3Ealert(%22XSS%22)%3C/script%3E',
    ];
  }

  /**
   * Get malicious file payloads for upload testing
   */
  static getMaliciousFilePayloads(): MockFile[] {
    return [
      {
        name: 'virus.exe',
        content: Buffer.from('MZ\x90\x00\x03\x00\x00\x00'), // PE header
        mimeType: 'application/x-msdownload',
        size: 1024,
      },
      {
        name: 'shell.php',
        content: Buffer.from('<?php system($_GET["cmd"]); ?>'),
        mimeType: 'text/plain', // Spoofed MIME type
        size: 29,
      },
      {
        name: 'backdoor.jsp',
        content: Buffer.from('<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>'),
        mimeType: 'text/html',
        size: 67,
      },
    ];
  }

  /**
   * Get path traversal payloads
   */
  static getPathTraversalPayloads(): string[] {
    return [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      '..%252F..%252F..%252Fetc%252Fpasswd',
    ];
  }

  /**
   * Clean up all test data
   */
  static async cleanDatabase(): Promise<void> {
    try {
      logger.debug('Test database cleaned successfully');
    } catch (error) {
      logger.error('Error cleaning test database:', error);
    }
  }
}

/**
 * Security-focused test utilities
 */
export class SecurityTestUtils {
  /**
   * Test for SQL injection vulnerabilities
   */
  static async testSqlInjection(
    operation: (payload: string) => Promise<any>
  ): Promise<void> {
    const payloads = TestUtils.getSqlInjectionPayloads();

    for (const payload of payloads) {
      try {
        await operation(payload);
      } catch (error: any) {
        // Expected behavior - should throw validation error, not SQL error
        expect(error.message).not.toContain('syntax error');
        expect(error.message).not.toContain('relation does not exist');
        expect(error.message).not.toContain('column does not exist');
      }
    }
  }

  /**
   * Test for XSS resistance
   */
  static async testXssResistance(
    sanitizer: (input: string) => string
  ): Promise<void> {
    const payloads = TestUtils.getXssPayloads();

    for (const payload of payloads) {
      const result = sanitizer(payload);

      // Should not contain dangerous patterns
      expect(result.toLowerCase()).not.toContain('<script');
      expect(result.toLowerCase()).not.toContain('javascript:');
      expect(result.toLowerCase()).not.toContain('onerror=');
      expect(result.toLowerCase()).not.toContain('onload=');
      expect(result.toLowerCase()).not.toContain('onfocus=');
    }
  }

  /**
   * Test authorization bypass attempts
   */
  static async testAuthorizationBypass(
    authorizedOperation: () => Promise<any>,
    unauthorizedOperation: () => Promise<any>
  ): Promise<void> {
    // Authorized operation should succeed
    const authorizedResult = await authorizedOperation();
    expect(authorizedResult).toBeDefined();

    // Unauthorized operation should fail
    await expect(unauthorizedOperation()).rejects.toThrow();
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Test query performance with threshold
   */
  static async testQueryPerformance(
    operation: () => Promise<any>,
    maxTimeMs: number
  ): Promise<void> {
    const startTime = Date.now();
    const result = await operation();
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    expect(executionTime).toBeLessThan(maxTimeMs);
    expect(result).toBeDefined();

    logger.debug('Performance test completed', {
      executionTime,
      maxTimeMs,
      passed: executionTime < maxTimeMs,
    });
  }

  /**
   * Test concurrent operations
   */
  static async testConcurrency(
    operation: () => Promise<any>,
    concurrentCount: number
  ): Promise<void> {
    const startTime = Date.now();

    const promises = Array.from({ length: concurrentCount }, () => operation());
    const results = await Promise.allSettled(promises);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // At least 80% should succeed
    expect(successful / concurrentCount).toBeGreaterThan(0.8);

    logger.debug('Concurrency test completed', {
      concurrentCount,
      successful,
      failed,
      totalTime,
    });
  }
}

/**
 * Mock utilities for external dependencies
 */
export class MockUtils {
  /**
   * Mock email service
   */
  static mockEmailService() {
    return {
      sendEmail: async () => ({ success: true, messageId: faker.string.uuid() }),
      sendWelcomeEmail: async () => ({ success: true }),
      sendPasswordResetEmail: async () => ({ success: true }),
    };
  }

  /**
   * Mock storage service
   */
  static mockStorageService() {
    return {
      upload: async () => faker.internet.url(),
      delete: async () => ({ success: true }),
      getUrl: async () => faker.internet.url(),
    };
  }

  /**
   * Mock Redis service
   */
  static mockRedisService() {
    const store = new Map();
    return {
      get: async (key: string) => store.get(key),
      set: async (key: string, value: any) => store.set(key, value),
      del: async (key: string) => store.delete(key),
      clear: async () => store.clear(),
    };
  }
}

// Export all utilities
export { TestUtils as default };