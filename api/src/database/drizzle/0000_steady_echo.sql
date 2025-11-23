CREATE TYPE "public"."estado_curso_enum" AS ENUM('planeado', 'em_curso', 'terminado', 'arquivado');--> statement-breakpoint
CREATE TYPE "public"."estado_inscricao_enum" AS ENUM('pendente', 'aceite', 'rejeitada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."nivel_curso_enum" AS ENUM('iniciante', 'intermedio', 'avancado');--> statement-breakpoint
CREATE TYPE "public"."perfil_enum" AS ENUM('gestor', 'formador', 'formando');--> statement-breakpoint
CREATE TYPE "public"."tipo_avaliacao_enum" AS ENUM('participacao', 'trabalho', 'exame');--> statement-breakpoint
CREATE TYPE "public"."tipo_conteudo_enum" AS ENUM('video', 'documento', 'link', 'texto');--> statement-breakpoint
CREATE TYPE "public"."tipo_curso_enum" AS ENUM('sincrono', 'assincrono');--> statement-breakpoint
CREATE TYPE "public"."tipo_notificacao_enum" AS ENUM('sistema', 'curso', 'avaliacao', 'certificado', 'mensagem');--> statement-breakpoint
CREATE TABLE "Areas" (
	"IDArea" serial PRIMARY KEY NOT NULL,
	"NomeArea" varchar(255) NOT NULL,
	"Descricao" text,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
CREATE TABLE "Avaliacoes" (
	"IDAvaliacaoFinal" serial PRIMARY KEY NOT NULL,
	"IDCurso" integer NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"TipoAvaliacao" "tipo_avaliacao_enum" NOT NULL,
	"Nota" integer,
	"Aprovado" boolean DEFAULT false NOT NULL,
	"Feedback" text,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
CREATE TABLE "Categorias" (
	"IDCategoria" serial PRIMARY KEY NOT NULL,
	"IDArea" integer,
	"NomeCategoria" varchar(255) NOT NULL,
	"Descricao" text,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
CREATE TABLE "Certificados" (
	"IDCertificado" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"IDCurso" integer NOT NULL,
	"IDAvaliacaoFinal" integer,
	"Codigo" varchar(100) NOT NULL,
	"DataEmissao" timestamp DEFAULT now() NOT NULL,
	"UrlPDF" varchar(500),
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Certificados_Codigo_unique" UNIQUE("Codigo")
);
--> statement-breakpoint
CREATE TABLE "Conteudos" (
	"IDConteudo" serial PRIMARY KEY NOT NULL,
	"IDCurso" integer NOT NULL,
	"Titulo" varchar(255) NOT NULL,
	"Descricao" text,
	"Tipo" "tipo_conteudo_enum" NOT NULL,
	"URL" varchar(500),
	"Ordem" integer DEFAULT 0 NOT NULL,
	"Duracao" integer,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
CREATE TABLE "Cursos" (
	"IDCurso" serial PRIMARY KEY NOT NULL,
	"IDArea" integer,
	"IDCategoria" integer,
	"IDFormador" integer,
	"NomeCurso" varchar(255) NOT NULL,
	"Descricao" text,
	"ImagemCurso" varchar(500),
	"Tipo" "tipo_curso_enum" NOT NULL,
	"Certificado" boolean DEFAULT false NOT NULL,
	"DataInicio" timestamp NOT NULL,
	"DataFim" timestamp NOT NULL,
	"DataLimiteInscricao" timestamp NOT NULL,
	"Estado" "estado_curso_enum" DEFAULT 'planeado' NOT NULL,
	"Visivel" boolean DEFAULT true NOT NULL,
	"Nivel" "nivel_curso_enum" DEFAULT 'iniciante' NOT NULL,
	"Link" varchar(500),
	"Plataforma" varchar(100),
	"LimiteVagas" integer,
	"PontosRecompensa" integer DEFAULT 10,
	"CargaHoraria" integer,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
CREATE TABLE "Inscricoes" (
	"IDInscricao" serial PRIMARY KEY NOT NULL,
	"IDCurso" integer NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"DataInscricao" timestamp DEFAULT now() NOT NULL,
	"Estado" "estado_inscricao_enum" DEFAULT 'pendente' NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
CREATE TABLE "Notificacoes" (
	"IDNotificacao" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"Tipo" "tipo_notificacao_enum" NOT NULL,
	"Titulo" varchar(255) NOT NULL,
	"Mensagem" text NOT NULL,
	"Lida" boolean DEFAULT false NOT NULL,
	"Link" varchar(500),
	"DataCriacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Utilizadores" (
	"IDUtilizador" serial PRIMARY KEY NOT NULL,
	"Nome" varchar(255) NOT NULL,
	"Email" varchar(255) NOT NULL,
	"PalavraPasse" varchar(255) NOT NULL,
	"Perfil" "perfil_enum" NOT NULL,
	"Avatar" varchar(500),
	"Ativo" boolean DEFAULT false NOT NULL,
	"TokenResetSenha" varchar(500),
	"ExpiracaoTokenReset" timestamp,
	"PrimeiraVez" boolean DEFAULT true NOT NULL,
	"Especialidade" varchar(255),
	"Biografia" text,
	"DataNascimento" timestamp,
	"Telefone" varchar(20),
	"Departamento" varchar(255),
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp,
	CONSTRAINT "Utilizadores_Email_unique" UNIQUE("Email")
);
--> statement-breakpoint
ALTER TABLE "Avaliacoes" ADD CONSTRAINT "Avaliacoes_IDCurso_Cursos_IDCurso_fk" FOREIGN KEY ("IDCurso") REFERENCES "public"."Cursos"("IDCurso") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Avaliacoes" ADD CONSTRAINT "Avaliacoes_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Categorias" ADD CONSTRAINT "Categorias_IDArea_Areas_IDArea_fk" FOREIGN KEY ("IDArea") REFERENCES "public"."Areas"("IDArea") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_IDCurso_Cursos_IDCurso_fk" FOREIGN KEY ("IDCurso") REFERENCES "public"."Cursos"("IDCurso") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_IDAvaliacaoFinal_Avaliacoes_IDAvaliacaoFinal_fk" FOREIGN KEY ("IDAvaliacaoFinal") REFERENCES "public"."Avaliacoes"("IDAvaliacaoFinal") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Conteudos" ADD CONSTRAINT "Conteudos_IDCurso_Cursos_IDCurso_fk" FOREIGN KEY ("IDCurso") REFERENCES "public"."Cursos"("IDCurso") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_IDArea_Areas_IDArea_fk" FOREIGN KEY ("IDArea") REFERENCES "public"."Areas"("IDArea") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_IDCategoria_Categorias_IDCategoria_fk" FOREIGN KEY ("IDCategoria") REFERENCES "public"."Categorias"("IDCategoria") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_IDFormador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDFormador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Inscricoes" ADD CONSTRAINT "Inscricoes_IDCurso_Cursos_IDCurso_fk" FOREIGN KEY ("IDCurso") REFERENCES "public"."Cursos"("IDCurso") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Inscricoes" ADD CONSTRAINT "Inscricoes_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notificacoes" ADD CONSTRAINT "Notificacoes_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;