import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { MockUtils } from '../setup';

const mockCursoService = {
  criarCurso: mock(() => Promise.resolve({ id: 1, nome: 'Course', estado: 'planeado', visivel: true })),
  listarCursosPaginados: mock(() => Promise.resolve({ data: [{ id: 1 }], meta: { page: 1, limit: 50, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } })),
  obterCurso: mock(() => Promise.resolve({ id: 1, nome: 'Course', estado: 'planeado' })),
  atualizarCurso: mock(() => Promise.resolve({ id: 1, nome: 'Updated', estado: 'planeado' })),
  buildUpdateData: mock(() => ({ nome: 'Updated' })),
  deletarCurso: mock(() => Promise.resolve()),
  alterarEstado: mock(() => Promise.resolve({ id: 1, nome: 'Course', estado: 'em_curso' })),
};

const mockCursoRepository = {
  update: mock(() => Promise.resolve({ id: 1, nome: 'Course', imagemCurso: 'https://example.com/img.jpg' })),
  findById: mock(() => Promise.resolve({ id: 1, nome: 'Course', imagemCurso: null })),
  deleteMany: mock(() => Promise.resolve(3)),
};

const mockUploadCourseImage = mock(() => Promise.resolve('https://example.com/img.jpg'));
const mockDeleteOldCourseImage = mock(() => Promise.resolve());

mock.module('../../services/cursoService', () => ({
  cursoService: mockCursoService,
  CursoService: class {},
}));

mock.module('../../repositories/cursoRepository', () => ({
  cursoRepository: mockCursoRepository,
  CursoRepository: class {},
}));

mock.module('../../services/supabaseStorageService', () => ({
  supabaseStorageService: {
    uploadCourseImage: mockUploadCourseImage,
    deleteOldCourseImage: mockDeleteOldCourseImage,
  },
  SupabaseStorageService: class {
    uploadCourseImage = mockUploadCourseImage;
    deleteOldCourseImage = mockDeleteOldCourseImage;
  },
}));

const {
  criarCurso,
  listarCursos,
  obterCurso,
  atualizarCurso,
  deletarCurso,
  alterarEstado,
  deletarCursosEmMassa,
} = await import('../../controllers/cursoController');

describe('CursoController', () => {
  beforeEach(() => {
    mockCursoService.criarCurso.mockReset();
    mockCursoService.criarCurso.mockImplementation(() => Promise.resolve({ id: 1, nome: 'Course', estado: 'planeado', visivel: true }));
    mockCursoService.listarCursosPaginados.mockReset();
    mockCursoService.listarCursosPaginados.mockImplementation(() => Promise.resolve({ data: [{ id: 1 }], meta: { page: 1, limit: 50, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }));
    mockCursoService.obterCurso.mockReset();
    mockCursoService.obterCurso.mockImplementation(() => Promise.resolve({ id: 1, nome: 'Course', estado: 'planeado' }));
    mockCursoService.atualizarCurso.mockReset();
    mockCursoService.atualizarCurso.mockImplementation(() => Promise.resolve({ id: 1, nome: 'Updated', estado: 'planeado' }));
    mockCursoService.buildUpdateData.mockReset();
    mockCursoService.buildUpdateData.mockImplementation(() => ({ nome: 'Updated' }));
    mockCursoService.deletarCurso.mockReset();
    mockCursoService.deletarCurso.mockImplementation(() => Promise.resolve());
    mockCursoService.alterarEstado.mockReset();
    mockCursoService.alterarEstado.mockImplementation(() => Promise.resolve({ id: 1, nome: 'Course', estado: 'em_curso' }));
    mockCursoRepository.update.mockReset();
    mockCursoRepository.update.mockImplementation(() => Promise.resolve({ id: 1, nome: 'Course', imagemCurso: 'https://example.com/img.jpg' }));
    mockCursoRepository.findById.mockReset();
    mockCursoRepository.findById.mockImplementation(() => Promise.resolve({ id: 1, nome: 'Course', imagemCurso: null }));
    mockCursoRepository.deleteMany.mockReset();
    mockCursoRepository.deleteMany.mockImplementation(() => Promise.resolve(3));
    mockUploadCourseImage.mockReset();
    mockUploadCourseImage.mockImplementation(() => Promise.resolve('https://example.com/img.jpg'));
    mockDeleteOldCourseImage.mockReset();
    mockDeleteOldCourseImage.mockImplementation(() => Promise.resolve());
  });

  describe('criarCurso', () => {
    test('creates course without image', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.body = { nome: 'New Course', dataInicio: '2025-01-01', dataFim: '2025-02-01', IDArea: 1, IDCategoria: 1 };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await criarCurso(req as any, res as any, next);

      expect(res._status).toBe(201);
      expect(mockCursoService.criarCurso).toHaveBeenCalledWith(req.body);
    });

    test('creates course with image', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.body = { nome: 'New Course' };
      (req as any).file = { buffer: Buffer.from('img'), mimetype: 'image/png' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await criarCurso(req as any, res as any, next);

      expect(res._status).toBe(201);
      expect(mockUploadCourseImage).toHaveBeenCalled();
      expect(mockCursoRepository.update).toHaveBeenCalled();
    });

    test('returns 400 on service error', async () => {
      mockCursoService.criarCurso.mockImplementation(() => Promise.reject(new Error('Validation failed')));
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.body = { nome: '' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await criarCurso(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toBe('Validation failed');
    });
  });

  describe('listarCursos', () => {
    test('paginated request returns paginated result', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = { page: '1', limit: '10' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarCursos(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(res._json).toHaveProperty('data');
      expect(res._json).toHaveProperty('meta');
    });

    test('unpaginated request returns data array', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = {};
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarCursos(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(Array.isArray(res._json)).toBe(true);
    });

    test('unauthenticated request forces public filters', async () => {
      const req = {
        query: {},
        headers: {},
        cookies: {},
        params: {},
        body: {},
      } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarCursos(req, res as any, next);

      expect(mockCursoService.listarCursosPaginados).toHaveBeenCalled();
      const callArgs = mockCursoService.listarCursosPaginados.mock.calls[0];
      expect(callArgs[2]).toMatchObject({ visivel: true, estado: 'em_curso' });
    });

    test('passes search and filter params', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = { page: '1', limit: '10', search: 'test', nivel: 'iniciante', areaId: '1' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarCursos(req as any, res as any, next);

      const callArgs = mockCursoService.listarCursosPaginados.mock.calls[0];
      expect(callArgs[2]).toMatchObject({ search: 'test', nivel: 'iniciante', areaId: 1 });
    });

    test('error calls next', async () => {
      const error = new Error('db error');
      mockCursoService.listarCursosPaginados.mockImplementation(() => Promise.reject(error));
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.query = {};
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarCursos(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obterCurso', () => {
    test('returns course by id', async () => {
      const req = { params: { id: '1' }, query: {}, body: {}, headers: {} } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await obterCurso(req, res as any, next);

      expect(res._status).toBe(200);
      expect(mockCursoService.obterCurso).toHaveBeenCalledWith(1);
    });

    test('returns 400 on error', async () => {
      mockCursoService.obterCurso.mockImplementation(() => Promise.reject(new Error('Curso não encontrado')));
      const req = { params: { id: '999' }, query: {}, body: {}, headers: {} } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await obterCurso(req, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toBe('Curso não encontrado');
    });
  });

  describe('atualizarCurso', () => {
    test('updates course without image', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '1' };
      req.body = { nome: 'Updated Course' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarCurso(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockCursoService.buildUpdateData).toHaveBeenCalledWith(req.body);
      expect(mockCursoService.atualizarCurso).toHaveBeenCalled();
    });

    test('updates course with image replacement', async () => {
      mockCursoRepository.findById.mockImplementation(() =>
        Promise.resolve({ id: 1, nome: 'Course', imagemCurso: 'https://old.com/img.jpg' })
      );
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '1' };
      req.body = { nome: 'Updated' };
      (req as any).file = { buffer: Buffer.from('img'), mimetype: 'image/png' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarCurso(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockDeleteOldCourseImage).toHaveBeenCalledWith('https://old.com/img.jpg');
      expect(mockUploadCourseImage).toHaveBeenCalled();
    });

    test('returns 400 on service error', async () => {
      mockCursoService.atualizarCurso.mockImplementation(() => Promise.reject(new Error('Validation error')));
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '1' };
      req.body = { nome: '' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarCurso(req as any, res as any, next);

      expect(res._status).toBe(400);
    });
  });

  describe('deletarCurso', () => {
    test('deletes course successfully', async () => {
      const req = { params: { id: '1' }, query: {}, body: {}, headers: {} } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarCurso(req, res as any, next);

      expect(res._status).toBe(200);
      expect(res._json.mensagem).toContain('deletado');
    });

    test('returns 400 when course has active enrollments', async () => {
      mockCursoService.deletarCurso.mockImplementation(() =>
        Promise.reject(new Error('Não é possível excluir um curso com inscrições ativas'))
      );
      const req = { params: { id: '1' }, query: {}, body: {}, headers: {} } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarCurso(req, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('inscrições ativas');
    });
  });

  describe('alterarEstado', () => {
    test('changes state successfully', async () => {
      const req = { params: { id: '1' }, body: { estado: 'em_curso' }, query: {}, headers: {} } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await alterarEstado(req, res as any, next);

      expect(res._status).toBe(200);
      expect(mockCursoService.alterarEstado).toHaveBeenCalledWith(1, 'em_curso');
    });

    test('returns 400 on invalid transition', async () => {
      mockCursoService.alterarEstado.mockImplementation(() =>
        Promise.reject(new Error('Transição de estado inválida'))
      );
      const req = { params: { id: '1' }, body: { estado: 'terminado' }, query: {}, headers: {} } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await alterarEstado(req, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('Transição de estado inválida');
    });
  });

  describe('deletarCursosEmMassa', () => {
    test('bulk deletes successfully', async () => {
      const req = { body: { ids: [1, 2, 3] }, params: {}, query: {}, headers: {} } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarCursosEmMassa(req, res as any, next);

      expect(res._status).toBe(200);
      expect(mockCursoRepository.deleteMany).toHaveBeenCalled();
    });

    test('returns 400 for invalid ids', async () => {
      const req = { body: { ids: [] }, params: {}, query: {}, headers: {} } as any;
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarCursosEmMassa(req, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('IDs inválidos');
    });
  });
});
