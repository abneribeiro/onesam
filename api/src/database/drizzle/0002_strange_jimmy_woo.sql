CREATE TYPE "public"."tipo_perfil_enum" AS ENUM('admin', 'formando');--> statement-breakpoint
CREATE TABLE "Admins" (
	"IDAdmin" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"Departamento" varchar(255),
	"NivelAcesso" varchar(50) DEFAULT 'admin' NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp,
	CONSTRAINT "Admins_IDUtilizador_unique" UNIQUE("IDUtilizador")
);
--> statement-breakpoint
ALTER TABLE "Avaliacoes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Certificados" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ConclusoesCurso" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Conteudos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Formadores" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Gestores" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "TrabalhosAvaliacao" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Avaliacoes" CASCADE;--> statement-breakpoint
DROP TABLE "Certificados" CASCADE;--> statement-breakpoint
DROP TABLE "ConclusoesCurso" CASCADE;--> statement-breakpoint
DROP TABLE "Conteudos" CASCADE;--> statement-breakpoint
DROP TABLE "Formadores" CASCADE;--> statement-breakpoint
DROP TABLE "Gestores" CASCADE;--> statement-breakpoint
DROP TABLE "TrabalhosAvaliacao" CASCADE;--> statement-breakpoint
ALTER TABLE "Cursos" DROP CONSTRAINT "Cursos_IDFormador_Utilizadores_IDUtilizador_fk";
--> statement-breakpoint
ALTER TABLE "Cursos" DROP CONSTRAINT "Cursos_CreatedBy_Utilizadores_IDUtilizador_fk";
--> statement-breakpoint
ALTER TABLE "Cursos" DROP CONSTRAINT "Cursos_UpdatedBy_Utilizadores_IDUtilizador_fk";
--> statement-breakpoint
ALTER TABLE "Notificacoes" ALTER COLUMN "Tipo" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."tipo_notificacao_enum";--> statement-breakpoint
CREATE TYPE "public"."tipo_notificacao_enum" AS ENUM('inscricao_aprovada', 'inscricao_rejeitada', 'novo_curso', 'lembrete', 'sistema');--> statement-breakpoint
ALTER TABLE "Notificacoes" ALTER COLUMN "Tipo" SET DATA TYPE "public"."tipo_notificacao_enum" USING "Tipo"::"public"."tipo_notificacao_enum";--> statement-breakpoint
DROP INDEX "idx_cursos_formador";--> statement-breakpoint
ALTER TABLE "Notificacoes" ADD COLUMN "LinkAcao" varchar(500);--> statement-breakpoint
ALTER TABLE "Notificacoes" ADD COLUMN "DataLeitura" timestamp;--> statement-breakpoint
ALTER TABLE "Utilizadores" ADD COLUMN "TipoPerfil" "tipo_perfil_enum" NOT NULL;--> statement-breakpoint
ALTER TABLE "Utilizadores" ADD COLUMN "PerfilId" integer;--> statement-breakpoint
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admins_utilizador" ON "Admins" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_auditlogs_utilizador" ON "AuditLogs" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_auditlogs_action" ON "AuditLogs" USING btree ("ActionType");--> statement-breakpoint
CREATE INDEX "idx_auditlogs_entity" ON "AuditLogs" USING btree ("EntityType","EntityId");--> statement-breakpoint
CREATE INDEX "idx_auditlogs_data" ON "AuditLogs" USING btree ("DataCriacao");--> statement-breakpoint
CREATE INDEX "idx_refreshtokens_utilizador" ON "RefreshTokens" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_refreshtokens_family" ON "RefreshTokens" USING btree ("TokenFamilyId");--> statement-breakpoint
CREATE INDEX "idx_refreshtokens_expires" ON "RefreshTokens" USING btree ("ExpiresAt");--> statement-breakpoint
CREATE INDEX "idx_refreshtokens_revoked" ON "RefreshTokens" USING btree ("Revoked");--> statement-breakpoint
CREATE INDEX "idx_utilizadores_perfil_id" ON "Utilizadores" USING btree ("PerfilId","TipoPerfil");--> statement-breakpoint
ALTER TABLE "Cursos" DROP COLUMN "IDFormador";--> statement-breakpoint
ALTER TABLE "Cursos" DROP COLUMN "Tipo";--> statement-breakpoint
ALTER TABLE "Cursos" DROP COLUMN "Link";--> statement-breakpoint
ALTER TABLE "Cursos" DROP COLUMN "Plataforma";--> statement-breakpoint
ALTER TABLE "Cursos" DROP COLUMN "CreatedBy";--> statement-breakpoint
ALTER TABLE "Cursos" DROP COLUMN "UpdatedBy";--> statement-breakpoint
ALTER TABLE "Cursos" DROP COLUMN "DeletedAt";--> statement-breakpoint
ALTER TABLE "Notificacoes" DROP COLUMN "Link";--> statement-breakpoint
ALTER TABLE "RefreshTokens" DROP COLUMN "IpAddress";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "PrimeiraVez";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "DataNascimento";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "Telefone";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "DeletedAt";--> statement-breakpoint
DROP TYPE "public"."tipo_avaliacao_enum";--> statement-breakpoint
DROP TYPE "public"."tipo_conteudo_enum";--> statement-breakpoint
DROP TYPE "public"."tipo_curso_enum";