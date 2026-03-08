import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { MockUtils } from '../setup';

const mockUtilizadorRepository = {
  findAll: mock(() => Promise.resolve([{ id: 1, nome: 'User', email: 'u@t.com', tipoPerfil: 'formando', ativo: true }])),
  findAllPaginated: mock(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } })),
  findById: mock(() => Promise.resolve({ id: 1, nome: 'User', email: 'user@test.com', tipoPerfil: 'formando', ativo: true, avatar: null })),
  findByEmail: mock(() => Promise.resolve(undefined)),
  create: mock(() => Promise.resolve({ id: 10, nome: 'New', email: 'new@test.com', tipoPerfil: 'formando', ativo: true, dataCriacao: new Date() })),
  update: mock(() => Promise.resolve({ id: 1, nome: 'Updated', email: 'user@test.com', tipoPerfil: 'formando', ativo: true, dataAtualizacao: new Date() })),
  delete: mock(() => Promise.resolve(true)),
  deleteMany: mock(() => Promise.resolve(3)),
  getPasswordHash: mock(() => Promise.resolve('salt:hash')),
  updatePassword: mock(() => Promise.resolve()),
};

const mockSupabaseStorage = {
  uploadAvatar: mock(() => Promise.resolve('https://example.com/avatar.jpg')),
  deleteOldAvatar: mock(() => Promise.resolve()),
};

const mockVerifyPassword = mock(() => Promise.resolve(true));

mock.module('../../repositories/utilizadorRepository', () => ({
  utilizadorRepository: mockUtilizadorRepository,
  UtilizadorRepository: class {},
}));

mock.module('../../services/supabaseStorageService', () => ({
  supabaseStorageService: mockSupabaseStorage,
}));

mock.module('../../utils/password', () => ({
  verifyPassword: mockVerifyPassword,
  hashPassword: mock(() => Promise.resolve('hashed')),
}));

const {
  listarUtilizadores,
  obterUtilizador,
  obterPerfilAtual,
  atualizarUtilizador,
  alterarSenha,
  atualizarAvatar,
  deletarUtilizador,
  criarUtilizador,
  atualizarUtilizadorAdmin,
  toggleAtivo,
  deletarUtilizadoresEmMassa,
} = await import('../../controllers/utilizadorController');

describe('UtilizadorController', () => {
  beforeEach(() => {
    mockUtilizadorRepository.findAll.mockReset();
    mockUtilizadorRepository.findAll.mockImplementation((() => Promise.resolve([{ id: 1, nome: 'User', email: 'u@t.com' }])) as any);
    mockUtilizadorRepository.findAllPaginated.mockReset();
    mockUtilizadorRepository.findAllPaginated.mockImplementation(() => Promise.resolve({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } }));
    mockUtilizadorRepository.findById.mockReset();
    mockUtilizadorRepository.findById.mockImplementation(() => Promise.resolve({ id: 1, nome: 'User', email: 'user@test.com', tipoPerfil: 'formando', ativo: true, avatar: null }));
    mockUtilizadorRepository.findByEmail.mockReset();
    mockUtilizadorRepository.findByEmail.mockImplementation(() => Promise.resolve(undefined));
    mockUtilizadorRepository.create.mockReset();
    mockUtilizadorRepository.create.mockImplementation(() => Promise.resolve({ id: 10, nome: 'New', email: 'new@test.com', tipoPerfil: 'formando', ativo: true, dataCriacao: new Date() }));
    mockUtilizadorRepository.update.mockReset();
    mockUtilizadorRepository.update.mockImplementation(() => Promise.resolve({ id: 1, nome: 'Updated', email: 'user@test.com', tipoPerfil: 'formando', ativo: true, dataAtualizacao: new Date() }));
    mockUtilizadorRepository.delete.mockReset();
    mockUtilizadorRepository.delete.mockImplementation(() => Promise.resolve(true));
    mockUtilizadorRepository.deleteMany.mockReset();
    mockUtilizadorRepository.deleteMany.mockImplementation(() => Promise.resolve(3));
    mockUtilizadorRepository.getPasswordHash.mockReset();
    mockUtilizadorRepository.getPasswordHash.mockImplementation(() => Promise.resolve('salt:hash'));
    mockUtilizadorRepository.updatePassword.mockReset();
    mockUtilizadorRepository.updatePassword.mockImplementation(() => Promise.resolve());
    mockVerifyPassword.mockReset();
    mockVerifyPassword.mockImplementation(() => Promise.resolve(true));
    mockSupabaseStorage.uploadAvatar.mockReset();
    mockSupabaseStorage.uploadAvatar.mockImplementation(() => Promise.resolve('https://example.com/avatar.jpg'));
    mockSupabaseStorage.deleteOldAvatar.mockReset();
    mockSupabaseStorage.deleteOldAvatar.mockImplementation(() => Promise.resolve());
  });

  describe('listarUtilizadores', () => {
    test('paginated request returns paginated result', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = { page: '1', limit: '10' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarUtilizadores(req as any, res as any, next);

      expect(mockUtilizadorRepository.findAllPaginated).toHaveBeenCalled();
      expect(res._status).toBe(200);
    });

    test('unpaginated request returns all users', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.query = {};
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarUtilizadores(req as any, res as any, next);

      expect(mockUtilizadorRepository.findAll).toHaveBeenCalled();
      expect(res._status).toBe(200);
    });

    test('error calls next', async () => {
      const error = new Error('db error');
      mockUtilizadorRepository.findAll.mockImplementation(() => Promise.reject(error));
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.query = {};
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await listarUtilizadores(req as any, res as any, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('obterUtilizador', () => {
    test('admin can access another user', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '2' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await obterUtilizador(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(res._json).toBeDefined();
    });

    test('user can access own data', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'formando' });
      req.params = { id: '1' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await obterUtilizador(req as any, res as any, next);

      expect(res._status).toBe(200);
    });

    test('non-admin accessing another user returns 403', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'formando' });
      req.params = { id: '2' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await obterUtilizador(req as any, res as any, next);

      expect(res._status).toBe(403);
      expect(res._json.erro).toContain('Não autorizado');
    });

    test('user not found returns 404', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() => Promise.resolve(undefined)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '999' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await obterUtilizador(req as any, res as any, next);

      expect(res._status).toBe(404);
    });
  });

  describe('obterPerfilAtual', () => {
    test('returns current user profile', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await obterPerfilAtual(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(res._json).toBeDefined();
    });

    test('returns 404 when user not found', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() => Promise.resolve(undefined)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 999 });
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await obterPerfilAtual(req as any, res as any, next);

      expect(res._status).toBe(404);
    });
  });

  describe('atualizarUtilizador', () => {
    test('updates nome and email successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.body = { nome: 'New Name', email: 'new@test.com' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockUtilizadorRepository.update).toHaveBeenCalled();
    });

    test('returns 404 when user not found', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() => Promise.resolve(undefined)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 999 });
      req.body = { nome: 'Name' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(404);
    });

    test('returns 400 when email already in use', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() =>
        Promise.resolve({ id: 1, nome: 'User', email: 'old@test.com', tipoPerfil: 'formando', ativo: true })
      ) as any);
      mockUtilizadorRepository.findByEmail.mockImplementation((() =>
        Promise.resolve({ id: 2, email: 'taken@test.com' })
      ) as any);
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.body = { email: 'taken@test.com' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('Email já está em uso');
    });
  });

  describe('alterarSenha', () => {
    test('changes password successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.body = { senhaAtual: 'old', novaSenha: 'new' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await alterarSenha(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(res._json.mensagem).toContain('Senha alterada com sucesso');
    });

    test('returns 400 when fields missing', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.body = { senhaAtual: '', novaSenha: '' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await alterarSenha(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('obrigatórias');
    });

    test('returns 404 when user not found', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() => Promise.resolve(undefined)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 999 });
      req.body = { senhaAtual: 'old', novaSenha: 'new' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await alterarSenha(req as any, res as any, next);

      expect(res._status).toBe(404);
    });

    test('returns 400 when no password configured', async () => {
      mockUtilizadorRepository.getPasswordHash.mockImplementation((() => Promise.resolve(null)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.body = { senhaAtual: 'old', novaSenha: 'new' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await alterarSenha(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('sem senha configurada');
    });

    test('returns 400 when current password is wrong', async () => {
      mockVerifyPassword.mockImplementation(() => Promise.resolve(false));
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.body = { senhaAtual: 'wrong', novaSenha: 'new' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await alterarSenha(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('incorreta');
    });
  });

  describe('atualizarAvatar', () => {
    test('uploads avatar successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      (req as any).file = { buffer: Buffer.from('img'), mimetype: 'image/jpeg' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarAvatar(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(res._json.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    test('returns 400 when no file', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarAvatar(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('Nenhum arquivo');
    });

    test('returns 404 when user not found', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() => Promise.resolve(undefined)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 999 });
      (req as any).file = { buffer: Buffer.from('img'), mimetype: 'image/jpeg' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarAvatar(req as any, res as any, next);

      expect(res._status).toBe(404);
    });
  });

  describe('deletarUtilizador', () => {
    test('deletes user successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.params = { id: '2' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(res._json.mensagem).toContain('deletado');
    });

    test('prevents self-deletion', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.params = { id: '1' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('próprio utilizador');
    });

    test('returns 404 when user not found', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() => Promise.resolve(undefined)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.params = { id: '999' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(404);
    });
  });

  describe('criarUtilizador', () => {
    test('creates user successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.body = { nome: 'New', email: 'new@test.com', senha: 'pass123', tipoPerfil: 'formando' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await criarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(201);
      expect(mockUtilizadorRepository.create).toHaveBeenCalled();
    });

    test('returns 400 when fields missing', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.body = { nome: 'Name' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await criarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('obrigatórios');
    });

    test('returns 400 when email exists', async () => {
      mockUtilizadorRepository.findByEmail.mockImplementation((() =>
        Promise.resolve({ id: 2, email: 'taken@test.com' })
      ) as any);
      const req = MockUtils.createMockAuthRequest({ id: 1 });
      req.body = { nome: 'New', email: 'taken@test.com', senha: 'pass', tipoPerfil: 'formando' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await criarUtilizador(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('Email já está em uso');
    });
  });

  describe('atualizarUtilizadorAdmin', () => {
    test('updates user with password change', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '2' };
      req.body = { nome: 'Admin Updated', senha: 'newpass' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarUtilizadorAdmin(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockUtilizadorRepository.update).toHaveBeenCalled();
      expect(mockUtilizadorRepository.updatePassword).toHaveBeenCalled();
    });

    test('returns 404 when user not found', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() => Promise.resolve(undefined)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '999' };
      req.body = { nome: 'Name' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarUtilizadorAdmin(req as any, res as any, next);

      expect(res._status).toBe(404);
    });

    test('returns 400 when email conflict', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() =>
        Promise.resolve({ id: 2, nome: 'User', email: 'old@test.com', tipoPerfil: 'formando', ativo: true })
      ) as any);
      mockUtilizadorRepository.findByEmail.mockImplementation((() =>
        Promise.resolve({ id: 3, email: 'taken@test.com' })
      ) as any);
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '2' };
      req.body = { email: 'taken@test.com' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await atualizarUtilizadorAdmin(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('Email já está em uso');
    });
  });

  describe('toggleAtivo', () => {
    test('toggles active status', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '2' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await toggleAtivo(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockUtilizadorRepository.update).toHaveBeenCalledWith(2, { ativo: false });
    });

    test('returns 404 when user not found', async () => {
      mockUtilizadorRepository.findById.mockImplementation((() => Promise.resolve(undefined)) as any);
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.params = { id: '999' };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await toggleAtivo(req as any, res as any, next);

      expect(res._status).toBe(404);
    });
  });

  describe('deletarUtilizadoresEmMassa', () => {
    test('bulk deletes successfully', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.body = { ids: [2, 3, 4] };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarUtilizadoresEmMassa(req as any, res as any, next);

      expect(res._status).toBe(200);
      expect(mockUtilizadorRepository.deleteMany).toHaveBeenCalled();
    });

    test('returns 400 for invalid ids', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.body = { ids: [] };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarUtilizadoresEmMassa(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('IDs inválidos');
    });

    test('prevents self-deletion in bulk', async () => {
      const req = MockUtils.createMockAuthRequest({ id: 1, tipoPerfil: 'admin' });
      req.body = { ids: [1, 2, 3] };
      const res = MockUtils.createMockResponse();
      const next = MockUtils.createMockNext();

      await deletarUtilizadoresEmMassa(req as any, res as any, next);

      expect(res._status).toBe(400);
      expect(res._json.erro).toContain('próprio utilizador');
    });
  });
});
