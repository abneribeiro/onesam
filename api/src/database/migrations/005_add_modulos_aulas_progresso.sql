-- Migration: Adicionar tabelas de Módulos, Aulas e Progresso
-- Data: 2025-11-16
-- Objetivo: Implementar sistema de conteúdo programático para cursos

BEGIN;

-- Criar enum para tipo de conteúdo
CREATE TYPE tipo_conteudo_enum AS ENUM ('video', 'documento', 'link', 'texto', 'quiz');

-- Tabela de Módulos
CREATE TABLE IF NOT EXISTS "Modulos" (
  "IDModulo" SERIAL PRIMARY KEY,
  "IDCurso" INTEGER NOT NULL REFERENCES "Cursos"("IDCurso") ON DELETE CASCADE,
  "Titulo" VARCHAR(255) NOT NULL,
  "Descricao" TEXT,
  "Ordem" INTEGER NOT NULL DEFAULT 0,
  "DataCriacao" TIMESTAMP NOT NULL DEFAULT NOW(),
  "DataAtualizacao" TIMESTAMP
);

-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS "Aulas" (
  "IDAula" SERIAL PRIMARY KEY,
  "IDModulo" INTEGER NOT NULL REFERENCES "Modulos"("IDModulo") ON DELETE CASCADE,
  "Titulo" VARCHAR(255) NOT NULL,
  "Descricao" TEXT,
  "Tipo" tipo_conteudo_enum NOT NULL,
  "Conteudo" TEXT,
  "URL" VARCHAR(1000),
  "Duracao" INTEGER,
  "Ordem" INTEGER NOT NULL DEFAULT 0,
  "Obrigatoria" BOOLEAN NOT NULL DEFAULT true,
  "DataCriacao" TIMESTAMP NOT NULL DEFAULT NOW(),
  "DataAtualizacao" TIMESTAMP
);

-- Tabela de Progresso de Aulas
CREATE TABLE IF NOT EXISTS "ProgressoAulas" (
  "IDProgresso" SERIAL PRIMARY KEY,
  "IDAula" INTEGER NOT NULL REFERENCES "Aulas"("IDAula") ON DELETE CASCADE,
  "IDUtilizador" INTEGER NOT NULL REFERENCES "Utilizadores"("IDUtilizador") ON DELETE CASCADE,
  "Concluida" BOOLEAN NOT NULL DEFAULT false,
  "DataConclusao" TIMESTAMP,
  "TempoGasto" INTEGER,
  "DataCriacao" TIMESTAMP NOT NULL DEFAULT NOW(),
  "DataAtualizacao" TIMESTAMP,
  UNIQUE("IDAula", "IDUtilizador")
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_modulos_curso ON "Modulos"("IDCurso");
CREATE INDEX IF NOT EXISTS idx_modulos_curso_ordem ON "Modulos"("IDCurso", "Ordem");

CREATE INDEX IF NOT EXISTS idx_aulas_modulo ON "Aulas"("IDModulo");
CREATE INDEX IF NOT EXISTS idx_aulas_modulo_ordem ON "Aulas"("IDModulo", "Ordem");

CREATE INDEX IF NOT EXISTS idx_progresso_aula ON "ProgressoAulas"("IDAula");
CREATE INDEX IF NOT EXISTS idx_progresso_utilizador ON "ProgressoAulas"("IDUtilizador");
CREATE INDEX IF NOT EXISTS idx_progresso_utilizador_aula ON "ProgressoAulas"("IDUtilizador", "IDAula");

-- Verificação
DO $$
BEGIN
    RAISE NOTICE '=== TABELAS DE CONTEÚDO CRIADAS COM SUCESSO ===';
    RAISE NOTICE 'Tabelas: Modulos, Aulas, ProgressoAulas';
    RAISE NOTICE 'Sistema de conteúdo programático pronto para uso';
END $$;

COMMIT;
