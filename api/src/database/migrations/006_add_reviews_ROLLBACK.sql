-- Rollback: Remover tabela de Reviews
-- Criado em: 2025-11-16

-- Remover índices
DROP INDEX IF EXISTS "idx_reviews_curso";
DROP INDEX IF EXISTS "idx_reviews_utilizador";
DROP INDEX IF EXISTS "idx_reviews_rating";

-- Remover tabela
DROP TABLE IF EXISTS "Reviews";
