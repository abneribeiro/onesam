import { describe, test, expect, beforeEach } from 'bun:test';
import { TestUtils, testData } from '../setup';
import { cursoService } from '../../services/cursoService';
import { cursoRepository } from '../../repositories/cursoRepository';

describe('CursoService', () => {
  describe('criarCurso', () => {
    test('creates course with valid data', async () => {
      const data = {
        nome: 'TypeScript Avancado',
        descricao: 'Curso avancado de TypeScript',
        dataInicio: new Date(Date.now() + 86400000 * 2),
        dataFim: new Date(Date.now() + 86400000 * 30),
        IDArea: testData.area.id,
        IDCategoria: testData.categoria.id,
        nivel: 'avancado' as const,
        cargaHoraria: 60,
      };

      const curso = await cursoService.criarCurso(data);

      expect(curso).toBeDefined();
      expect(curso.nome).toBe(data.nome);
      expect(curso.estado).toBe('planeado');
      expect(curso.visivel).toBe(true);
      expect(curso.nivel).toBe('avancado');
      expect(curso.areaId).toBe(testData.area.id);
      expect(curso.categoriaId).toBe(testData.categoria.id);
    });

    test('creates course with default nivel', async () => {
      const data = {
        nome: 'Curso Default Nivel',
        dataInicio: new Date(Date.now() + 86400000 * 2),
        dataFim: new Date(Date.now() + 86400000 * 30),
        IDArea: testData.area.id,
        IDCategoria: testData.categoria.id,
      };

      const curso = await cursoService.criarCurso(data);
      expect(curso.nivel).toBe('iniciante');
    });

    test('rejects when start date >= end date', async () => {
      const data = {
        nome: 'Invalid Dates',
        dataInicio: new Date(Date.now() + 86400000 * 30),
        dataFim: new Date(Date.now() + 86400000 * 2),
        IDArea: testData.area.id,
        IDCategoria: testData.categoria.id,
      };

      await expect(cursoService.criarCurso(data)).rejects.toThrow(
        'Data de início deve ser anterior à data de fim'
      );
    });

    test('rejects missing required fields', async () => {
      const data = {
        nome: 'Missing Fields',
        dataInicio: new Date(Date.now() + 86400000),
        dataFim: new Date(Date.now() + 86400000 * 30),
        IDArea: testData.area.id,
      } as any;

      await expect(cursoService.criarCurso(data)).rejects.toThrow('Campos obrigatórios faltando');
    });

    test('rejects invalid area', async () => {
      const data = {
        nome: 'Invalid Area',
        dataInicio: new Date(Date.now() + 86400000),
        dataFim: new Date(Date.now() + 86400000 * 30),
        IDArea: 99999,
        IDCategoria: testData.categoria.id,
      };

      await expect(cursoService.criarCurso(data)).rejects.toThrow('Área não encontrada');
    });

    test('rejects invalid categoria', async () => {
      const data = {
        nome: 'Invalid Categoria',
        dataInicio: new Date(Date.now() + 86400000),
        dataFim: new Date(Date.now() + 86400000 * 30),
        IDArea: testData.area.id,
        IDCategoria: 99999,
      };

      await expect(cursoService.criarCurso(data)).rejects.toThrow('Categoria não encontrada');
    });

    test('rejects dataLimiteInscricao after dataInicio', async () => {
      const dataInicio = new Date(Date.now() + 86400000 * 5);
      const data = {
        nome: 'Invalid Deadline',
        dataInicio,
        dataFim: new Date(Date.now() + 86400000 * 30),
        dataLimiteInscricao: new Date(dataInicio.getTime() + 86400000),
        IDArea: testData.area.id,
        IDCategoria: testData.categoria.id,
      };

      await expect(cursoService.criarCurso(data)).rejects.toThrow(
        'Data limite de inscrição deve ser anterior à data de início'
      );
    });

    test('creates course with limiteVagas', async () => {
      const data = {
        nome: 'Limited Course',
        dataInicio: new Date(Date.now() + 86400000 * 2),
        dataFim: new Date(Date.now() + 86400000 * 30),
        IDArea: testData.area.id,
        IDCategoria: testData.categoria.id,
        limiteVagas: 25,
      };

      const curso = await cursoService.criarCurso(data);
      expect(curso.limiteVagas).toBe(25);
    });
  });

  describe('obterCurso', () => {
    test('returns course with relations', async () => {
      const curso = await cursoService.obterCurso(testData.curso.id);

      expect(curso).toBeDefined();
      expect(curso.id).toBe(testData.curso.id);
      expect(curso.nome).toBe(testData.curso.nome);
    });

    test('throws when course not found', async () => {
      await expect(cursoService.obterCurso(99999)).rejects.toThrow('Curso não encontrado');
    });
  });

  describe('atualizarCurso', () => {
    test('updates course data', async () => {
      const course = await TestUtils.createTestCourse();
      const updated = await cursoService.atualizarCurso(course.id, { nome: 'Updated Course Name' });

      expect(updated.nome).toBe('Updated Course Name');
    });

    test('throws when course not found', async () => {
      await expect(
        cursoService.atualizarCurso(99999, { nome: 'Nonexistent' })
      ).rejects.toThrow('Curso não encontrado');
    });

    test('validates state transition on update', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'planeado' });

      await expect(
        cursoService.atualizarCurso(course.id, { estado: 'terminado' })
      ).rejects.toThrow('Transição de estado inválida');
    });
  });

  describe('buildUpdateData', () => {
    test('maps all fields correctly', () => {
      const input = {
        nome: 'Test',
        descricao: 'Desc',
        dataInicio: '2025-06-01',
        dataFim: '2025-07-01',
        dataLimiteInscricao: '2025-05-25',
        IDArea: 2,
        IDCategoria: 3,
        visivel: false,
        estado: 'em_curso' as const,
        nivel: 'avancado',
        limiteVagas: 50,
        cargaHoraria: 80,
        imagemCurso: 'https://img.com/photo.jpg',
      };

      const result = cursoService.buildUpdateData(input);

      expect(result.nome).toBe('Test');
      expect(result.descricao).toBe('Desc');
      expect(result.dataInicio).toBeInstanceOf(Date);
      expect(result.dataFim).toBeInstanceOf(Date);
      expect(result.dataLimiteInscricao).toBeInstanceOf(Date);
      expect(result.areaId).toBe(2);
      expect(result.categoriaId).toBe(3);
      expect(result.visivel).toBe(false);
      expect(result.estado).toBe('em_curso');
      expect(result.nivel).toBe('avancado');
      expect(result.limiteVagas).toBe(50);
      expect(result.cargaHoraria).toBe(80);
      expect(result.imagemCurso).toBe('https://img.com/photo.jpg');
    });

    test('returns empty object for empty input', () => {
      const result = cursoService.buildUpdateData({});
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('alterarEstado', () => {
    test('valid transition: planeado -> em_curso', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'planeado' });
      const updated = await cursoService.alterarEstado(course.id, 'em_curso');

      expect(updated.estado).toBe('em_curso');
    });

    test('valid transition: planeado -> arquivado', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'planeado' });
      const updated = await cursoService.alterarEstado(course.id, 'arquivado');

      expect(updated.estado).toBe('arquivado');
    });

    test('valid transition: em_curso -> terminado', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'em_curso' });
      const updated = await cursoService.alterarEstado(course.id, 'terminado');

      expect(updated.estado).toBe('terminado');
    });

    test('valid transition: terminado -> arquivado', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'terminado' });
      const updated = await cursoService.alterarEstado(course.id, 'arquivado');

      expect(updated.estado).toBe('arquivado');
    });

    test('valid transition: arquivado -> planeado', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'arquivado' });
      const updated = await cursoService.alterarEstado(course.id, 'planeado');

      expect(updated.estado).toBe('planeado');
    });

    test('rejects invalid transition: planeado -> terminado', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'planeado' });

      await expect(
        cursoService.alterarEstado(course.id, 'terminado')
      ).rejects.toThrow('Transição de estado inválida');
    });

    test('rejects invalid transition: terminado -> planeado', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'terminado' });

      await expect(
        cursoService.alterarEstado(course.id, 'planeado')
      ).rejects.toThrow('Transição de estado inválida');
    });

    test('rejects invalid estado string', async () => {
      const course = await TestUtils.createTestCourse({ estado: 'planeado' });

      await expect(
        cursoService.alterarEstado(course.id, 'invalid_state' as any)
      ).rejects.toThrow('Estado inválido');
    });

    test('throws when course not found', async () => {
      await expect(
        cursoService.alterarEstado(99999, 'em_curso')
      ).rejects.toThrow('Curso não encontrado');
    });
  });

  describe('deletarCurso', () => {
    test('deletes course without enrollments', async () => {
      const course = await TestUtils.createTestCourse();
      await expect(cursoService.deletarCurso(course.id)).resolves.toBeUndefined();
    });

    test('throws when course has active enrollments', async () => {
      const course = await TestUtils.createTestCourse();
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      await TestUtils.createTestEnrollment(course.id, formando.id, { estado: 'aceite' });

      await expect(cursoService.deletarCurso(course.id)).rejects.toThrow(
        'Não é possível excluir um curso com inscrições ativas ou pendentes'
      );
    });

    test('throws when course has pending enrollments', async () => {
      const course = await TestUtils.createTestCourse();
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      await TestUtils.createTestEnrollment(course.id, formando.id, { estado: 'pendente' });

      await expect(cursoService.deletarCurso(course.id)).rejects.toThrow(
        'Não é possível excluir um curso com inscrições ativas ou pendentes'
      );
    });

    test('allows deletion with only cancelled enrollments', async () => {
      const course = await TestUtils.createTestCourse();
      const formando = await TestUtils.createTestUser({ tipoPerfil: 'formando' });
      await TestUtils.createTestEnrollment(course.id, formando.id, { estado: 'cancelada' });

      await expect(cursoService.deletarCurso(course.id)).resolves.toBeUndefined();
    });

    test('throws when course not found', async () => {
      await expect(cursoService.deletarCurso(99999)).rejects.toThrow('Curso não encontrado');
    });
  });

  describe('listarCursos', () => {
    test('returns all courses', async () => {
      const courses = await cursoService.listarCursos();
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('listarCursosPaginados', () => {
    test('returns paginated result', async () => {
      const result = await cursoService.listarCursosPaginados({ page: 1, limit: 5 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(5);
    });

    test('filters by search term', async () => {
      await TestUtils.createTestCourse({ nome: 'UniqueSearchName123' });

      const result = await cursoService.listarCursosPaginados(
        { page: 1, limit: 10 },
        undefined,
        { search: 'UniqueSearchName123' }
      );

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.data[0].nome).toContain('UniqueSearchName123');
    });

    test('filters by nivel', async () => {
      await TestUtils.createTestCourse({ nivel: 'avancado', nome: 'Avancado Filter Test' });

      const result = await cursoService.listarCursosPaginados(
        { page: 1, limit: 100 },
        undefined,
        { nivel: 'avancado' }
      );

      expect(result.data.every(c => c.nivel === 'avancado')).toBe(true);
    });

    test('sorts by field', async () => {
      const result = await cursoService.listarCursosPaginados(
        { page: 1, limit: 10 },
        { sortBy: 'nome', sortOrder: 'asc' }
      );

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
