import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { MockUtils } from '../setup';

const mockInscricaoService = {
  inscreverFormando: mock(() => Promise.resolve({ id: 1, cursoId: 1, utilizadorId: 1, estado: 'pendente' })),
  listarInscricoesPorCurso: mock(() => Promise.resolve([{ id: 1 }])),
  listarInscricoesFormando: mock(() => Promise.resolve([{ id: 1 }])),
  listarMinhasInscricoes: mock(() => Promise.resolve([{ id: 1 }])),
  listarTodas: mock(() => Promise.resolve([{ id: 1 }])),
  listarTodasPaginadas: mock(() => Promise.resolve({ data: [{ id: 1 }], meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } })),
  aprovarInscricao: mock(() => Promise.resolve({ id: 1, estado: 'aceite' })),
  rejeitarInscricao: mock(() => Promise.resolve({ id: 1, estado: 'rejeitada' })),
  cancelarInscricao: mock(() => Promise.resolve()),
};

mock.module('../../services/inscricaoService', () => ({
  inscricaoService: mockInscricaoService,
  InscricaoService: class {},
}));

const {
  inscreverFormando,
  listarInscricoesPorCurso,
  listarInscricoesFormando,
  listarMinhasInscricoes,
  listarTodasInscricoes,
  aprovarInscricao,
  rejeitarInscricao,
  cancelarInscricao,
} = await import('../../controllers/inscricaoController');

describe('InscricaoController', () => {
  beforeEach(() => {
    mockInscricaoService.inscreverFormando.mockReset();
    mockInscricaoService.inscreverFormando.mockImplementation(() => Promise.resolve({ id: 1, cursoId: 1, utilizadorId: 1, estado: 'pendente' }));
    mockInscricaoService.listarInscricoesPorCurso.mockReset();
    mockInscricaoService.listarInscricoesPorCurso.mockImplementation(() => Promise.resolve([{ id: 1 }]));
    mockInscricaoService.listarInscricoesFormando.mockReset();
    mockInscricaoService.listarInscricoesFormando.mockImplementation(() => Promise.resolve([{ id: 1 }]));
    mockInscricaoService.listarMinhasInscricoes.mockReset();
    mockInscricaoService.listarMinhasInscricoes.mockImplementation(() => Promise.resolve([{ id: 1 }]));
    mockInscricaoService.listarTodas.mockReset();
    mockInscricaoService.listarTodas.mockImplementation(() => Promise.resolve([{ id: 1 }]));
    mockInscricaoService.listarTodasPaginadas.mockReset();
    mockInscricaoService.listarTodasPaginadas.mockImplementation(() => Promise.resolve({ data: [{ id: 1 }], meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false } }));
    mockInscricaoService.aprovarInscricao.mockReset();
    mockInscricaoService.aprovarInscricao.mockImplementation(() => Promise.resolve({ id: 1, estado: 'aceite' }));
    mockInscricaoService.rejeitarInscricao.mockReset();
    mockInscricaoService.rejeitarInscricao.mockImplementation(() => Promise.resolve({ id: 1, estado: 'rejeitada' }));
    mockInscricaoService.cancelarInscricao.mockReset();
    mockInscricaoService.cancelarInscricao.mockImplementation(() => Promise.resolve());
  });

  describe('inscreverFormando', () => {
    test('creates enrollment successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 5, tipoPerfil: 'formando' });
      req.body = { IDCurso: 10 };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await inscreverFormando(req as any, res as any, next);

      expect(res._status).toBe(201);
      expect(mockInscricaoService.inscreverFormando).toHaveBeenCalledWith(5, 10);
    });

    test('returns 400 on service error', async () => {
      mockInscricaoService.inscreverFormando.mockImplementation(() =>
        Promise.reject(new Error('Você já está inscrito neste curso'))
      );
      const req = MockUtils.createMockAuthRequest({ id: 5 });
      req.body = { IDCurso: 10 };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await inscreverFormando(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('já está inscrito');
    });
  });

  describe('listarInscricoesPorCurso', () => {
    test('admin lists course enrollments', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '1' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarInscricoesPorCurso(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.listarInscricoesPorCurso).toHaveBeenCalledWith(1);
    });

    test('non-admin returns 403', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 5, tipoPerfil: 'formando' });
      req.params = { id: '1' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarInscricoesPorCurso(req as any, res as any, next);

      expect(res._status).toBe(403);
      expect(res._json.erro).toContain('administradores');
    });
  });

  describe('listarInscricoesFormando', () => {
    test('returns formando enrollments', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 5, tipoPerfil: 'formando' });
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarInscricoesFormando(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.listarInscricoesFormando).toHaveBeenCalledWith(5);
    });

    test('returns 400 on service error', async () => {
      mockInscricaoService.listarInscricoesFormando.mockImplementation(() =>
        Promise.reject(new Error('Apenas formandos'))
      );
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarInscricoesFormando(req as any, res as any, next);

      expect(res._status).toBe(400);
    });
  });

  describe('listarMinhasInscricoes', () => {
    test('returns user enrollments', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 5 });
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarMinhasInscricoes(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.listarMinhasInscricoes).toHaveBeenCalledWith(5);
    });

    test('returns 400 on service error', async () => {
      mockInscricaoService.listarMinhasInscricoes.mockImplementation(() =>
        Promise.reject(new Error('Service error'))
      );
      const req = MockUtils.createMockAuthRequest({ id: 5 });
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarMinhasInscricoes(req as any, res as any, next);

      expect(res._status).toBe(400);
    });
  });

  describe('listarTodasInscricoes', () => {
    test('paginated request returns paginated result', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = { page: '1', limit: '10' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarTodasInscricoes(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.listarTodasPaginadas).toHaveBeenCalled();
    });

    test('unpaginated request returns all', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = {};
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarTodasInscricoes(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.listarTodas).toHaveBeenCalled();
    });

    test('passes estado filter to paginated query', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = { page: '1', limit: '10', estado: 'pendente', search: 'test' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarTodasInscricoes(req as any, res as any, next);

      const callArgs = mockInscricaoService.listarTodasPaginadas.mock.calls[0];
      expect(callArgs[2]).toMatchObject({ estado: 'pendente', search: 'test' });
    });

    test('returns 400 on error', async () => {
      mockInscricaoService.listarTodas.mockImplementation(() =>
        Promise.reject(new Error('DB error'))
      );
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = {};
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarTodasInscricoes(req as any, res as any, next);

      expect(res._status).toBe(400);
    });
  });

  describe('aprovarInscricao', () => {
    test('approves enrollment successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '5' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await aprovarInscricao(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.aprovarInscricao).toHaveBeenCalledWith(5);
    });

    test('returns 400 on error', async () => {
      mockInscricaoService.aprovarInscricao.mockImplementation(() =>
        Promise.reject(new Error('Apenas inscrições pendentes podem ser aprovadas'))
      );
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '5' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await aprovarInscricao(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('pendentes');
    });
  });

  describe('rejeitarInscricao', () => {
    test('rejects enrollment without motivo', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '5' };
      req.body = {};
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await rejeitarInscricao(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.rejeitarInscricao).toHaveBeenCalledWith(5, undefined);
    });

    test('rejects enrollment with motivo', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '5' };
      req.body = { motivo: 'Requisitos não atendidos' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await rejeitarInscricao(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.rejeitarInscricao).toHaveBeenCalledWith(5, 'Requisitos não atendidos');
    });

    test('returns 400 on error', async () => {
      mockInscricaoService.rejeitarInscricao.mockImplementation(() =>
        Promise.reject(new Error('Inscrição não encontrada'))
      );
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '999' };
      req.body = {};
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await rejeitarInscricao(req as any, res as any, next);

      expect(res._status).toBe(400);
    });
  });

  describe('cancelarInscricao', () => {
    test('cancels enrollment successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 5, tipoPerfil: 'formando' });
      req.params = { id: '10' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await cancelarInscricao(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockInscricaoService.cancelarInscricao).toHaveBeenCalledWith(10, 5);
      expect(res._json.mensagem).toContain('cancelada');
    });

    test('returns 400 on error', async () => {
      mockInscricaoService.cancelarInscricao.mockImplementation(() =>
        Promise.reject(new Error('Você não tem permissão'))
      );
      const req = MockUtils.createMockAuthRequest({ id: 5 });
      req.params = { id: '10' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await cancelarInscricao(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('permissão');
    });
  });
});
