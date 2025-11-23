CREATE TABLE "AuditLogs" (
	"IDAuditLog" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer,
	"ActionType" varchar(50) NOT NULL,
	"EntityType" varchar(50) NOT NULL,
	"EntityId" integer,
	"ChangesJson" text,
	"IpAddress" varchar(45),
	"UserAgent" varchar(500),
	"DataCriacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ConclusoesCurso" (
	"IDConclusao" serial PRIMARY KEY NOT NULL,
	"IDCurso" integer NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"DataConclusao" timestamp NOT NULL,
	"CargaHorariaCumprida" integer NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Formadores" (
	"IDFormador" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"Especialidade" varchar(255),
	"Biografia" text,
	"AnosExperiencia" integer,
	"Certificacoes" text,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp,
	CONSTRAINT "Formadores_IDUtilizador_unique" UNIQUE("IDUtilizador")
);
--> statement-breakpoint
CREATE TABLE "Formandos" (
	"IDFormando" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"Empresa" varchar(255),
	"Cargo" varchar(255),
	"AreaInteresse" varchar(255),
	"ObjetivosAprendizagem" text,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp,
	CONSTRAINT "Formandos_IDUtilizador_unique" UNIQUE("IDUtilizador")
);
--> statement-breakpoint
CREATE TABLE "Gestores" (
	"IDGestor" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"Departamento" varchar(255),
	"NivelAcesso" varchar(50) DEFAULT 'admin' NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp,
	CONSTRAINT "Gestores_IDUtilizador_unique" UNIQUE("IDUtilizador")
);
--> statement-breakpoint
CREATE TABLE "RefreshTokens" (
	"IDRefreshToken" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"TokenHash" varchar(500) NOT NULL,
	"TokenFamilyId" varchar(100) NOT NULL,
	"ExpiresAt" timestamp NOT NULL,
	"Revoked" boolean DEFAULT false NOT NULL,
	"DeviceInfo" varchar(500),
	"IpAddress" varchar(45),
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "RefreshTokens_TokenHash_unique" UNIQUE("TokenHash")
);
--> statement-breakpoint
CREATE TABLE "TrabalhosAvaliacao" (
	"IDTrabalho" serial PRIMARY KEY NOT NULL,
	"IDAvaliacaoFinal" integer NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"ArquivoUrl" varchar(500),
	"DataSubmissao" timestamp DEFAULT now() NOT NULL,
	"Nota" integer,
	"Feedback" text,
	"Aprovado" boolean DEFAULT false NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
ALTER TABLE "Cursos" ADD COLUMN "NotaMinimaAprovacao" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "Cursos" ADD COLUMN "CreatedBy" integer;--> statement-breakpoint
ALTER TABLE "Cursos" ADD COLUMN "UpdatedBy" integer;--> statement-breakpoint
ALTER TABLE "Cursos" ADD COLUMN "DeletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "Utilizadores" ADD COLUMN "DeletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "AuditLogs" ADD CONSTRAINT "AuditLogs_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ConclusoesCurso" ADD CONSTRAINT "ConclusoesCurso_IDCurso_Cursos_IDCurso_fk" FOREIGN KEY ("IDCurso") REFERENCES "public"."Cursos"("IDCurso") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ConclusoesCurso" ADD CONSTRAINT "ConclusoesCurso_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Formadores" ADD CONSTRAINT "Formadores_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Formandos" ADD CONSTRAINT "Formandos_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Gestores" ADD CONSTRAINT "Gestores_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RefreshTokens" ADD CONSTRAINT "RefreshTokens_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TrabalhosAvaliacao" ADD CONSTRAINT "TrabalhosAvaliacao_IDAvaliacaoFinal_Avaliacoes_IDAvaliacaoFinal_fk" FOREIGN KEY ("IDAvaliacaoFinal") REFERENCES "public"."Avaliacoes"("IDAvaliacaoFinal") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TrabalhosAvaliacao" ADD CONSTRAINT "TrabalhosAvaliacao_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_CreatedBy_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("CreatedBy") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_UpdatedBy_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("UpdatedBy") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_avaliacoes_curso_utilizador" ON "Avaliacoes" USING btree ("IDCurso","IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_avaliacoes_utilizador" ON "Avaliacoes" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_certificados_utilizador" ON "Certificados" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_certificados_codigo" ON "Certificados" USING btree ("Codigo");--> statement-breakpoint
CREATE INDEX "idx_conteudos_curso_ordem" ON "Conteudos" USING btree ("IDCurso","Ordem");--> statement-breakpoint
CREATE INDEX "idx_cursos_estado_visivel" ON "Cursos" USING btree ("Estado","Visivel");--> statement-breakpoint
CREATE INDEX "idx_cursos_formador" ON "Cursos" USING btree ("IDFormador");--> statement-breakpoint
CREATE INDEX "idx_cursos_data_inicio" ON "Cursos" USING btree ("DataInicio");--> statement-breakpoint
CREATE INDEX "idx_inscricoes_utilizador_estado" ON "Inscricoes" USING btree ("IDUtilizador","Estado");--> statement-breakpoint
CREATE INDEX "idx_inscricoes_curso_estado" ON "Inscricoes" USING btree ("IDCurso","Estado");--> statement-breakpoint
CREATE INDEX "idx_notificacoes_utilizador_lida" ON "Notificacoes" USING btree ("IDUtilizador","Lida");--> statement-breakpoint
CREATE INDEX "idx_notificacoes_data" ON "Notificacoes" USING btree ("DataCriacao");--> statement-breakpoint
ALTER TABLE "Cursos" DROP COLUMN "PontosRecompensa";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "Perfil";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "Especialidade";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "Biografia";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "Departamento";--> statement-breakpoint
DROP TYPE "public"."perfil_enum";