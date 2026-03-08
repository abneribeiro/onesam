import { describe, test, expect } from 'bun:test';
import { TestUtils, testData } from '../setup';
import { cursoService } from '../../services/cursoService';
import { inscricaoService } from '../../services/inscricaoService';
import { utilizadorService } from '../../services/utilizadorService';

describe('Integration: End-to-End Service Flows', () => {
  describe('Course Lifecycle', () => {
    test('full course lifecycle: create -> update -> state transitions -> delete', async () => {
      const course = await cursoService.criarCurso({
        nome: 'Integration Test Course',
        descricao: 'Course for integration testing',
        dataInicio: new Date(Date.now() + 86400000 * 2),
        dataFim: new Date(Date.now() + 86400000 * 60),
        IDArea: testData.area.id,
        IDCategoria: testData.categoria.id,
        nivel: 'intermedio',
        cargaHoraria: 40,
      });

      expect(course.estado).toBe('planeado');

      const updated = await cursoService.atualizarCurso(course.id, { nome: 'Updated Integration Course' });
      expect(updated.nome).toBe('Updated Integration Course');

      const emCurso = await cursoService.alterarEstado(course.id, 'em_curso');
      expect(emCurso.estado).toBe('em_curso');

      const terminado = await cursoService.alterarEstado(course.id, 'terminado');
      expect(terminado.estado).toBe('terminado');

      const arquivado = await cursoService.alterarEstado(course.id, 'arquivado');
      expect(arquivado.estado).toBe('arquivado');

      await cursoService.deletarCurso(course.id);

      await expect(cursoService.obterCurso(course.id)).rejects.toThrow('não encontrado');
    });
  });

  describe('Enrollment Lifecycle', () => {
    test('full enrollment flow: enroll -> approve -> verify', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      const inscricao = await inscricaoService.inscreverFormando(formando.id, course.id);
      expect(inscricao.estado).toBe('pendente');

      const aprovada = await inscricaoService.aprovarInscricao(inscricao.id);
      expect(aprovada.estado).toBe('aceite');

      const inscricoes = await inscricaoService.listarInscricoesPorCurso(course.id);
      expect(inscricoes.length).toBeGreaterThanOrEqual(1);
      expect(inscricoes.some(i => i.id === inscricao.id)).toBe(true);
    });

    test('enrollment rejection flow with motivo', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      const inscricao = await inscricaoService.inscreverFormando(formando.id, course.id);
      const rejeitada = await inscricaoService.rejeitarInscricao(inscricao.id, 'Vagas esgotadas');

      expect(rejeitada.estado).toBe('rejeitada');
    });

    test('enrollment cancellation flow', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      const inscricao = await inscricaoService.inscreverFormando(formando.id, course.id);
      await inscricaoService.cancelarInscricao(inscricao.id, formando.id);

      const minhasInscricoes = await inscricaoService.listarMinhasInscricoes(formando.id);
      const cancelled = minhasInscricoes.find(i => i.id === inscricao.id);
      expect(cancelled?.estado).toBe('cancelada');
    });
  });

  describe('User Lifecycle', () => {
    test('full user lifecycle: create -> update -> toggle -> delete', async () => {
      const admin = await TestUtils.createTestUser({ tipoPerfil: 'admin' });

      const user = await utilizadorService.criarUtilizador({
        nome: 'Integration User',
        email: 'integration@test.com',
        tipoPerfil: 'formando',
        ativo: true,
      });

      expect(user).toBeDefined();
      expect(user.nome).toBe('Integration User');

      const updated = await utilizadorService.atualizarUtilizador(user.id, { nome: 'Updated Integration User' });
      expect(updated?.nome).toBe('Updated Integration User');

      const toggled = await utilizadorService.toggleAtivo(user.id);
      expect(toggled.ativo).toBe(false);

      const result = await utilizadorService.deletarUtilizador(user.id, admin.id);
      expect(result.success).toBe(true);
    });

    test('admin updates user with role change', async () => {
      const user = await utilizadorService.criarUtilizador({
        nome: 'Role Change User',
        email: 'rolechange@test.com',
        tipoPerfil: 'formando',
      });

      const updated = await utilizadorService.atualizarUtilizadorAdmin(user.id, {
        tipoPerfil: 'admin',
        ativo: false,
      });

      expect(updated?.tipoPerfil).toBe('admin');
      expect(updated?.ativo).toBe(false);
    });
  });

  describe('Cross-Service Integration', () => {
    test('course deletion blocked by active enrollments', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      const inscricao = await inscricaoService.inscreverFormando(formando.id, course.id);
      await inscricaoService.aprovarInscricao(inscricao.id);

      await expect(cursoService.deletarCurso(course.id)).rejects.toThrow('inscrições ativas');
    });

    test('user can view own enrollments across courses', async () => {
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const course1 = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });
      const course2 = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      await inscricaoService.inscreverFormando(formando.id, course1.id);
      await inscricaoService.inscreverFormando(formando.id, course2.id);

      const minhas = await inscricaoService.listarMinhasInscricoes(formando.id);
      expect(minhas.length).toBeGreaterThanOrEqual(2);
    });

    test('paginated listing works with filters across services', async () => {
      const cursosResult = await cursoService.listarCursosPaginados(
        { page: 1, limit: 5 },
        { sortBy: 'dataCriacao', sortOrder: 'desc' }
      );

      expect(cursosResult.data).toBeDefined();
      expect(cursosResult.meta).toBeDefined();

      const inscricoesResult = await inscricaoService.listarTodasPaginadas(
        { page: 1, limit: 5 },
        { sortBy: 'dataInscricao', sortOrder: 'desc' }
      );

      expect(inscricoesResult.data).toBeDefined();
      expect(inscricoesResult.meta).toBeDefined();

      const utilizadoresResult = await utilizadorService.listarUtilizadores(
        { page: 1, limit: 5 },
        { sortBy: 'dataCriacao', sortOrder: 'desc' }
      );

      expect(utilizadoresResult).toBeDefined();
    });
  });
});
