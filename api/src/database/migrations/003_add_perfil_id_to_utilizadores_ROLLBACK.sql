-- Rollback: Remover campo PerfilId da tabela Utilizadores

BEGIN;

-- 1. Remover índice
DROP INDEX IF EXISTS idx_utilizadores_perfil_id;

-- 2. Remover coluna
ALTER TABLE "Utilizadores"
DROP COLUMN IF EXISTS "PerfilId";

-- 3. Verificação
DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK CONCLUÍDO ===';
    RAISE NOTICE 'Campo PerfilId removido';
    RAISE NOTICE 'Sistema voltará a fazer queries extras no login';
END $$;

COMMIT;
