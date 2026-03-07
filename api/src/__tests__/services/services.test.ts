import { describe, test, expect, beforeAll } from 'bun:test';
import { TestUtils, PerformanceTestUtils, testData } from '../setup';
import { cursoService } from '../../services/cursoService';
import { inscricaoService } from '../../services/inscricaoService';
import { utilizadorService } from '../../services/utilizadorService';
import { cursoRepository } from '../../repositories/cursoRepository';

describe('Service Layer: Critical Business Logic', () => {
  let testFormando: any;

  beforeAll(async () => {
    testFormando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
  });

  describe('Curso Service Business Logic', () => {
    test('should create course with valid data', async () => {
      const courseData = {
        nome: 'Advanced TypeScript',
        descricao: 'Learn advanced TypeScript concepts',
        dataInicio: new Date(Date.now() + 86400000),
        dataFim: new Date(Date.now() + 86400000 * 7),
        IDArea: testData.area.id,
        IDCategoria: testData.categoria.id,
        nivel: 'avancado' as const,
        cargaHoraria: 40,
      };

      const course = await cursoService.criarCurso(courseData);

      expect(course).toBeDefined();
      expect(course.nome).toBe(courseData.nome);
      expect(course.nivel).toBe('avancado');
      expect(course.estado).toBe('planeado');
      expect(course.visivel).toBe(true);
    });

    test('should validate course date logic', async () => {
      const invalidCourseData = {
        nome: 'Invalid Course',
        dataInicio: new Date(Date.now() + 86400000 * 7),
        dataFim: new Date(Date.now() + 86400000),
        IDArea: testData.area.id,
        IDCategoria: testData.categoria.id,
      };

      await expect(cursoService.criarCurso(invalidCourseData)).rejects.toThrow(
        'Data de início deve ser anterior à data de fim'
      );
    });

    test('should validate course state transitions', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'planeado' });

      const invalidTransitions = [
        { from: 'planeado', to: 'terminado' },
        { from: 'terminado', to: 'planeado' },
      ];

      for (const transition of invalidTransitions) {
        await expect(
          cursoService.alterarEstado(course.id, transition.to as any)
        ).rejects.toThrow('Transição de estado inválida');
      }
    });

    test('should prevent deletion of courses with active enrollments', async () => {
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, testFormando.id, {
        estado: 'aceite',
      });

      expect(enrollment.estado).toBe('aceite');

      await expect(cursoService.deletarCurso(course.id)).rejects.toThrow(
        'Não é possível excluir um curso com inscrições ativas ou pendentes'
      );
    });

    test('should handle course search and filtering', async () => {
      await Promise.all([
        TestUtils.createTestCourse({ nome: 'JavaScript Basics SL', nivel: 'iniciante' }),
        TestUtils.createTestCourse({ nome: 'Advanced JavaScript SL', nivel: 'avancado' }),
        TestUtils.createTestCourse({ nome: 'TypeScript Fundamentals SL', nivel: 'intermedio' }),
      ]);

      const searchResults = await cursoService.listarCursosPaginados(
        { page: 1, limit: 10 },
        undefined,
        { search: 'JavaScript SL' }
      );

      expect(searchResults.data.length).toBeGreaterThanOrEqual(1);
      expect(searchResults.meta.total).toBeGreaterThanOrEqual(1);

      const beginnerCourses = await cursoService.listarCursosPaginados(
        { page: 1, limit: 10 },
        undefined,
        { nivel: 'iniciante' }
      );

      expect(beginnerCourses.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Enrollment Service Business Logic', () => {
    test('should create enrollment successfully', async () => {
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });

      const enrollment = await inscricaoService.inscreverFormando(formando.id, course.id);

      expect(enrollment).toBeDefined();
      expect(enrollment.cursoId).toBe(course.id);
      expect(enrollment.utilizadorId).toBe(formando.id);
      expect(enrollment.estado).toBe('pendente');
    });

    test('should prevent duplicate enrollments', async () => {
      const course = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });

      await inscricaoService.inscreverFormando(formando.id, course.id);

      await expect(
        inscricaoService.inscreverFormando(formando.id, course.id)
      ).rejects.toThrow('já está inscrito');
    });

    test('should handle enrollment capacity limits', async () => {
      const course = await TestUtils.createTestCourse({
        limiteVagas: 2,
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() + 86400000 * 30),
      });

      const user1 = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const user2 = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      const user3 = await TestUtils.createTestUser({ tipoPerfil: 'formando' });

      await inscricaoService.inscreverFormando(user1.id, course.id);
      await inscricaoService.inscreverFormando(user2.id, course.id);

      const thirdEnrollment = await inscricaoService.inscreverFormando(user3.id, course.id);
      expect(thirdEnrollment.estado).toBe('pendente');
    });

    test('should handle enrollment deadline validation', async () => {
      const expiredCourse = await TestUtils.createTestCourse({
        estado: 'em_curso',
        visivel: true,
        dataLimiteInscricao: new Date(Date.now() - 86400000),
      });
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });

      await expect(
        inscricaoService.inscreverFormando(formando.id, expiredCourse.id)
      ).rejects.toThrow('período de inscrição');
    });

    test('should update enrollment status correctly', async () => {
      const course = await TestUtils.createTestCourse();
      const enrollment = await TestUtils.createTestEnrollment(course.id, testFormando.id);

      expect(enrollment.estado).toBe('pendente');

      const updatedEnrollment = await inscricaoService.aprovarInscricao(enrollment.id);

      expect(updatedEnrollment.estado).toBe('aceite');
      expect(updatedEnrollment.dataAtualizacao).toBeDefined();
    });
  });

  describe('User Service Business Logic', () => {
    test('should create user with proper profile setup', async () => {
      const userData = {
        nome: 'New User SL',
        email: `newuser-sl-${Date.now()}@example.com`,
        tipoPerfil: 'formando' as const,
      };

      const user = await utilizadorService.criarUtilizador(userData);

      expect(user).toBeDefined();
      expect(user.nome).toBe(userData.nome);
      expect(user.email).toBe(userData.email);
      expect(user.tipoPerfil).toBe('formando');
      expect(user.ativo).toBe(true);
    });

    test('should prevent duplicate email registration', async () => {
      const email = `dup-sl-${Date.now()}@example.com`;
      await utilizadorService.criarUtilizador({
        nome: 'User One',
        email,
        tipoPerfil: 'formando' as const,
      });

      await expect(utilizadorService.criarUtilizador({
        nome: 'User Two',
        email,
        tipoPerfil: 'formando' as const,
      })).rejects.toThrow('Email já está em uso');
    });

    test('should handle user profile updates', async () => {
      const user = await TestUtils.createTestUser();
      const updatedUser = await utilizadorService.atualizarUtilizador(user.id, {
        nome: 'Updated Name SL',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.nome).toBe('Updated Name SL');
      expect(updatedUser!.dataAtualizacao).toBeDefined();
    });

    test('should toggle user active status', async () => {
      const user = await TestUtils.createTestUser({ ativo: true });

      const deactivatedUser = await utilizadorService.toggleAtivo(user.id);
      expect(deactivatedUser.ativo).toBe(false);

      const reactivatedUser = await utilizadorService.toggleAtivo(user.id);
      expect(reactivatedUser.ativo).toBe(true);
    });
  });

  describe('Performance Testing', () => {
    test('should handle course listing efficiently', async () => {
      await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          TestUtils.createTestCourse({
            nome: `Perf Test Course SL ${i + 1}`,
            nivel: i % 3 === 0 ? 'iniciante' : i % 3 === 1 ? 'intermedio' : 'avancado',
          })
        )
      );

      await PerformanceTestUtils.testQueryPerformance(async () => {
        return await cursoService.listarCursosPaginados(
          { page: 1, limit: 10 },
          { sortBy: 'dataCriacao', sortOrder: 'desc' }
        );
      }, 500);
    });

    test('should handle bulk operations efficiently', async () => {
      const courses = await Promise.all(
        Array.from({ length: 10 }, () => TestUtils.createTestCourse())
      );

      const courseIds = courses.map(course => course.id);

      await PerformanceTestUtils.testQueryPerformance(async () => {
        return await cursoRepository.deleteMany(courseIds);
      }, 1000);
    });

    test('should handle complex queries with joins efficiently', async () => {
      const course = await TestUtils.createTestCourse();
      const users = await Promise.all([
        TestUtils.createTestUser({ tipoPerfil: 'formando' }),
        TestUtils.createTestUser({ tipoPerfil: 'formando' }),
        TestUtils.createTestUser({ tipoPerfil: 'formando' }),
      ]);

      await Promise.all(
        users.map(user =>
          TestUtils.createTestEnrollment(course.id, user.id, { estado: 'aceite' })
        )
      );

      await PerformanceTestUtils.testQueryPerformance(async () => {
        return await inscricaoService.listarTodasPaginadas(
          { page: 1, limit: 10 },
          { sortBy: 'dataInscricao', sortOrder: 'desc' },
          { search: 'test' }
        );
      }, 800);
    });
  });
});
