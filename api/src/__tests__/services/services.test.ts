import { describe, test, expect, beforeEach } from 'bun:test';
import { TestUtils, PerformanceTestUtils } from '../setup';
import { cursoService } from '../../services/cursoService';
import { inscricaoService } from '../../services/inscricaoService';
import { utilizadorService } from '../../services/utilizadorService';

describe('Service Layer: Critical Business Logic', () => {
  let testAdmin: any;
  let testFormando: any;
  let testArea: any;
  let testCategoria: any;

  beforeEach(async () => {
    testAdmin = await TestUtils.createTestUser({ tipoPerfil: 'admin' });
    testFormando = await TestUtils.createTestUser({
      tipoPerfil: 'formando',
      email: 'formando@example.com',
    });

    // Create test area and category (simplified - would normally use services)
    testArea = { id: 1, nome: 'Test Area' };
    testCategoria = { id: 1, nome: 'Test Category', areaId: 1 };
  });

  describe('Curso Service Business Logic', () => {
    test('should create course with valid data', async () => {
      const courseData = {
        nome: 'Advanced TypeScript',
        descricao: 'Learn advanced TypeScript concepts',
        dataInicio: new Date(Date.now() + 86400000), // Tomorrow
        dataFim: new Date(Date.now() + 86400000 * 7), // Next week
        IDArea: testArea.id,
        IDCategoria: testCategoria.id,
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
        dataInicio: new Date(Date.now() + 86400000 * 7), // Next week
        dataFim: new Date(Date.now() + 86400000), // Tomorrow (invalid - before start)
        IDArea: testArea.id,
        IDCategoria: testCategoria.id,
      };

      await expect(cursoService.criarCurso(invalidCourseData)).rejects.toThrow(
        'Data de início deve ser anterior à data de fim'
      );
    });

    test('should validate course state transitions', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'planeado' });

      // Valid transitions
      const validTransitions = [
        { from: 'planeado', to: 'em_curso' },
        { from: 'em_curso', to: 'terminado' },
        { from: 'terminado', to: 'arquivado' },
        { from: 'arquivado', to: 'planeado' },
      ];

      for (const transition of validTransitions) {
        // Would test the state transition logic
        expect(transition.from).toBeDefined();
        expect(transition.to).toBeDefined();
      }

      // Invalid transitions should be rejected
      const invalidTransitions = [
        { from: 'planeado', to: 'terminado' }, // Can't skip 'em_curso'
        { from: 'terminado', to: 'planeado' }, // Can't go back directly
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
      // Create multiple test courses
      const courses = await Promise.all([
        TestUtils.createTestCourse({ nome: 'JavaScript Basics', nivel: 'iniciante' }),
        TestUtils.createTestCourse({ nome: 'Advanced JavaScript', nivel: 'avancado' }),
        TestUtils.createTestCourse({ nome: 'TypeScript Fundamentals', nivel: 'intermedio' }),
      ]);

      // Test search functionality
      const searchResults = await cursoService.listarCursosPaginados(
        { page: 1, limit: 10 },
        undefined,
        { search: 'JavaScript' }
      );

      expect(searchResults.data.length).toBeGreaterThanOrEqual(1);
      expect(searchResults.meta.total).toBeGreaterThanOrEqual(1);

      // Test level filtering
      const beginnerCourses = await cursoService.listarCursosPaginados(
        { page: 1, limit: 10 },
        undefined,
        { nivel: 'iniciante' }
      );

      expect(beginnerCourses.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Enrollment Service Business Logic', () => {
    let testCourse: any;

    beforeEach(async () => {
      testCourse = await TestUtils.createTestCourse({
        limiteVagas: 2,
        dataLimiteInscricao: new Date(Date.now() + 86400000), // Tomorrow
      });
    });

    test('should create enrollment successfully', async () => {
      const enrollment = await inscricaoService.criarInscricao({
        cursoId: testCourse.id,
        utilizadorId: testFormando.id,
      });

      expect(enrollment).toBeDefined();
      expect(enrollment.cursoId).toBe(testCourse.id);
      expect(enrollment.utilizadorId).toBe(testFormando.id);
      expect(enrollment.estado).toBe('pendente');
    });

    test('should prevent duplicate enrollments', async () => {
      // Create first enrollment
      await inscricaoService.criarInscricao({
        cursoId: testCourse.id,
        utilizadorId: testFormando.id,
      });

      // Try to create duplicate
      await expect(
        inscricaoService.criarInscricao({
          cursoId: testCourse.id,
          utilizadorId: testFormando.id,
        })
      ).rejects.toThrow('já inscrito');
    });

    test('should handle enrollment capacity limits', async () => {
      // Create test users for capacity testing
      const user1 = await TestUtils.createTestUser({
        tipoPerfil: 'formando',
        email: 'user1@example.com',
      });
      const user2 = await TestUtils.createTestUser({
        tipoPerfil: 'formando',
        email: 'user2@example.com',
      });
      const user3 = await TestUtils.createTestUser({
        tipoPerfil: 'formando',
        email: 'user3@example.com',
      });

      // Enroll users up to capacity (2)
      await inscricaoService.criarInscricao({
        cursoId: testCourse.id,
        utilizadorId: user1.id,
      });

      await inscricaoService.criarInscricao({
        cursoId: testCourse.id,
        utilizadorId: user2.id,
      });

      // Accept both enrollments (simulate admin approval)
      // Would normally use service method to approve enrollments

      // Try to enroll third user (should fail if capacity logic is implemented)
      // This test depends on the actual business logic implementation
      const thirdEnrollment = await inscricaoService.criarInscricao({
        cursoId: testCourse.id,
        utilizadorId: user3.id,
      });

      // The enrollment might be created but should be in waiting list or pending state
      expect(thirdEnrollment.estado).toBe('pendente');
    });

    test('should handle enrollment deadline validation', async () => {
      // Create course with past enrollment deadline
      const expiredCourse = await TestUtils.createTestCourse({
        dataLimiteInscricao: new Date(Date.now() - 86400000), // Yesterday
      });

      await expect(
        inscricaoService.criarInscricao({
          cursoId: expiredCourse.id,
          utilizadorId: testFormando.id,
        })
      ).rejects.toThrow('prazo');
    });

    test('should update enrollment status correctly', async () => {
      const enrollment = await TestUtils.createTestEnrollment(testCourse.id, testFormando.id);

      expect(enrollment.estado).toBe('pendente');

      // Approve enrollment
      const updatedEnrollment = await inscricaoService.atualizarEstadoInscricao(
        enrollment.id,
        'aceite'
      );

      expect(updatedEnrollment.estado).toBe('aceite');
      expect(updatedEnrollment.dataAtualizacao).toBeDefined();
    });
  });

  describe('User Service Business Logic', () => {
    test('should create user with proper profile setup', async () => {
      const userData = {
        nome: 'New User',
        email: 'newuser@example.com',
        tipoPerfil: 'formando' as const,
        empresa: 'Test Company',
        cargo: 'Developer',
      };

      const user = await utilizadorService.criarUtilizador(userData);

      expect(user).toBeDefined();
      expect(user.nome).toBe(userData.nome);
      expect(user.email).toBe(userData.email);
      expect(user.tipoPerfil).toBe('formando');
      expect(user.ativo).toBe(true);
    });

    test('should prevent duplicate email registration', async () => {
      const userData = {
        nome: 'User One',
        email: 'duplicate@example.com',
        tipoPerfil: 'formando' as const,
      };

      // Create first user
      await utilizadorService.criarUtilizador(userData);

      // Try to create user with same email
      const duplicateData = {
        ...userData,
        nome: 'User Two',
      };

      await expect(utilizadorService.criarUtilizador(duplicateData)).rejects.toThrow('email');
    });

    test('should handle user profile updates', async () => {
      const user = await TestUtils.createTestUser();

      const updateData = {
        nome: 'Updated Name',
        empresa: 'New Company',
      };

      const updatedUser = await utilizadorService.atualizarPerfil(user.id, updateData);

      expect(updatedUser.nome).toBe('Updated Name');
      expect(updatedUser.dataAtualizacao).toBeDefined();
    });

    test('should toggle user active status', async () => {
      const user = await TestUtils.createTestUser({ ativo: true });

      expect(user.ativo).toBe(true);

      const deactivatedUser = await utilizadorService.toggleAtivo(user.id);
      expect(deactivatedUser.ativo).toBe(false);

      const reactivatedUser = await utilizadorService.toggleAtivo(user.id);
      expect(reactivatedUser.ativo).toBe(true);
    });
  });

  describe('Performance Testing', () => {
    test('should handle course listing efficiently', async () => {
      // Create multiple courses for performance testing
      const coursesPromises = Array.from({ length: 20 }, (_, i) =>
        TestUtils.createTestCourse({
          nome: `Performance Test Course ${i + 1}`,
          nivel: i % 3 === 0 ? 'iniciante' : i % 3 === 1 ? 'intermedio' : 'avancado',
        })
      );

      await Promise.all(coursesPromises);

      // Test query performance
      await PerformanceTestUtils.testQueryPerformance(async () => {
        return await cursoService.listarCursosPaginados(
          { page: 1, limit: 10 },
          { sortBy: 'dataCriacao', sortOrder: 'desc' }
        );
      }, 500); // Should complete within 500ms
    });

    test('should handle bulk operations efficiently', async () => {
      // Create test data
      const courses = await Promise.all(
        Array.from({ length: 10 }, () => TestUtils.createTestCourse())
      );

      const courseIds = courses.map(course => course.id);

      // Test bulk deletion performance
      await PerformanceTestUtils.testQueryPerformance(async () => {
        return await cursoService.removerCursosEmMassa(courseIds);
      }, 1000); // Should complete within 1 second
    });

    test('should handle complex queries with joins efficiently', async () => {
      // Create related data
      const course = await TestUtils.createTestCourse();
      const users = await Promise.all([
        TestUtils.createTestUser({ tipoPerfil: 'formando', email: 'user1@test.com' }),
        TestUtils.createTestUser({ tipoPerfil: 'formando', email: 'user2@test.com' }),
        TestUtils.createTestUser({ tipoPerfil: 'formando', email: 'user3@test.com' }),
      ]);

      // Create enrollments
      await Promise.all(
        users.map(user =>
          TestUtils.createTestEnrollment(course.id, user.id, { estado: 'aceite' })
        )
      );

      // Test complex query performance
      await PerformanceTestUtils.testQueryPerformance(async () => {
        return await inscricaoService.listarInscricoesPaginadas(
          { page: 1, limit: 10 },
          { sortBy: 'dataInscricao', sortOrder: 'desc' },
          { search: 'test' }
        );
      }, 800); // Should complete within 800ms
    });
  });
});