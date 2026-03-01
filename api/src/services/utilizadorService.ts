/**
 * 🔧 OneSam - UtilizadorService
 * Business logic for user management operations
 *
 * This service layer abstracts business logic from controllers,
 * providing reusable methods for user operations with proper
 * validation, security checks, and error handling.
 */

import type { TipoPerfil } from '../types';
import { utilizadorRepository } from '../repositories/utilizadorRepository';
import { supabaseStorageService } from './supabaseStorageService';
import { verifyPassword } from '../utils/password';
import logger from '../utils/logger';

export interface UtilizadorCreateData {
  nome: string;
  email: string;
  senha?: string;
  tipoPerfil: TipoPerfil;
  ativo?: boolean;
}

export interface UtilizadorUpdateData {
  nome?: string;
  email?: string;
  tipoPerfil?: TipoPerfil;
  ativo?: boolean;
  avatar?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PasswordChangeData {
  senhaAtual: string;
  novaSenha: string;
}

export class UtilizadorService {
  /**
   * List all users with optional pagination and sorting
   */
  async listarUtilizadores(
    pagination?: PaginationOptions,
    sortOptions?: SortOptions
  ) {
    try {
      logger.debug('Listing users with options:', { pagination, sortOptions });

      if (pagination?.page || pagination?.limit) {
        return await utilizadorRepository.findAllPaginated(
          {
            page: pagination.page,
            limit: pagination.limit,
          },
          {
            sortBy: sortOptions?.sortBy,
            sortOrder: sortOptions?.sortOrder,
          }
        );
      }

      return await utilizadorRepository.findAll();
    } catch (error) {
      logger.error('Error listing users:', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Erro ao listar utilizadores');
    }
  }

  /**
   * Get user by ID with authorization check
   */
  async obterUtilizador(
    userId: number,
    requestingUserId: number,
    requestingUserProfile: TipoPerfil
  ) {
    try {
      // Security check: users can only see their own data unless admin
      if (requestingUserProfile !== 'admin' && requestingUserId !== userId) {
        throw new Error('Não autorizado a ver dados de outro utilizador');
      }

      const utilizador = await utilizadorRepository.findById(userId);
      if (!utilizador) {
        throw new Error('Utilizador não encontrado');
      }

      logger.debug('User retrieved:', { userId, requestedBy: requestingUserId });
      return utilizador;
    } catch (error) {
      logger.error('Error getting user:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async obterPerfilAtual(userId: number) {
    try {
      const utilizador = await utilizadorRepository.findById(userId);
      if (!utilizador) {
        throw new Error('Utilizador não encontrado');
      }

      return utilizador;
    } catch (error) {
      logger.error('Error getting current profile:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Update user data with email uniqueness validation
   */
  async atualizarUtilizador(userId: number, updateData: UtilizadorUpdateData) {
    try {
      const utilizador = await utilizadorRepository.findById(userId);
      if (!utilizador) {
        throw new Error('Utilizador não encontrado');
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== utilizador.email) {
        const emailExists = await utilizadorRepository.findByEmail(updateData.email);
        if (emailExists) {
          throw new Error('Email já está em uso');
        }
      }

      const utilizadorAtualizado = await utilizadorRepository.update(userId, updateData);
      logger.info('User updated successfully:', { userId, updatedFields: Object.keys(updateData) });

      return utilizadorAtualizado;
    } catch (error) {
      logger.error('Error updating user:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Change user password with current password verification
   */
  async alterarSenha(userId: number, passwordData: PasswordChangeData) {
    try {
      const { senhaAtual, novaSenha } = passwordData;

      if (!senhaAtual || !novaSenha) {
        throw new Error('Senha atual e nova senha são obrigatórias');
      }

      const utilizador = await utilizadorRepository.findById(userId);
      if (!utilizador) {
        throw new Error('Utilizador não encontrado');
      }

      // Get password hash from Better Auth Account table
      const senhaHash = await utilizadorRepository.getPasswordHash(userId);
      if (!senhaHash) {
        throw new Error('Utilizador sem senha configurada');
      }

      // Verify current password
      const senhaValida = await verifyPassword(senhaAtual, senhaHash);
      if (!senhaValida) {
        throw new Error('Senha atual incorreta');
      }

      await utilizadorRepository.updatePassword(userId, novaSenha);
      logger.info('Password changed successfully for user:', { userId });

      return { success: true, message: 'Senha alterada com sucesso' };
    } catch (error) {
      logger.error('Error changing password:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Update user avatar with old avatar cleanup
   */
  async atualizarAvatar(
    userId: number,
    fileBuffer: Buffer,
    mimetype: string
  ) {
    try {
      const utilizador = await utilizadorRepository.findById(userId);
      if (!utilizador) {
        throw new Error('Utilizador não encontrado');
      }

      // Delete old avatar if exists
      if (utilizador.avatar) {
        try {
          await supabaseStorageService.deleteOldAvatar(utilizador.avatar);
        } catch (error) {
          logger.warn('Failed to delete old avatar:', { error: String(error) });
          // Don't throw - continue with upload
        }
      }

      // Upload new avatar
      const avatarUrl = await supabaseStorageService.uploadAvatar(
        fileBuffer,
        userId,
        mimetype
      );

      // Update user record
      await utilizadorRepository.update(userId, { avatar: avatarUrl });

      logger.info('Avatar updated successfully:', { userId, avatarUrl });
      return { avatar: avatarUrl };
    } catch (error) {
      logger.error('Error updating avatar:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Delete user with self-deletion prevention
   */
  async deletarUtilizador(userId: number, requestingUserId: number) {
    try {
      // Prevent self-deletion
      if (userId === requestingUserId) {
        throw new Error('Não é possível eliminar o próprio utilizador');
      }

      const utilizador = await utilizadorRepository.findById(userId);
      if (!utilizador) {
        throw new Error('Utilizador não encontrado');
      }

      await utilizadorRepository.delete(userId);
      logger.info('User deleted successfully:', { userId, deletedBy: requestingUserId });

      return { success: true, message: 'Utilizador deletado com sucesso' };
    } catch (error) {
      logger.error('Error deleting user:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Create new user with email uniqueness validation
   */
  async criarUtilizador(userData: UtilizadorCreateData) {
    try {
      const { nome, email, senha, tipoPerfil, ativo = true } = userData;

      if (!nome || !email || !tipoPerfil) {
        throw new Error('Nome, email e tipoPerfil são obrigatórios');
      }

      // Check email uniqueness
      const utilizadorExistente = await utilizadorRepository.findByEmail(email);
      if (utilizadorExistente) {
        throw new Error('Email já está em uso');
      }

      // Create user record
      const novoUtilizador = await utilizadorRepository.create({
        nome,
        email,
        tipoPerfil,
        ativo,
      });

      // Set password if provided
      if (novoUtilizador && senha) {
        await utilizadorRepository.updatePassword(novoUtilizador.id, senha);
      }

      logger.info('User created successfully:', { userId: novoUtilizador?.id, email, tipoPerfil });
      return novoUtilizador;
    } catch (error) {
      logger.error('Error creating user:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Admin-level user update with additional fields
   */
  async atualizarUtilizadorAdmin(userId: number, updateData: UtilizadorUpdateData & { senha?: string }) {
    try {
      const { senha, ...userUpdateData } = updateData;

      const utilizador = await utilizadorRepository.findById(userId);
      if (!utilizador) {
        throw new Error('Utilizador não encontrado');
      }

      // Check email uniqueness if email is being updated
      if (userUpdateData.email && userUpdateData.email !== utilizador.email) {
        const emailExistente = await utilizadorRepository.findByEmail(userUpdateData.email);
        if (emailExistente) {
          throw new Error('Email já está em uso');
        }
      }

      // Update user data
      const utilizadorAtualizado = await utilizadorRepository.update(userId, userUpdateData);

      // Update password if provided
      if (senha) {
        await utilizadorRepository.updatePassword(userId, senha);
      }

      logger.info('User updated by admin:', { userId, updatedFields: Object.keys(userUpdateData) });
      return utilizadorAtualizado;
    } catch (error) {
      logger.error('Error in admin user update:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Toggle user active status
   */
  async toggleAtivo(userId: number) {
    try {
      const utilizador = await utilizadorRepository.findById(userId);
      if (!utilizador) {
        throw new Error('Utilizador não encontrado');
      }

      const novoEstado = !utilizador.ativo;
      await utilizadorRepository.update(userId, { ativo: novoEstado });

      logger.info('User status toggled:', { userId, newStatus: novoEstado });
      return {
        ativo: novoEstado,
        message: `Utilizador ${novoEstado ? 'ativado' : 'desativado'} com sucesso`
      };
    } catch (error) {
      logger.error('Error toggling user status:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Bulk delete users with self-deletion prevention
   */
  async deletarUtilizadoresEmMassa(userIds: number[], requestingUserId: number) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('IDs inválidos');
      }

      const idsToDelete = userIds.map(Number);

      // Prevent self-deletion
      if (idsToDelete.includes(requestingUserId)) {
        throw new Error('Não é possível eliminar o próprio utilizador');
      }

      const deletedCount = await utilizadorRepository.deleteMany(idsToDelete);
      logger.info('Bulk user deletion completed:', {
        deletedCount,
        requestedIds: idsToDelete.length,
        deletedBy: requestingUserId
      });

      return {
        deletedCount,
        message: `${deletedCount} utilizador(es) eliminado(s) com sucesso`
      };
    } catch (error) {
      logger.error('Error in bulk user deletion:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get user by email (for internal use)
   */
  async obterPorEmail(email: string) {
    try {
      return await utilizadorRepository.findByEmail(email);
    } catch (error) {
      logger.error('Error getting user by email:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Check if user exists
   */
  async utilizadorExiste(userId: number): Promise<boolean> {
    try {
      const utilizador = await utilizadorRepository.findById(userId);
      return !!utilizador;
    } catch (error) {
      logger.error('Error checking user existence:', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
}

// Export singleton instance
export const utilizadorService = new UtilizadorService();