-- =====================================================
-- ROLLBACK Migration: Simplificar Perfis e Cursos
-- Data: 2025-06-11
-- Descrição: Reverter alterações da migration 001
--
-- ATENÇÃO: Este rollback NÃO pode recuperar dados
-- deletados. Use apenas se a migration falhar ANTES
-- de dropar tabelas/colunas.
-- =====================================================

BEGIN;

-- =====================================================
-- FASE 1: RECRIAR ENUM DE TIPO DE CURSO
-- =====================================================

CREATE TYPE tipo_curso_enum AS ENUM ('sincrono', 'assincrono');

-- =====================================================
-- FASE 2: RENOMEAR ADMINS → GESTORES
-- =====================================================

-- Renomear tabela
ALTER TABLE "Admins" RENAME TO "Gestores";

-- Renomear coluna ID
ALTER TABLE "Gestores" RENAME COLUMN "IDAdmin" TO "IDGestor";

-- Renomear índices
ALTER INDEX IF EXISTS "Admins_pkey" RENAME TO "Gestores_pkey";
ALTER INDEX IF EXISTS "Admins_IDUtilizador_unique" RENAME TO "Gestores_IDUtilizador_unique";
ALTER INDEX IF EXISTS idx_admins_utilizador RENAME TO idx_gestores_utilizador;

-- =====================================================
-- FASE 3: RECRIAR TABELA FORMADORES
-- =====================================================

CREATE TABLE "Formadores" (
  "IDFormador" SERIAL PRIMARY KEY,
  "IDUtilizador" INTEGER NOT NULL REFERENCES "Utilizadores"("IDUtilizador") ON DELETE CASCADE UNIQUE,
  "Especialidade" VARCHAR(255),
  "Biografia" TEXT,
  "AnosExperiencia" INTEGER,
  "Certificacoes" TEXT,
  "DataCriacao" TIMESTAMP DEFAULT NOW() NOT NULL,
  "DataAtualizacao" TIMESTAMP
);

-- Criar índice
CREATE INDEX idx_formadores_utilizador ON "Formadores"("IDUtilizador");

-- =====================================================
-- FASE 4: ADICIONAR COLUNAS EM CURSOS
-- =====================================================

-- Adicionar coluna tipo
ALTER TABLE "Cursos" ADD COLUMN "Tipo" tipo_curso_enum;

-- Adicionar coluna formadorId
ALTER TABLE "Cursos" ADD COLUMN "IDFormador" INTEGER REFERENCES "Formadores"("IDFormador") ON DELETE SET NULL;

-- Adicionar colunas link e plataforma
ALTER TABLE "Cursos" ADD COLUMN "Link" VARCHAR(500);
ALTER TABLE "Cursos" ADD COLUMN "Plataforma" VARCHAR(100);

-- =====================================================
-- FASE 5: RECRIAR ÍNDICES
-- =====================================================

CREATE INDEX idx_cursos_formador ON "Cursos"("IDFormador");

-- =====================================================
-- COMMIT
-- =====================================================

COMMIT;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

-- Este rollback NÃO recupera:
-- 1. Dados de formadores deletados
-- 2. Valores de formadorId em cursos
-- 3. Valores de tipo em cursos
-- 4. Valores de link e plataforma

-- Para recuperar dados completamente, use o backup:
-- psql -U seu_usuario -d seu_database < backup_YYYYMMDD_HHMMSS.sql
