-- Rollback Migration: Remover tabelas de Módulos, Aulas e Progresso
-- Data: 2025-11-16

BEGIN;

-- Remover índices
DROP INDEX IF EXISTS idx_progresso_utilizador_aula;
DROP INDEX IF EXISTS idx_progresso_utilizador;
DROP INDEX IF EXISTS idx_progresso_aula;
DROP INDEX IF EXISTS idx_aulas_modulo_ordem;
DROP INDEX IF EXISTS idx_aulas_modulo;
DROP INDEX IF EXISTS idx_modulos_curso_ordem;
DROP INDEX IF EXISTS idx_modulos_curso;

-- Remover tabelas (ordem inversa devido a dependências)
DROP TABLE IF EXISTS "ProgressoAulas";
DROP TABLE IF EXISTS "Aulas";
DROP TABLE IF EXISTS "Modulos";

-- Remover enum
DROP TYPE IF EXISTS tipo_conteudo_enum;

-- Verificação
DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK CONCLUÍDO ===';
    RAISE NOTICE 'Tabelas de conteúdo removidas';
END $$;

COMMIT;
