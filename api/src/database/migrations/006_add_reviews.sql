-- Migration: Adicionar tabela de Reviews/Avaliações de Cursos
-- Criado em: 2025-11-16

-- Criar tabela de Reviews
CREATE TABLE IF NOT EXISTS "Reviews" (
  "IDReview" SERIAL PRIMARY KEY,
  "IDCurso" INTEGER NOT NULL REFERENCES "Cursos"("IDCurso") ON DELETE CASCADE,
  "IDUtilizador" INTEGER NOT NULL REFERENCES "Utilizadores"("IDUtilizador") ON DELETE CASCADE,
  "Rating" INTEGER NOT NULL CHECK ("Rating" >= 1 AND "Rating" <= 5),
  "Comentario" TEXT,
  "DataCriacao" TIMESTAMP NOT NULL DEFAULT NOW(),
  "DataAtualizacao" TIMESTAMP,
  CONSTRAINT "unique_curso_utilizador" UNIQUE ("IDCurso", "IDUtilizador")
);

-- Criar índices para otimização de consultas
CREATE INDEX "idx_reviews_curso" ON "Reviews"("IDCurso");
CREATE INDEX "idx_reviews_utilizador" ON "Reviews"("IDUtilizador");
CREATE INDEX "idx_reviews_rating" ON "Reviews"("Rating");

-- Comentários nas tabelas e colunas
COMMENT ON TABLE "Reviews" IS 'Avaliações e comentários dos formandos sobre os cursos';
COMMENT ON COLUMN "Reviews"."Rating" IS 'Classificação de 1 a 5 estrelas';
COMMENT ON COLUMN "Reviews"."Comentario" IS 'Comentário opcional sobre o curso';
