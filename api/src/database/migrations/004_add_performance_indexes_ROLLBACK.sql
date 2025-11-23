-- Rollback: Remover índices de performance

BEGIN;

-- Remover todos os índices criados
DROP INDEX IF EXISTS idx_utilizadores_email_ativo;
DROP INDEX IF EXISTS idx_utilizadores_tipo_perfil_ativo;
DROP INDEX IF EXISTS idx_cursos_visivel_estado;
DROP INDEX IF EXISTS idx_cursos_data_limite;
DROP INDEX IF EXISTS idx_cursos_datas_estado;
DROP INDEX IF EXISTS idx_inscricoes_utilizador_estado_curso;
DROP INDEX IF EXISTS idx_inscricoes_curso_estado_data;
DROP INDEX IF EXISTS idx_refreshtokens_utilizador_revoked;
DROP INDEX IF EXISTS idx_refreshtokens_expires_revoked;
DROP INDEX IF EXISTS idx_auditlogs_utilizador_data;
DROP INDEX IF EXISTS idx_auditlogs_entity_data;

RAISE NOTICE 'Índices removidos - performance pode degradar';

COMMIT;
