-- Migration: Adicionar índices essenciais para performance
-- Data: 2025-11-10
-- Objetivo: Otimizar queries mais comuns

BEGIN;

-- Índices para tabela Utilizadores
CREATE INDEX IF NOT EXISTS idx_utilizadores_email_ativo
ON "Utilizadores"("Email", "Ativo")
WHERE "Ativo" = true;

CREATE INDEX IF NOT EXISTS idx_utilizadores_tipo_perfil_ativo
ON "Utilizadores"("TipoPerfil", "Ativo")
WHERE "Ativo" = true;

-- Índices para tabela Cursos
CREATE INDEX IF NOT EXISTS idx_cursos_visivel_estado
ON "Cursos"("Visivel", "Estado")
WHERE "Visivel" = true;

CREATE INDEX IF NOT EXISTS idx_cursos_data_limite
ON "Cursos"("DataLimiteInscricao")
WHERE "Visivel" = true AND "Estado" IN ('planeado', 'em_curso');

CREATE INDEX IF NOT EXISTS idx_cursos_datas_estado
ON "Cursos"("DataInicio", "DataFim", "Estado");

-- Índices para tabela Inscricoes
CREATE INDEX IF NOT EXISTS idx_inscricoes_utilizador_estado_curso
ON "Inscricoes"("IDUtilizador", "Estado", "IDCurso");

CREATE INDEX IF NOT EXISTS idx_inscricoes_curso_estado_data
ON "Inscricoes"("IDCurso", "Estado", "DataInscricao");

-- Índices para tabela RefreshTokens
CREATE INDEX IF NOT EXISTS idx_refreshtokens_utilizador_revoked
ON "RefreshTokens"("IDUtilizador", "Revoked")
WHERE "Revoked" = false;

CREATE INDEX IF NOT EXISTS idx_refreshtokens_expires_revoked
ON "RefreshTokens"("ExpiresAt", "Revoked")
WHERE "Revoked" = false AND "ExpiresAt" > NOW();

-- Índices para tabela AuditLogs (otimizar consultas de auditoria)
CREATE INDEX IF NOT EXISTS idx_auditlogs_utilizador_data
ON "AuditLogs"("IDUtilizador", "DataCriacao" DESC);

CREATE INDEX IF NOT EXISTS idx_auditlogs_entity_data
ON "AuditLogs"("EntityType", "EntityId", "DataCriacao" DESC);

-- Verificação
DO $$
BEGIN
    RAISE NOTICE '=== ÍNDICES CRIADOS COM SUCESSO ===';
    RAISE NOTICE 'Performance de queries deve melhorar significativamente';
    RAISE NOTICE 'Especialmente: login, listagem de cursos, inscrições';
END $$;

COMMIT;
