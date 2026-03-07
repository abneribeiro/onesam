import { beforeAll, afterAll, mock, expect } from 'bun:test';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { db } from '../database/db';
import {
  utilizadores, admins, formandos, areas, categorias, cursos, inscricoes,
  reviews, notificacoes, account, progressoAulas, aulas, modulos, session,
  auditLogs, verification, quizzes, quizPerguntas, quizTentativas, certificados,
} from '../database/schema';
import { seedTestData, type TestSeedData } from '../database/seeds/test-seed';
import { hashPassword } from '../utils/password';
import type { TipoPerfil, EstadoCurso, NivelCurso, EstadoInscricao } from '../types';
import type { Request, Response, NextFunction } from 'express';

export let testData: TestSeedData;

// --- Database lifecycle ---

async function cleanDatabase(): Promise<void> {
  const tablesToDelete = [
    quizTentativas, quizPerguntas, quizzes, certificados,
    progressoAulas, reviews, notificacoes, aulas, modulos,
    inscricoes, cursos, categorias, areas, session, auditLogs,
    formandos, admins, account, utilizadores, verification,
  ];

  for (const table of tablesToDelete) {
    try { await db.delete(table); } catch { /* table may not exist */ }
  }

  const sequences = [
    '"Areas_IDArea_seq"',
    '"Categorias_IDCategoria_seq"',
    '"Utilizadores_IDUtilizador_seq"',
    '"Cursos_IDCurso_seq"',
    '"Modulos_IDModulo_seq"',
    '"Aulas_IDAula_seq"',
    '"Inscricoes_IDInscricao_seq"',
    '"Reviews_IDReview_seq"',
    '"Notificacoes_IDNotificacao_seq"',
    '"ProgressoAulas_IDProgresso_seq"',
    '"Quizzes_IDQuiz_seq"',
    '"QuizPerguntas_IDPergunta_seq"',
    '"QuizTentativas_IDTentativa_seq"',
    '"Certificados_IDCertificado_seq"',
    '"AuditLogs_IDAuditLog_seq"',
    '"Admins_IDAdmin_seq"',
    '"Formandos_IDFormando_seq"',
  ];

  for (const seq of sequences) {
    try { await db.execute(`ALTER SEQUENCE ${seq} RESTART WITH 1`); } catch { /* sequence may not exist */ }
  }
}

beforeAll(async () => {
  await cleanDatabase();
  testData = await seedTestData();
});

afterAll(async () => {
  await cleanDatabase();
});

// --- Interfaces ---

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
  estado: EstadoCurso;
  nivel: NivelCurso;
  cargaHoraria: number;
  limiteVagas?: number;
  visivel: boolean;
}

export interface TestEnrollment {
  id: number;
  cursoId: number;
  utilizadorId: number;
  estado: EstadoInscricao;
  dataInscricacao: Date;
  dataAtualizacao?: Date;
}

export interface MockFile {
  name: string;
  content: Buffer;
  mimeType: string;
  size: number;
}

// --- TestUtils ---

export class TestUtils {
  private static createdUsers: number[] = [];

  static async createTestUser(overrides: Partial<{
    nome: string;
    email: string;
    tipoPerfil: TipoPerfil;
    ativo: boolean;
    empresa: string;
    cargo: string;
    senha: string;
  }> = {}): Promise<TestUser> {
    const tipoPerfil = overrides.tipoPerfil || 'formando';
    const password = overrides.senha || 'TestPassword123!';

    const [user] = await db.insert(utilizadores).values({
      nome: overrides.nome || faker.person.fullName(),
      email: (overrides.email || faker.internet.email()).toLowerCase(),
      emailVerified: true,
      tipoPerfil,
      ativo: overrides.ativo !== undefined ? overrides.ativo : true,
    }).returning();

    if (tipoPerfil === 'admin') {
      const [perfil] = await db.insert(admins).values({
        utilizadorId: user.id,
        departamento: 'TI',
      }).returning();
      await db.update(utilizadores)
        .set({ perfilId: perfil.id })
        .where(eq(utilizadores.id, user.id));
    } else {
      const [perfil] = await db.insert(formandos).values({
        utilizadorId: user.id,
        empresa: overrides.empresa,
        cargo: overrides.cargo,
      }).returning();
      await db.update(utilizadores)
        .set({ perfilId: perfil.id })
        .where(eq(utilizadores.id, user.id));
    }

    const passwordHash = await hashPassword(password);
    await db.insert(account).values({
      id: randomUUID(),
      accountId: String(user.id),
      providerId: 'credential',
      userId: user.id,
      password: passwordHash,
    });

    this.createdUsers.push(user.id);

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipoPerfil: user.tipoPerfil,
      ativo: user.ativo,
      avatar: user.avatar ?? undefined,
      dataCriacao: user.dataCriacao,
      dataAtualizacao: user.dataAtualizacao ?? undefined,
    };
  }

  static async createTestCourse(overrides: Partial<{
    nome: string;
    descricao: string;
    dataInicio: Date;
    dataFim: Date;
    dataLimiteInscricao: Date;
    estado: EstadoCurso;
    nivel: NivelCurso;
    cargaHoraria: number;
    limiteVagas: number;
    visivel: boolean;
    areaId: number;
    categoriaId: number;
  }> = {}): Promise<TestCourse> {
    const now = new Date();
    const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonths = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const [course] = await db.insert(cursos).values({
      areaId: overrides.areaId ?? testData.area.id,
      categoriaId: overrides.categoriaId ?? testData.categoria.id,
      nome: overrides.nome || faker.commerce.productName(),
      descricao: overrides.descricao || faker.lorem.paragraph(),
      dataInicio: overrides.dataInicio || oneMonth,
      dataFim: overrides.dataFim || twoMonths,
      dataLimiteInscricao: overrides.dataLimiteInscricao || oneMonth,
      estado: overrides.estado || 'planeado',
      nivel: overrides.nivel || 'iniciante',
      cargaHoraria: overrides.cargaHoraria ?? 40,
      limiteVagas: overrides.limiteVagas,
      visivel: overrides.visivel !== undefined ? overrides.visivel : true,
    }).returning();

    return {
      id: course.id,
      nome: course.nome,
      descricao: course.descricao ?? '',
      dataInicio: course.dataInicio,
      dataFim: course.dataFim,
      estado: course.estado,
      nivel: course.nivel,
      cargaHoraria: course.cargaHoraria ?? 0,
      limiteVagas: course.limiteVagas ?? undefined,
      visivel: course.visivel,
    };
  }

  static async createTestEnrollment(
    cursoId: number,
    utilizadorId: number,
    overrides: Partial<{ estado: EstadoInscricao }> = {},
  ): Promise<TestEnrollment> {
    const [enrollment] = await db.insert(inscricoes).values({
      cursoId,
      utilizadorId,
      estado: overrides.estado || 'pendente',
    }).returning();

    return {
      id: enrollment.id,
      cursoId: enrollment.cursoId,
      utilizadorId: enrollment.utilizadorId,
      estado: enrollment.estado,
      dataInscricacao: enrollment.dataInscricao,
      dataAtualizacao: enrollment.dataAtualizacao ?? undefined,
    };
  }

  static async createTestSession(userId: number): Promise<string> {
    const token = randomUUID();
    await db.insert(session).values({
      id: randomUUID(),
      token,
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return token;
  }

  static async cleanDatabase(): Promise<void> {
    await cleanDatabase();
  }

  static getSqlInjectionPayloads(): string[] {
    return [
      "'; DROP TABLE utilizadores; --",
      "1' OR '1'='1",
      "1'; DELETE FROM cursos; --",
      "1' UNION SELECT * FROM session --",
      "' OR 1=1 --",
    ];
  }

  static getXssPayloads(): string[] {
    return [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '"><script>alert("XSS")</script>',
    ];
  }

  static getMaliciousFilePayloads(): MockFile[] {
    return [
      { name: 'virus.exe', content: Buffer.from('MZ\x90\x00\x03\x00\x00\x00'), mimeType: 'application/x-msdownload', size: 1024 },
      { name: 'shell.php', content: Buffer.from('<?php system($_GET["cmd"]); ?>'), mimeType: 'text/plain', size: 29 },
    ];
  }

  static getPathTraversalPayloads(): string[] {
    return [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
    ];
  }
}

// --- SecurityTestUtils ---

export class SecurityTestUtils {
  static async testSqlInjection(
    operation: (payload: string) => Promise<any>,
  ): Promise<void> {
    const payloads = TestUtils.getSqlInjectionPayloads();
    for (const payload of payloads) {
      try {
        await operation(payload);
      } catch (error: any) {
        expect(error.message).not.toContain('syntax error');
        expect(error.message).not.toContain('relation does not exist');
        expect(error.message).not.toContain('column does not exist');
      }
    }
  }

  static async testXssResistance(
    sanitizer: (input: string) => string,
  ): Promise<void> {
    const payloads = TestUtils.getXssPayloads();
    for (const payload of payloads) {
      const result = sanitizer(payload);
      expect(result.toLowerCase()).not.toContain('<script');
      expect(result.toLowerCase()).not.toContain('javascript:');
      expect(result.toLowerCase()).not.toContain('onerror=');
      expect(result.toLowerCase()).not.toContain('onload=');
    }
  }

  static async testAuthorizationBypass(
    authorizedOperation: () => Promise<any>,
    unauthorizedOperation: () => Promise<any>,
  ): Promise<void> {
    const authorizedResult = await authorizedOperation();
    expect(authorizedResult).toBeDefined();
    await expect(unauthorizedOperation()).rejects.toThrow();
  }
}

// --- PerformanceTestUtils ---

export class PerformanceTestUtils {
  static async testQueryPerformance(
    operation: () => Promise<any>,
    maxTimeMs: number,
  ): Promise<void> {
    const startTime = Date.now();
    const result = await operation();
    const executionTime = Date.now() - startTime;
    expect(executionTime).toBeLessThan(maxTimeMs);
    expect(result).toBeDefined();
  }

  static async testConcurrency(
    operation: () => Promise<any>,
    concurrentCount: number,
  ): Promise<void> {
    const promises = Array.from({ length: concurrentCount }, () => operation());
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    expect(successful / concurrentCount).toBeGreaterThan(0.8);
  }
}

// --- MockUtils ---

export class MockUtils {
  static mockEmailService() {
    return {
      sendEmail: async () => ({ success: true, messageId: faker.string.uuid() }),
      sendWelcomeEmail: async () => ({ success: true }),
      sendPasswordResetEmail: async () => ({ success: true }),
    };
  }

  static mockStorageService() {
    return {
      upload: async () => faker.internet.url(),
      delete: async () => ({ success: true }),
      getUrl: async () => faker.internet.url(),
    };
  }

  static mockRedisService() {
    const store = new Map();
    return {
      get: async (key: string) => store.get(key),
      set: async (key: string, value: any) => store.set(key, value),
      del: async (key: string) => store.delete(key),
      clear: async () => store.clear(),
    };
  }

  static createMockAuthRequest(user: Partial<TestUser> = {}): Partial<Request> {
    return {
      utilizador: {
        id: user.id ?? 1,
        nome: user.nome ?? 'Mock User',
        email: user.email ?? 'mock@test.com',
        avatar: null,
        ativo: user.ativo ?? true,
        tipoPerfil: user.tipoPerfil ?? 'formando',
        perfilId: 1,
      },
      headers: {
        authorization: 'Bearer mock-token',
        'content-type': 'application/json',
      },
      cookies: {},
      params: {},
      query: {},
      body: {},
    } as any;
  }

  static createMockResponse(): Response & { _status: number; _json: any; _sent: any } {
    const res: any = {
      _status: 200,
      _json: null,
      _sent: null,
    };

    res.status = mock((code: number) => { res._status = code; return res; });
    res.json = mock((data: any) => { res._json = data; return res; });
    res.send = mock((data: any) => { res._sent = data; return res; });
    res.sendStatus = mock((code: number) => { res._status = code; return res; });
    res.setHeader = mock((_name: string, _value: string) => res);
    res.header = mock((_name: string, _value: string) => res);

    return res;
  }

  static createMockNext(): NextFunction {
    return mock((() => {}) as any) as NextFunction;
  }
}

export { TestUtils as default };
