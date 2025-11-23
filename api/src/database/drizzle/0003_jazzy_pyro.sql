CREATE TYPE "public"."tipo_conteudo_enum" AS ENUM('video', 'documento', 'link', 'texto', 'quiz');--> statement-breakpoint
CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" integer NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Aulas" (
	"IDAula" serial PRIMARY KEY NOT NULL,
	"IDModulo" integer NOT NULL,
	"Titulo" varchar(255) NOT NULL,
	"Descricao" text,
	"Tipo" "tipo_conteudo_enum" NOT NULL,
	"Conteudo" text,
	"URL" varchar(1000),
	"Duracao" integer,
	"Ordem" integer DEFAULT 0 NOT NULL,
	"Obrigatoria" boolean DEFAULT true NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
CREATE TABLE "Modulos" (
	"IDModulo" serial PRIMARY KEY NOT NULL,
	"IDCurso" integer NOT NULL,
	"Titulo" varchar(255) NOT NULL,
	"Descricao" text,
	"Ordem" integer DEFAULT 0 NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
CREATE TABLE "ProgressoAulas" (
	"IDProgresso" serial PRIMARY KEY NOT NULL,
	"IDAula" integer NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"Concluida" boolean DEFAULT false NOT NULL,
	"DataConclusao" timestamp,
	"TempoGasto" integer,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp,
	CONSTRAINT "unique_aula_utilizador" UNIQUE("IDAula","IDUtilizador")
);
--> statement-breakpoint
CREATE TABLE "Reviews" (
	"IDReview" serial PRIMARY KEY NOT NULL,
	"IDCurso" integer NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"Rating" integer NOT NULL,
	"Comentario" text,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp,
	CONSTRAINT "unique_curso_utilizador" UNIQUE("IDCurso","IDUtilizador")
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" integer NOT NULL,
	CONSTRAINT "Session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "Verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "RefreshTokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "RefreshTokens" CASCADE;--> statement-breakpoint
ALTER TABLE "Utilizadores" ALTER COLUMN "PalavraPasse" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Utilizadores" ADD COLUMN "EmailVerified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("userId") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Aulas" ADD CONSTRAINT "Aulas_IDModulo_Modulos_IDModulo_fk" FOREIGN KEY ("IDModulo") REFERENCES "public"."Modulos"("IDModulo") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Modulos" ADD CONSTRAINT "Modulos_IDCurso_Cursos_IDCurso_fk" FOREIGN KEY ("IDCurso") REFERENCES "public"."Cursos"("IDCurso") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProgressoAulas" ADD CONSTRAINT "ProgressoAulas_IDAula_Aulas_IDAula_fk" FOREIGN KEY ("IDAula") REFERENCES "public"."Aulas"("IDAula") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProgressoAulas" ADD CONSTRAINT "ProgressoAulas_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_IDCurso_Cursos_IDCurso_fk" FOREIGN KEY ("IDCurso") REFERENCES "public"."Cursos"("IDCurso") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("userId") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_account_userId" ON "Account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_aulas_modulo" ON "Aulas" USING btree ("IDModulo");--> statement-breakpoint
CREATE INDEX "idx_aulas_modulo_ordem" ON "Aulas" USING btree ("IDModulo","Ordem");--> statement-breakpoint
CREATE INDEX "idx_modulos_curso" ON "Modulos" USING btree ("IDCurso");--> statement-breakpoint
CREATE INDEX "idx_modulos_curso_ordem" ON "Modulos" USING btree ("IDCurso","Ordem");--> statement-breakpoint
CREATE INDEX "idx_progresso_aula" ON "ProgressoAulas" USING btree ("IDAula");--> statement-breakpoint
CREATE INDEX "idx_progresso_utilizador" ON "ProgressoAulas" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_progresso_utilizador_aula" ON "ProgressoAulas" USING btree ("IDUtilizador","IDAula");--> statement-breakpoint
CREATE INDEX "idx_reviews_curso" ON "Reviews" USING btree ("IDCurso");--> statement-breakpoint
CREATE INDEX "idx_reviews_utilizador" ON "Reviews" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_reviews_rating" ON "Reviews" USING btree ("Rating");--> statement-breakpoint
CREATE INDEX "idx_session_userId" ON "Session" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "TokenResetSenha";--> statement-breakpoint
ALTER TABLE "Utilizadores" DROP COLUMN "ExpiracaoTokenReset";