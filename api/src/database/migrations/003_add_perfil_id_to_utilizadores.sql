-- Migration: Adicionar campo PerfilId à tabela Utilizadores
-- Data: 2025-11-10
-- Objetivo: Eliminar queries extras no login (de 1 query extra para 0)

BEGIN;

-- 1. Adicionar coluna PerfilId (temporariamente NULL)
ALTER TABLE "Utilizadores"
ADD COLUMN IF NOT EXISTS "PerfilId" INTEGER;

-- 2. Popular PerfilId com dados existentes
-- Para admins
UPDATE "Utilizadores" u
SET "PerfilId" = a."IDAdmin"
FROM "Admins" a
WHERE u."IDUtilizador" = a."IDUtilizador"
AND u."TipoPerfil" = 'admin';

-- Para formandos
UPDATE "Utilizadores" u
SET "PerfilId" = f."IDFormando"
FROM "Formandos" f
WHERE u."IDUtilizador" = f."IDUtilizador"
AND u."TipoPerfil" = 'formando';

-- 3. Verificar que todos têm PerfilId
DO $$
DECLARE
    sem_perfil_id INTEGER;
BEGIN
    SELECT COUNT(*) INTO sem_perfil_id
    FROM "Utilizadores"
    WHERE "PerfilId" IS NULL;

    IF sem_perfil_id > 0 THEN
        RAISE EXCEPTION 'ERRO: % utilizadores sem PerfilId!', sem_perfil_id;
    END IF;
END $$;

-- 4. Tornar coluna NOT NULL
ALTER TABLE "Utilizadores"
ALTER COLUMN "PerfilId" SET NOT NULL;

-- 5. Adicionar índice composto para performance
CREATE INDEX IF NOT EXISTS idx_utilizadores_perfil_id
ON "Utilizadores"("PerfilId", "TipoPerfil");

-- 6. Verificação pós-migração
DO $$
DECLARE
    total INTEGER;
    com_perfil_id INTEGER;
BEGIN
    SELECT COUNT(*) INTO total FROM "Utilizadores";
    SELECT COUNT(*) INTO com_perfil_id FROM "Utilizadores" WHERE "PerfilId" IS NOT NULL;

    RAISE NOTICE '=== VERIFICAÇÃO ===';
    RAISE NOTICE 'Total utilizadores: %', total;
    RAISE NOTICE 'Com PerfilId: %', com_perfil_id;

    IF total != com_perfil_id THEN
        RAISE EXCEPTION 'ERRO: Migração falhou!';
    END IF;

    RAISE NOTICE 'Migração concluída com sucesso!';
END $$;

COMMIT;
