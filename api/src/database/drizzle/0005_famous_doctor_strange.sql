CREATE TABLE "Certificados" (
	"IDCertificado" serial PRIMARY KEY NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"IDCurso" integer NOT NULL,
	"CodigoHash" varchar(64) NOT NULL,
	"DataEmissao" timestamp DEFAULT now() NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Certificados_CodigoHash_unique" UNIQUE("CodigoHash"),
	CONSTRAINT "unique_certificado_utilizador_curso" UNIQUE("IDUtilizador","IDCurso")
);
--> statement-breakpoint
CREATE TABLE "QuizPerguntas" (
	"IDPergunta" serial PRIMARY KEY NOT NULL,
	"IDQuiz" integer NOT NULL,
	"Pergunta" text NOT NULL,
	"OpcoesJson" text NOT NULL,
	"RespostaCorreta" integer NOT NULL,
	"Ordem" integer DEFAULT 0 NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "QuizTentativas" (
	"IDTentativa" serial PRIMARY KEY NOT NULL,
	"IDQuiz" integer NOT NULL,
	"IDUtilizador" integer NOT NULL,
	"RespostasJson" text NOT NULL,
	"Nota" integer NOT NULL,
	"Aprovado" boolean DEFAULT false NOT NULL,
	"Tentativa" integer DEFAULT 1 NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Quizzes" (
	"IDQuiz" serial PRIMARY KEY NOT NULL,
	"IDAula" integer NOT NULL,
	"Titulo" varchar(255) NOT NULL,
	"NotaMinima" integer DEFAULT 10 NOT NULL,
	"MaxTentativas" integer DEFAULT 3 NOT NULL,
	"DataCriacao" timestamp DEFAULT now() NOT NULL,
	"DataAtualizacao" timestamp
);
--> statement-breakpoint
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_IDCurso_Cursos_IDCurso_fk" FOREIGN KEY ("IDCurso") REFERENCES "public"."Cursos"("IDCurso") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuizPerguntas" ADD CONSTRAINT "QuizPerguntas_IDQuiz_Quizzes_IDQuiz_fk" FOREIGN KEY ("IDQuiz") REFERENCES "public"."Quizzes"("IDQuiz") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuizTentativas" ADD CONSTRAINT "QuizTentativas_IDQuiz_Quizzes_IDQuiz_fk" FOREIGN KEY ("IDQuiz") REFERENCES "public"."Quizzes"("IDQuiz") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuizTentativas" ADD CONSTRAINT "QuizTentativas_IDUtilizador_Utilizadores_IDUtilizador_fk" FOREIGN KEY ("IDUtilizador") REFERENCES "public"."Utilizadores"("IDUtilizador") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Quizzes" ADD CONSTRAINT "Quizzes_IDAula_Aulas_IDAula_fk" FOREIGN KEY ("IDAula") REFERENCES "public"."Aulas"("IDAula") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_certificados_utilizador" ON "Certificados" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_certificados_curso" ON "Certificados" USING btree ("IDCurso");--> statement-breakpoint
CREATE INDEX "idx_certificados_codigo" ON "Certificados" USING btree ("CodigoHash");--> statement-breakpoint
CREATE INDEX "idx_quiz_perguntas_quiz" ON "QuizPerguntas" USING btree ("IDQuiz");--> statement-breakpoint
CREATE INDEX "idx_quiz_perguntas_ordem" ON "QuizPerguntas" USING btree ("IDQuiz","Ordem");--> statement-breakpoint
CREATE INDEX "idx_quiz_tentativas_quiz" ON "QuizTentativas" USING btree ("IDQuiz");--> statement-breakpoint
CREATE INDEX "idx_quiz_tentativas_utilizador" ON "QuizTentativas" USING btree ("IDUtilizador");--> statement-breakpoint
CREATE INDEX "idx_quiz_tentativas_utilizador_quiz" ON "QuizTentativas" USING btree ("IDUtilizador","IDQuiz");--> statement-breakpoint
CREATE INDEX "idx_quizzes_aula" ON "Quizzes" USING btree ("IDAula");