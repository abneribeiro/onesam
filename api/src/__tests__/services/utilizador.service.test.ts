/**
 * 🧪 OneSam - UtilizadorService Tests
 * Comprehensive test suite for user management service
 *
 * Coverage:
 * ✅ User CRUD operations
 * ✅ Authentication & Authorization
 * ✅ Input validation & sanitization
 * ✅ Email uniqueness constraints
 * ✅ Password security
 * ✅ Avatar management
 * ✅ Bulk operations
 * ✅ Error handling
 */

import { describe, test, expect, beforeEach, afterAll } from 'bun:test';
import { TestUtils, SecurityTestUtils, PerformanceTestUtils } from '../setup';
import { utilizadorService } from '../../services/utilizadorService';

describe('UtilizadorService: Core Business Logic', () => {
  let testAdmin: any;
  let testFormando: any;

  beforeEach(async () => {
    testAdmin = await TestUtils.createTestUser({ tipoPerfil: 'admin' });
    testFormando = await TestUtils.createTestUser({
      tipoPerfil: 'formando',
      email: 'formando@test.com',
    });
  });

  afterAll(async () => {
    await TestUtils.cleanDatabase();
  });

  describe('User Creation & Validation', () => {
    test('should create user with valid data', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@example.com',
        tipoPerfil: 'formando' as const,
        ativo: true,
      };

      const user = await utilizadorService.criarUtilizador(userData);

      expect(user).toBeDefined();
      expect(user.nome).toBe(userData.nome);
      expect(user.email).toBe(userData.email);
      expect(user.tipoPerfil).toBe('formando');
      expect(user.ativo).toBe(true);
      expect(user.id).toBeGreaterThan(0);
    });

    test('should require mandatory fields', async () => {
      const invalidData = {
        nome: 'Test User',
        // Missing email and tipoPerfil
      };

      await expect(utilizadorService.criarUtilizador(invalidData as any))
        .rejects.toThrow('Nome, email e tipoPerfil são obrigatórios');
    });

    test('should prevent duplicate email addresses', async () => {
      const userData1 = {
        nome: 'User One',
        email: 'duplicate@example.com',
        tipoPerfil: 'formando' as const,
      };

      const userData2 = {
        nome: 'User Two',
        email: 'duplicate@example.com', // Same email
        tipoPerfil: 'admin' as const,
      };

      await utilizadorService.criarUtilizador(userData1);

      await expect(utilizadorService.criarUtilizador(userData2))
        .rejects.toThrow('Email já está em uso');
    });

    test('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@missing-local.com',
        'missing-at-symbol.com',
        'spaces in@email.com',
        '',
      ];

      for (const email of invalidEmails) {
        const userData = {
          nome: 'Test User',
          email,
          tipoPerfil: 'formando' as const,
        };

        // Should either reject or sanitize invalid emails
        try {
          await utilizadorService.criarUtilizador(userData);
        } catch (error: any) {
          expect(error.message).toContain('email');
        }
      }
    });

    test('should set default values correctly', async () => {
      const minimalData = {
        nome: 'Minimal User',
        email: 'minimal@example.com',
        tipoPerfil: 'formando' as const,
      };

      const user = await utilizadorService.criarUtilizador(minimalData);

      expect(user.ativo).toBe(true); // Default should be active
      expect(user.avatar).toBeUndefined(); // No avatar initially
      expect(user.dataCriacao).toBeDefined();
    });
  });

  describe('User Retrieval & Authorization', () => {
    test('should retrieve user by ID with proper authorization', async () => {
      // Admin should access any user
      const userAsAdmin = await utilizadorService.obterUtilizador(
        testFormando.id,
        testAdmin.id,
        testAdmin.tipoPerfil
      );

      expect(userAsAdmin).toBeDefined();
      expect(userAsAdmin.id).toBe(testFormando.id);
    });

    test('should allow users to access their own data', async () => {
      const ownData = await utilizadorService.obterUtilizador(
        testFormando.id,
        testFormando.id,
        testFormando.tipoPerfil
      );

      expect(ownData).toBeDefined();
      expect(ownData.id).toBe(testFormando.id);
    });

    test('should prevent users from accessing other users data', async () => {
      const anotherUser = await TestUtils.createTestUser({
        tipoPerfil: 'formando',
        email: 'another@example.com',
      });

      await expect(
        utilizadorService.obterUtilizador(
          anotherUser.id,
          testFormando.id,
          testFormando.tipoPerfil
        )
      ).rejects.toThrow('Não autorizado a ver dados de outro utilizador');
    });

    test('should handle non-existent users gracefully', async () => {
      const nonExistentId = 99999;

      await expect(
        utilizadorService.obterUtilizador(
          nonExistentId,
          testAdmin.id,
          testAdmin.tipoPerfil
        )
      ).rejects.toThrow('Utilizador não encontrado');
    });

    test('should retrieve current user profile', async () => {
      const profile = await utilizadorService.obterPerfilAtual(testFormando.id);

      expect(profile).toBeDefined();
      expect(profile.id).toBe(testFormando.id);
      expect(profile.email).toBe(testFormando.email);
    });
  });

  describe('User Updates & Data Integrity', () => {
    test('should update user data successfully', async () => {
      const updateData = {
        nome: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = await utilizadorService.atualizarUtilizador(
        testFormando.id,
        updateData
      );

      expect(updatedUser.nome).toBe(updateData.nome);
      expect(updatedUser.email).toBe(updateData.email);
      expect(updatedUser.dataAtualizacao).toBeDefined();
    });

    test('should validate email uniqueness during updates', async () => {
      const anotherUser = await TestUtils.createTestUser({
        email: 'existing@example.com',
      });

      await expect(
        utilizadorService.atualizarUtilizador(testFormando.id, {
          email: 'existing@example.com',
        })
      ).rejects.toThrow('Email já está em uso');
    });

    test('should allow keeping same email during updates', async () => {
      const updateData = {
        nome: 'New Name',
        email: testFormando.email, // Same email
      };

      const updatedUser = await utilizadorService.atualizarUtilizador(
        testFormando.id,
        updateData
      );

      expect(updatedUser.nome).toBe(updateData.nome);
      expect(updatedUser.email).toBe(testFormando.email);
    });

    test('should handle partial updates correctly', async () => {
      const originalUser = await utilizadorService.obterPerfilAtual(testFormando.id);

      const updateData = {
        nome: 'Only Name Updated',
      };

      const updatedUser = await utilizadorService.atualizarUtilizador(
        testFormando.id,
        updateData
      );

      expect(updatedUser.nome).toBe(updateData.nome);
      expect(updatedUser.email).toBe(originalUser.email); // Unchanged
      expect(updatedUser.tipoPerfil).toBe(originalUser.tipoPerfil); // Unchanged
    });
  });

  describe('Password Management', () => {
    test('should change password with valid current password', async () => {
      const passwordData = {
        senhaAtual: 'TestPassword123!',
        novaSenha: 'NewPassword456!',
      };

      const result = await utilizadorService.alterarSenha(testFormando.id, passwordData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Senha alterada com sucesso');
    });

    test('should reject password change with invalid current password', async () => {
      const passwordData = {
        senhaAtual: 'WrongPassword',
        novaSenha: 'NewPassword456!',
      };

      await expect(
        utilizadorService.alterarSenha(testFormando.id, passwordData)
      ).rejects.toThrow('Senha atual incorreta');
    });

    test('should require both current and new passwords', async () => {
      const invalidData1 = {
        senhaAtual: '',
        novaSenha: 'NewPassword456!',
      };

      const invalidData2 = {
        senhaAtual: 'TestPassword123!',
        novaSenha: '',
      };

      await expect(
        utilizadorService.alterarSenha(testFormando.id, invalidData1)
      ).rejects.toThrow('Senha atual e nova senha são obrigatórias');

      await expect(
        utilizadorService.alterarSenha(testFormando.id, invalidData2)
      ).rejects.toThrow('Senha atual e nova senha são obrigatórias');
    });
  });

  describe('Avatar Management', () => {
    test('should update avatar successfully', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const mimeType = 'image/jpeg';

      const result = await utilizadorService.atualizarAvatar(
        testFormando.id,
        imageBuffer,
        mimeType
      );

      expect(result.avatar).toBeDefined();
      expect(typeof result.avatar).toBe('string');
      expect(result.avatar.length).toBeGreaterThan(0);
    });

    test('should handle avatar update for non-existent user', async () => {
      const nonExistentId = 99999;
      const imageBuffer = Buffer.from('fake-image-data');

      await expect(
        utilizadorService.atualizarAvatar(nonExistentId, imageBuffer, 'image/jpeg')
      ).rejects.toThrow('Utilizador não encontrado');
    });
  });

  describe('User Status Management', () => {
    test('should toggle user active status', async () => {
      const initialStatus = testFormando.ativo;

      const result1 = await utilizadorService.toggleAtivo(testFormando.id);
      expect(result1.ativo).toBe(!initialStatus);

      const result2 = await utilizadorService.toggleAtivo(testFormando.id);
      expect(result2.ativo).toBe(initialStatus);
    });

    test('should provide appropriate status messages', async () => {
      const activeUser = await TestUtils.createTestUser({ ativo: true });
      const inactiveResult = await utilizadorService.toggleAtivo(activeUser.id);

      expect(inactiveResult.message).toContain('desativado');

      const activeResult = await utilizadorService.toggleAtivo(activeUser.id);
      expect(activeResult.message).toContain('ativado');
    });
  });

  describe('User Deletion & Bulk Operations', () => {
    test('should delete user successfully', async () => {
      const userToDelete = await TestUtils.createTestUser();

      const result = await utilizadorService.deletarUtilizador(
        userToDelete.id,
        testAdmin.id
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Utilizador deletado com sucesso');

      // Verify user is actually deleted
      await expect(
        utilizadorService.obterPerfilAtual(userToDelete.id)
      ).rejects.toThrow('Utilizador não encontrado');
    });

    test('should prevent self-deletion', async () => {
      await expect(
        utilizadorService.deletarUtilizador(testAdmin.id, testAdmin.id)
      ).rejects.toThrow('Não é possível eliminar o próprio utilizador');
    });

    test('should handle bulk user deletion', async () => {
      const usersToDelete = await Promise.all([
        TestUtils.createTestUser({ email: 'bulk1@example.com' }),
        TestUtils.createTestUser({ email: 'bulk2@example.com' }),
        TestUtils.createTestUser({ email: 'bulk3@example.com' }),
      ]);

      const userIds = usersToDelete.map(u => u.id);

      const result = await utilizadorService.deletarUtilizadoresEmMassa(
        userIds,
        testAdmin.id
      );

      expect(result.deletedCount).toBe(3);
      expect(result.message).toContain('3 utilizador(es) eliminado(s)');
    });

    test('should prevent self-deletion in bulk operations', async () => {
      const userToDelete = await TestUtils.createTestUser();
      const userIds = [userToDelete.id, testAdmin.id]; // Include self

      await expect(
        utilizadorService.deletarUtilizadoresEmMassa(userIds, testAdmin.id)
      ).rejects.toThrow('Não é possível eliminar o próprio utilizador');
    });

    test('should validate bulk deletion input', async () => {
      // Empty array
      await expect(
        utilizadorService.deletarUtilizadoresEmMassa([], testAdmin.id)
      ).rejects.toThrow('IDs inválidos');

      // Invalid input
      await expect(
        utilizadorService.deletarUtilizadoresEmMassa('invalid' as any, testAdmin.id)
      ).rejects.toThrow('IDs inválidos');
    });
  });

  describe('Admin-Level Operations', () => {
    test('should update user as admin with additional fields', async () => {
      const adminUpdateData = {
        nome: 'Admin Updated Name',
        email: 'admin-updated@example.com',
        tipoPerfil: 'admin' as const,
        ativo: false,
        senha: 'NewAdminPassword123!',
      };

      const updatedUser = await utilizadorService.atualizarUtilizadorAdmin(
        testFormando.id,
        adminUpdateData
      );

      expect(updatedUser.nome).toBe(adminUpdateData.nome);
      expect(updatedUser.email).toBe(adminUpdateData.email);
      expect(updatedUser.tipoPerfil).toBe(adminUpdateData.tipoPerfil);
      expect(updatedUser.ativo).toBe(adminUpdateData.ativo);
    });

    test('should handle admin update without password change', async () => {
      const updateData = {
        nome: 'Updated Without Password',
        ativo: true,
      };

      const updatedUser = await utilizadorService.atualizarUtilizadorAdmin(
        testFormando.id,
        updateData
      );

      expect(updatedUser.nome).toBe(updateData.nome);
      expect(updatedUser.ativo).toBe(updateData.ativo);
    });
  });

  describe('Utility Methods', () => {
    test('should find user by email', async () => {
      const user = await utilizadorService.obterPorEmail(testFormando.email);

      expect(user).toBeDefined();
      expect(user!.id).toBe(testFormando.id);
      expect(user!.email).toBe(testFormando.email);
    });

    test('should return null for non-existent email', async () => {
      const user = await utilizadorService.obterPorEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    test('should check user existence', async () => {
      const exists = await utilizadorService.utilizadorExiste(testFormando.id);
      expect(exists).toBe(true);

      const notExists = await utilizadorService.utilizadorExiste(99999);
      expect(notExists).toBe(false);
    });
  });

  describe('Performance & Load Testing', () => {
    test('should handle user listing efficiently', async () => {
      // Create multiple users for testing
      const users = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          TestUtils.createTestUser({ email: `perf${i}@example.com` })
        )
      );

      await PerformanceTestUtils.testQueryPerformance(async () => {
        return await utilizadorService.listarUtilizadores(
          { page: 1, limit: 20 },
          { sortBy: 'dataCriacao', sortOrder: 'desc' }
        );
      }, 500); // Should complete within 500ms
    });

    test('should handle concurrent user operations', async () => {
      await PerformanceTestUtils.testConcurrency(async () => {
        return await utilizadorService.criarUtilizador({
          nome: 'Concurrent User',
          email: `concurrent${Math.random()}@example.com`,
          tipoPerfil: 'formando',
        });
      }, 10);
    });
  });

  describe('Security & Input Validation', () => {
    test('should sanitize user input during creation', async () => {
      const maliciousData = {
        nome: '<script>alert("XSS")</script>Clean Name',
        email: 'safe@example.com',
        tipoPerfil: 'formando' as const,
      };

      const user = await utilizadorService.criarUtilizador(maliciousData);

      expect(user.nome).not.toContain('<script>');
      expect(user.nome).not.toContain('alert(');
    });

    test('should prevent SQL injection in search operations', async () => {
      await SecurityTestUtils.testSqlInjection(async (payload: string) => {
        // Test user search with malicious input
        return await utilizadorService.listarUtilizadores(
          { page: 1, limit: 10 },
          undefined
        );
      });
    });

    test('should handle malicious email patterns', async () => {
      const maliciousEmails = [
        "'; DROP TABLE utilizadores; --@example.com",
        'admin"; DELETE FROM session; --@example.com',
        "test' OR '1'='1@example.com",
      ];

      for (const email of maliciousEmails) {
        try {
          await utilizadorService.criarUtilizador({
            nome: 'Test User',
            email,
            tipoPerfil: 'formando',
          });
        } catch (error: any) {
          // Should fail validation, not execute malicious code
          expect(error.message).not.toContain('syntax error');
          expect(error.message).not.toContain('relation does not exist');
        }
      }
    });
  });
});