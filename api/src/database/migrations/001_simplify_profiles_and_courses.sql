-- =====================================================
-- Migration: Simplificar Perfis e Cursos
-- Data: 2025-06-11
-- Descrição:
--   1. Remover perfil "formador"
--   2. Renomear "gestores" → "admins"
--   3. Remover tipos de curso (síncrono/assíncrono)
--   4. Simplificar estrutura de cursos
-- =====================================================

-- IMPORTANTE: Fazer backup antes de executar!
-- pg_dump -U seu_usuario -d seu_database > backup_$(date +%Y%m%d_%H%M%S).sql

BEGIN;

-- =====================================================
-- FASE 1: PREPARAÇÃO - Remover constraints e índices
-- =====================================================

-- Remover índice de formador em cursos
DROP INDEX IF EXISTS idx_cursos_formador;

-- Remover foreign key de formadorId
ALTER TABLE "Cursos" DROP CONSTRAINT IF EXISTS "Cursos_IDFormador_Formadores_IDFormador_fk";

-- =====================================================
-- FASE 2: SIMPLIFICAR CURSOS
-- =====================================================

-- Remover coluna formadorId (cursos não terão dono específico)
ALTER TABLE "Cursos" DROP COLUMN IF EXISTS "IDFormador";

-- Remover coluna tipo (não haverá mais distinção síncrono/assíncrono)
ALTER TABLE "Cursos" DROP COLUMN IF EXISTS "Tipo";

-- Remover campos link e plataforma (simplificação)
ALTER TABLE "Cursos" DROP COLUMN IF EXISTS "Link";
ALTER TABLE "Cursos" DROP COLUMN IF EXISTS "Plataforma";

-- =====================================================
-- FASE 3: RENOMEAR GESTORES → ADMINS
-- =====================================================

-- Renomear tabela
ALTER TABLE "Gestores" RENAME TO "Admins";

-- Renomear coluna ID
ALTER TABLE "Admins" RENAME COLUMN "IDGestor" TO "IDAdmin";

-- Renomear constraint (se necessário)
ALTER INDEX IF EXISTS "Gestores_pkey" RENAME TO "Admins_pkey";
ALTER INDEX IF EXISTS "Gestores_IDUtilizador_unique" RENAME TO "Admins_IDUtilizador_unique";

-- =====================================================
-- FASE 4: REMOVER PERFIL FORMADOR
-- =====================================================

-- Remover triggers relacionados a formadores (se existirem)
DROP TRIGGER IF EXISTS single_profile_trigger_formadores ON "Formadores";

-- Dropar tabela Formadores
DROP TABLE IF EXISTS "Formadores" CASCADE;

-- =====================================================
-- FASE 5: REMOVER ENUMS NÃO UTILIZADOS
-- =====================================================

-- Remover enum de tipo de curso (já não é usado após remoção da coluna)
DROP TYPE IF EXISTS tipo_curso_enum CASCADE;

-- =====================================================
-- FASE 6: ADICIONAR NOVOS ÍNDICES (OTIMIZAÇÃO)
-- =====================================================

-- Adicionar índice em Admins para utilizadorId (se não existir)
CREATE INDEX IF NOT EXISTS idx_admins_utilizador ON "Admins"("IDUtilizador");

-- Recriar índice de estado e visibilidade em cursos
CREATE INDEX IF NOT EXISTS idx_cursos_estado_visivel ON "Cursos"("Estado", "Visivel");

-- =====================================================
-- FASE 7: ATUALIZAR COMENTÁRIOS E METADATA
-- =====================================================

COMMENT ON TABLE "Admins" IS 'Tabela de administradores do sistema (antigo Gestores)';
COMMENT ON COLUMN "Admins"."IDAdmin" IS 'ID único do administrador';
COMMENT ON COLUMN "Admins"."IDUtilizador" IS 'Referência para a tabela Utilizadores';

COMMENT ON TABLE "Cursos" IS 'Tabela de cursos simplificada (sem tipos ou formadores específicos)';
COMMENT ON COLUMN "Cursos"."Estado" IS 'Estado do curso: planeado, em_curso, terminado, arquivado';

-- =====================================================
-- FASE 8: VALIDAÇÕES E VERIFICAÇÕES
-- =====================================================

-- Verificar se há cursos órfãos (deveria retornar todos os cursos, pois não há mais formadorId)
DO $$
DECLARE
    curso_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO curso_count FROM "Cursos";
    RAISE NOTICE 'Total de cursos após migração: %', curso_count;

    -- Verificar admins
    SELECT COUNT(*) INTO curso_count FROM "Admins";
    RAISE NOTICE 'Total de admins: %', curso_count;

    -- Verificar formandos
    SELECT COUNT(*) INTO curso_count FROM "Formandos";
    RAISE NOTICE 'Total de formandos: %', curso_count;
END $$;

-- =====================================================
-- COMMIT
-- =====================================================

COMMIT;

-- =====================================================
-- VERIFICAÇÕES PÓS-MIGRATION
-- =====================================================

-- Para executar após o commit:
-- SELECT * FROM "Admins" LIMIT 5;
-- SELECT "IDCurso", "NomeCurso", "Estado" FROM "Cursos" LIMIT 5;
-- \d "Cursos" -- Ver estrutura da tabela
-- \d "Admins" -- Ver estrutura da tabela

-- =====================================================
-- ROLLBACK (caso necessário)
-- =====================================================

-- Se algo der errado, execute:
-- ROLLBACK;
-- E restaure o backup:
-- psql -U seu_usuario -d seu_database < backup_YYYYMMDD_HHMMSS.sql
