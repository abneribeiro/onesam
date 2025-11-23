-- Migration: Adicionar campo TipoPerfil à tabela Utilizadores
-- Data: 2025-11-10
-- Objetivo: Eliminar necessidade de queries adicionais para determinar tipo de perfil

BEGIN;

-- 1. Criar ENUM para tipo de perfil (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_perfil_enum') THEN
        CREATE TYPE tipo_perfil_enum AS ENUM ('admin', 'formando');
    END IF;
END $$;

-- 2. Adicionar coluna TipoPerfil (temporariamente NULL para permitir migração de dados)
ALTER TABLE "Utilizadores"
ADD COLUMN IF NOT EXISTS "TipoPerfil" tipo_perfil_enum;

-- 3. Popular a coluna TipoPerfil com base nas tabelas de perfil existentes
-- Atualizar utilizadores que são admins
UPDATE "Utilizadores" u
SET "TipoPerfil" = 'admin'
FROM "Admins" a
WHERE u."IDUtilizador" = a."IDUtilizador"
AND u."TipoPerfil" IS NULL;

-- Atualizar utilizadores que são formandos
UPDATE "Utilizadores" u
SET "TipoPerfil" = 'formando'
FROM "Formandos" f
WHERE u."IDUtilizador" = f."IDUtilizador"
AND u."TipoPerfil" IS NULL;

-- 4. Verificar se há utilizadores sem perfil
DO $$
DECLARE
    sem_perfil INTEGER;
BEGIN
    SELECT COUNT(*) INTO sem_perfil
    FROM "Utilizadores"
    WHERE "TipoPerfil" IS NULL;

    IF sem_perfil > 0 THEN
        RAISE WARNING 'Existem % utilizadores sem perfil definido. Definindo como formando por padrão.', sem_perfil;

        -- Definir como formando por padrão e criar registro na tabela Formandos
        INSERT INTO "Formandos" ("IDUtilizador", "DataCriacao")
        SELECT "IDUtilizador", NOW()
        FROM "Utilizadores"
        WHERE "TipoPerfil" IS NULL;

        UPDATE "Utilizadores"
        SET "TipoPerfil" = 'formando'
        WHERE "TipoPerfil" IS NULL;
    END IF;
END $$;

-- 5. Tornar a coluna NOT NULL após popular os dados
ALTER TABLE "Utilizadores"
ALTER COLUMN "TipoPerfil" SET NOT NULL;

-- 6. Adicionar índice para otimizar queries por tipo de perfil
CREATE INDEX IF NOT EXISTS idx_utilizadores_tipo_perfil
ON "Utilizadores"("TipoPerfil");

-- 7. Verificação pós-migração
DO $$
DECLARE
    total_utilizadores INTEGER;
    total_admins INTEGER;
    total_formandos INTEGER;
    utilizadores_com_perfil INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_utilizadores FROM "Utilizadores";
    SELECT COUNT(*) INTO total_admins FROM "Utilizadores" WHERE "TipoPerfil" = 'admin';
    SELECT COUNT(*) INTO total_formandos FROM "Utilizadores" WHERE "TipoPerfil" = 'formando';
    SELECT COUNT(*) INTO utilizadores_com_perfil FROM "Utilizadores" WHERE "TipoPerfil" IS NOT NULL;

    RAISE NOTICE '=== VERIFICAÇÃO DA MIGRAÇÃO ===';
    RAISE NOTICE 'Total de utilizadores: %', total_utilizadores;
    RAISE NOTICE 'Utilizadores admin: %', total_admins;
    RAISE NOTICE 'Utilizadores formando: %', total_formandos;
    RAISE NOTICE 'Utilizadores com perfil definido: %', utilizadores_com_perfil;

    IF total_utilizadores != utilizadores_com_perfil THEN
        RAISE EXCEPTION 'ERRO: Nem todos os utilizadores têm perfil definido!';
    END IF;

    RAISE NOTICE 'Migração concluída com sucesso!';
END $$;

COMMIT;
