import { describe, test, expect } from 'bun:test';
import { TestUtils } from '../setup';
import { inscricaoService } from '../../services/inscricaoService';

describe('InscricaoService', () => {
  describe('inscreverFormando', () => {
    test('creates enrollment with pending status', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      const inscricao = await inscricaoService.inscreverFormando(formando.id, course.id);

      expect(inscricao).toBeDefined();
      expect(inscricao.cursoId).toBe(course.id);
      expect(inscricao.utilizadorId).toBe(formando.id);
      expect(inscricao.estado).toBe('pendente');
    });

    test('rejects non-formando user', async () => {
      const admin = await TestUtils.createTestUser({ tipoPerfil: 'admin' });
      const course = await TestUtils.createTestCourse({ estado: 'em_curso', visivel: true });

      await expect(
        inscricaoService.inscreverFormando(admin.id, course.id)
      ).rejects.toThrow('Apenas formandos podem se inscrever');
    });

    test('rejects invisible course', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({ visivel: false });

      await expect(
        inscricaoService.inscreverFormando(formando.id, course.id)
      ).rejects.toThrow('não encontrado ou não disponível');
    });

    test('rejects terminated course', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({ estado: 'terminado', visivel: true });

      await expect(
        inscricaoService.inscreverFormando(formando.id, course.id)
      ).rejects.toThrow('não está disponível para inscrição');
    });

    test('rejects archived course', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({ estado: 'arquivado', visivel: true });

      await expect(
        inscricaoService.inscreverFormando(formando.id, course.id)
      ).rejects.toThrow('não está disponível para inscrição');
    });

    test('rejects expired enrollment deadline', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() - 86400000),
      });

      await expect(
        inscricaoService.inscreverFormando(formando.id, course.id)
      ).rejects.toThrow('período de inscrição');
    });

    test('rejects duplicate enrollment', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      await inscricaoService.inscreverFormando(formando.id, course.id);

      await expect(
        inscricaoService.inscreverFormando(formando.id, course.id)
      ).rejects.toThrow('já está inscrito');
    });

    test('allows re-enrollment after cancellation', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      const first = await inscricaoService.inscreverFormando(formando.id, course.id);
      await inscricaoService.cancelarInscricao(first.id, formando.id);

      const second = await inscricaoService.inscreverFormando(formando.id, course.id);
      expect(second.estado).toBe('pendente');
    });

    test('rejects when capacity limit reached (accepted enrollments)', async () => {
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        limiteVagas: 1,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      const user1 = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const user2 = await TestUtils.createTestUser({ tipoPerfil: 'formando' });

      await TestUtils.createTestEnrollment(course.id, user1.id, { estado: 'aceite' });

      await expect(
        inscricaoService.inscreverFormando(user2.id, course.id)
      ).rejects.toThrow('vagas disponíveis');
    });
  });

  describe('aprovarInscricao', () => {
    test('approves pending enrollment', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, formando.id, { estado: 'pendente' });

      const result = await inscricaoService.aprovarInscricao(enrollment.id);

      expect(result.estado).toBe('aceite');
      expect(result.dataAtualizacao).toBeDefined();
    });

    test('throws when enrollment not found', async () => {
      await expect(inscricaoService.aprovarInscricao(99999)).rejects.toThrow('não encontrada');
    });

    test('throws when enrollment not pending', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, formando.id, { estado: 'aceite' });

      await expect(inscricaoService.aprovarInscricao(enrollment.id)).rejects.toThrow('pendentes');
    });
  });

  describe('rejeitarInscricao', () => {
    test('rejects pending enrollment without motivo', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, formando.id);

      const result = await inscricaoService.rejeitarInscricao(enrollment.id);

      expect(result.estado).toBe('rejeitada');
    });

    test('rejects pending enrollment with motivo', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, formando.id);

      const result = await inscricaoService.rejeitarInscricao(enrollment.id, 'Requisitos não atendidos');

      expect(result.estado).toBe('rejeitada');
    });

    test('throws when enrollment not found', async () => {
      await expect(inscricaoService.rejeitarInscricao(99999)).rejects.toThrow('não encontrada');
    });

    test('throws when enrollment not pending', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, formando.id, { estado: 'aceite' });

      await expect(inscricaoService.rejeitarInscricao(enrollment.id)).rejects.toThrow('pendentes');
    });
  });

  describe('cancelarInscricao', () => {
    test('cancels enrollment by owner', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, formando.id);

      await expect(
        inscricaoService.cancelarInscricao(enrollment.id, formando.id)
      ).resolves.toBeUndefined();
    });

    test('throws when enrollment not found', async () => {
      await expect(
        inscricaoService.cancelarInscricao(99999, 1)
      ).rejects.toThrow('não encontrada');
    });

    test('throws when user is not the owner', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, formando.id);

      await expect(
        inscricaoService.cancelarInscricao(enrollment.id, formando.id + 100)
      ).rejects.toThrow('permissão');
    });

    test('throws when already cancelled', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, formando.id, { estado: 'cancelada' });

      await expect(
        inscricaoService.cancelarInscricao(enrollment.id, formando.id)
      ).rejects.toThrow('já foi cancelada');
    });
  });

  describe('listarInscricoesPorCurso', () => {
    test('returns enrollments for a course', async () => {
      const course = await TestUtils.createTestCourse();
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      await TestUtils.createTestEnrollment(course.id, formando.id);

      const result = await inscricaoService.listarInscricoesPorCurso(course.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].cursoId).toBe(course.id);
    });
  });

  describe('listarInscricoesFormando', () => {
    test('returns enrollments for formando user', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      await TestUtils.createTestEnrollment(course.id, formando.id);

      const result = await inscricaoService.listarInscricoesFormando(formando.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    test('throws for non-formando user', async () => {
      const admin = await TestUtils.createTestUser({ tipoPerfil: 'admin' });

      await expect(
        inscricaoService.listarInscricoesFormando(admin.id)
      ).rejects.toThrow('Apenas formandos');
    });
  });

  describe('listarMinhasInscricoes', () => {
    test('returns user enrollments', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      await TestUtils.createTestEnrollment(course.id, formando.id);

      const result = await inscricaoService.listarMinhasInscricoes(formando.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('listarTodas', () => {
    test('returns all enrollments', async () => {
      const result = await inscricaoService.listarTodas();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('listarTodasPaginadas', () => {
    test('returns paginated result', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      await TestUtils.createTestEnrollment(course.id, formando.id);

      const result = await inscricaoService.listarTodasPaginadas(
        { page: 1, limit: 10 }
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.page).toBe(1);
    });

    test('filters by estado', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse();
      await TestUtils.createTestEnrollment(course.id, formando.id, { estado: 'pendente' });

      const result = await inscricaoService.listarTodasPaginadas(
        { page: 1, limit: 100 },
        undefined,
        { estado: 'pendente' }
      );

      expect(result.data.every(i => i.estado === 'pendente')).toBe(true);
    });

    test('filters by search term', async () => {
      const formando = await TestUtils.createTestUser({
        tipoPerfil: 'formando',
        nome: 'UniqueSearchFormando999',
      });
      const course = await TestUtils.createTestCourse();
      await TestUtils.createTestEnrollment(course.id, formando.id);

      const result = await inscricaoService.listarTodasPaginadas(
        { page: 1, limit: 100 },
        undefined,
        { search: 'UniqueSearchFormando999' }
      );

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
