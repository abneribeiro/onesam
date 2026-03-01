CREATE INDEX "idx_cursos_data_limite_inscricao" ON "Cursos" USING btree ("DataLimiteInscricao");--> statement-breakpoint
CREATE INDEX "idx_cursos_area_categoria" ON "Cursos" USING btree ("IDArea","IDCategoria");--> statement-breakpoint
ALTER TABLE "Areas" ADD CONSTRAINT "Areas_NomeArea_unique" UNIQUE("NomeArea");--> statement-breakpoint
ALTER TABLE "Categorias" ADD CONSTRAINT "unique_categoria_nome_area" UNIQUE("NomeCategoria","IDArea");