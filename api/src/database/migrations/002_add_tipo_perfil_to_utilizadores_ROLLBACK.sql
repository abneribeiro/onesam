-- Rollback: Remover campo TipoPerfil da tabela Utilizadores
-- ATENÇÃO: Este rollback é seguro pois os dados de perfil ainda existem nas tabelas Admins e Formandos

BEGIN;

-- 1. Remover índice
DROP INDEX IF EXISTS idx_utilizadores_tipo_perfil;

-- 2. Remover coluna TipoPerfil
ALTER TABLE "Utilizadores"
DROP COLUMN IF EXISTS "TipoPerfil";

-- 3. Remover ENUM (comentado por segurança - pode ser usado por outras tabelas)
-- DROP TYPE IF EXISTS tipo_perfil_enum;

-- 4. Verificação
DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK CONCLUÍDO ===';
    RAISE NOTICE 'Campo TipoPerfil removido da tabela Utilizadores';
    RAISE NOTICE 'Os dados de perfil permanecem nas tabelas Admins e Formandos';
    RAISE NOTICE 'NOTA: O tipo ENUM tipo_perfil_enum não foi removido por segurança';
END $$;

COMMIT;
