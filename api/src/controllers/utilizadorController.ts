import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';
import type { TipoPerfil } from '../types';
import { utilizadorRepository } from '../repositories/utilizadorRepository';
import { sendData, sendSuccess, sendBadRequest, sendNotFound, sendForbidden } from '../utils/responseHelper';
import { supabaseStorageService } from '../services/supabaseStorageService';
import { verifyPassword } from '../utils/password';

export const listarUtilizadores = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    if (page || limit) {
      const result = await utilizadorRepository.findAllPaginated(
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        {
          sortBy: sortBy as string | undefined,
          sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        }
      );
      sendData(res, result);
    } else {
      const utilizadores = await utilizadorRepository.findAll();
      sendData(res, utilizadores);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Obter dados de um utilizador por ID
 * SECURITY: Apenas admins podem ver dados de outros utilizadores
 */
export const obterUtilizador = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const targetId = Number(id);
    const requestingUser = req.utilizador!;

    // SECURITY: Verificar se o usuário tem permissão para ver esses dados
    // Usuários normais só podem ver seus próprios dados
    if (requestingUser.tipoPerfil !== 'admin' && requestingUser.id !== targetId) {
      sendForbidden(res, 'Não autorizado a ver dados de outro utilizador');
      return;
    }

    const utilizador = await utilizadorRepository.findById(targetId);

    if (!utilizador) {
      sendNotFound(res, 'Utilizador não encontrado');
      return;
    }

    sendData(res, utilizador);
  } catch (error) {
    next(error);
  }
};

export const obterPerfilAtual = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const utilizador = await utilizadorRepository.findById(req.utilizador!.id);

    if (!utilizador) {
      sendNotFound(res, 'Utilizador não encontrado');
      return;
    }

    sendData(res, utilizador);
  } catch (error) {
    next(error);
  }
};

export const atualizarUtilizador = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.utilizador!.id;
    const { nome, email } = req.body;

    const utilizador = await utilizadorRepository.findById(id);
    if (!utilizador) {
      sendNotFound(res, 'Utilizador não encontrado');
      return;
    }

    if (email && email !== utilizador.email) {
      const emailExistente = await utilizadorRepository.findByEmail(email);
      if (emailExistente) {
        sendBadRequest(res, 'Email já está em uso');
        return;
      }
    }

    const updateData: Partial<{ nome: string; email: string }> = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;

    const utilizadorAtualizado = await utilizadorRepository.update(id, updateData);

    sendSuccess(res, 200, 'Utilizador atualizado com sucesso', { utilizador: utilizadorAtualizado });
  } catch (error) {
    next(error);
  }
};

export const alterarSenha = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      sendBadRequest(res, 'Senha atual e nova senha são obrigatórias');
      return;
    }

    const utilizador = await utilizadorRepository.findById(req.utilizador!.id);
    if (!utilizador) {
      sendNotFound(res, 'Utilizador não encontrado');
      return;
    }

    // Obter hash da senha da tabela Account do Better Auth
    const senhaHash = await utilizadorRepository.getPasswordHash(req.utilizador!.id);
    if (!senhaHash) {
      sendBadRequest(res, 'Utilizador sem senha configurada');
      return;
    }

    const senhaValida = await verifyPassword(senhaAtual, senhaHash);
    if (!senhaValida) {
      sendBadRequest(res, 'Senha atual incorreta');
      return;
    }

    await utilizadorRepository.updatePassword(req.utilizador!.id, novaSenha);

    sendSuccess(res, 200, 'Senha alterada com sucesso');
  } catch (error) {
    next(error);
  }
};

export const atualizarAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      sendBadRequest(res, 'Nenhum arquivo enviado');
      return;
    }

    const utilizador = await utilizadorRepository.findById(req.utilizador!.id);
    if (!utilizador) {
      sendNotFound(res, 'Utilizador não encontrado');
      return;
    }

    if (utilizador.avatar) {
      await supabaseStorageService.deleteOldAvatar(utilizador.avatar);
    }

    const avatarUrl = await supabaseStorageService.uploadAvatar(
      req.file.buffer,
      req.utilizador!.id,
      req.file.mimetype
    );

    await utilizadorRepository.update(req.utilizador!.id, {
      avatar: avatarUrl
    });

    sendSuccess(res, 200, 'Avatar atualizado com sucesso', { avatar: avatarUrl });
  } catch (error) {
    next(error);
  }
};

export const deletarUtilizador = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const currentUserId = req.utilizador!.id;

    // Verificar se o admin está tentando eliminar a si próprio
    if (Number(id) === currentUserId) {
      sendBadRequest(res, 'Não é possível eliminar o próprio utilizador');
      return;
    }

    const utilizador = await utilizadorRepository.findById(Number(id));
    if (!utilizador) {
      sendNotFound(res, 'Utilizador não encontrado');
      return;
    }

    await utilizadorRepository.delete(Number(id));

    sendSuccess(res, 200, 'Utilizador deletado com sucesso');
  } catch (error) {
    next(error);
  }
};

export const criarUtilizador = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nome, email, senha, tipoPerfil, ativo } = req.body;

    if (!nome || !email || !senha || !tipoPerfil) {
      sendBadRequest(res, 'Nome, email, senha e tipoPerfil são obrigatórios');
      return;
    }

    const utilizadorExistente = await utilizadorRepository.findByEmail(email);
    if (utilizadorExistente) {
      sendBadRequest(res, 'Email já está em uso');
      return;
    }

    // NOTA: Este endpoint cria apenas o utilizador básico.
    // Para criar um utilizador completo com perfil, use authService.createAdmin() ou authService.register()
    const novoUtilizador = await utilizadorRepository.create({
      nome,
      email,
      tipoPerfil: tipoPerfil as 'admin' | 'formando',
      ativo: ativo !== undefined ? ativo : true
    });

    // Criar entrada na tabela Account com a senha
    if (novoUtilizador && senha) {
      await utilizadorRepository.updatePassword(novoUtilizador.id, senha);
    }

    sendSuccess(res, 201, 'Utilizador criado com sucesso', { utilizador: novoUtilizador });
  } catch (error) {
    next(error);
  }
};

export const atualizarUtilizadorAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, tipoPerfil, ativo } = req.body;

    const utilizador = await utilizadorRepository.findById(Number(id));
    if (!utilizador) {
      sendNotFound(res, 'Utilizador não encontrado');
      return;
    }

    if (email && email !== utilizador.email) {
      const emailExistente = await utilizadorRepository.findByEmail(email);
      if (emailExistente) {
        sendBadRequest(res, 'Email já está em uso');
        return;
      }
    }

    // Tipagem correta ao invés de `any`
    const updateData: Partial<{
      nome: string;
      email: string;
      tipoPerfil: TipoPerfil;
      ativo: boolean;
    }> = {};

    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (tipoPerfil) updateData.tipoPerfil = tipoPerfil as TipoPerfil;
    if (ativo !== undefined) updateData.ativo = ativo;

    const utilizadorAtualizado = await utilizadorRepository.update(Number(id), updateData);

    if (senha) {
      await utilizadorRepository.updatePassword(Number(id), senha);
    }

    sendSuccess(res, 200, 'Utilizador atualizado com sucesso', { utilizador: utilizadorAtualizado });
  } catch (error) {
    next(error);
  }
};

export const toggleAtivo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const utilizador = await utilizadorRepository.findById(Number(id));
    if (!utilizador) {
      sendNotFound(res, 'Utilizador não encontrado');
      return;
    }

    const novoEstado = !utilizador.ativo;
    await utilizadorRepository.update(Number(id), { ativo: novoEstado });

    sendSuccess(res, 200, `Utilizador ${novoEstado ? 'ativado' : 'desativado'} com sucesso`, { ativo: novoEstado });
  } catch (error) {
    next(error);
  }
};

export const deletarUtilizadoresEmMassa = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      sendBadRequest(res, 'IDs inválidos');
      return;
    }

    const currentUserId = req.utilizador!.id;
    const idsToDelete = ids.map(Number);

    // Verificar se o admin está tentando eliminar a si próprio
    if (idsToDelete.includes(currentUserId)) {
      sendBadRequest(res, 'Não é possível eliminar o próprio utilizador');
      return;
    }

    const deletedCount = await utilizadorRepository.deleteMany(idsToDelete);
    sendSuccess(res, 200, `${deletedCount} utilizador(es) eliminado(s) com sucesso`, { deletedCount });
  } catch (error) {
    next(error);
  }
};
