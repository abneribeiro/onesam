-- ✅ CORREÇÃO 9: CHECK constraint para garantir dataFim > dataInicio
ALTER TABLE "Cursos"
ADD CONSTRAINT check_cursos_datas
CHECK ("DataFim" > "DataInicio");

-- ✅ CORREÇÃO 9: CHECK constraint para garantir dataLimiteInscricao <= dataInicio
ALTER TABLE "Cursos"
ADD CONSTRAINT check_cursos_limite_inscricao
CHECK ("DataLimiteInscricao" <= "DataInicio");

-- ✅ CORREÇÃO 6: Função e trigger para prevenir múltiplos perfis por utilizador
-- Nota: Esta é uma abordagem usando triggers PostgreSQL
-- Garante que um utilizador só pode ter UM perfil (gestor OU formador OU formando)

CREATE OR REPLACE FUNCTION check_single_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se o utilizador já tem perfil em outra tabela
    IF TG_TABLE_NAME = 'Gestores' THEN
        IF EXISTS (SELECT 1 FROM "Formadores" WHERE "IDUtilizador" = NEW."IDUtilizador") OR
           EXISTS (SELECT 1 FROM "Formandos" WHERE "IDUtilizador" = NEW."IDUtilizador") THEN
            RAISE EXCEPTION 'Utilizador já possui um perfil em outra categoria';
        END IF;
    ELSIF TG_TABLE_NAME = 'Formadores' THEN
        IF EXISTS (SELECT 1 FROM "Gestores" WHERE "IDUtilizador" = NEW."IDUtilizador") OR
           EXISTS (SELECT 1 FROM "Formandos" WHERE "IDUtilizador" = NEW."IDUtilizador") THEN
            RAISE EXCEPTION 'Utilizador já possui um perfil em outra categoria';
        END IF;
    ELSIF TG_TABLE_NAME = 'Formandos' THEN
        IF EXISTS (SELECT 1 FROM "Gestores" WHERE "IDUtilizador" = NEW."IDUtilizador") OR
           EXISTS (SELECT 1 FROM "Formadores" WHERE "IDUtilizador" = NEW."IDUtilizador") THEN
            RAISE EXCEPTION 'Utilizador já possui um perfil em outra categoria';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em cada tabela de perfil
CREATE TRIGGER enforce_single_profile_gestor
BEFORE INSERT OR UPDATE ON "Gestores"
FOR EACH ROW EXECUTE FUNCTION check_single_profile();

CREATE TRIGGER enforce_single_profile_formador
BEFORE INSERT OR UPDATE ON "Formadores"
FOR EACH ROW EXECUTE FUNCTION check_single_profile();

CREATE TRIGGER enforce_single_profile_formando
BEFORE INSERT OR UPDATE ON "Formandos"
FOR EACH ROW EXECUTE FUNCTION check_single_profile();

-- Comentários para documentação
COMMENT ON CONSTRAINT check_cursos_datas ON "Cursos" IS
'Garante que a data de fim do curso é posterior à data de início';

COMMENT ON CONSTRAINT check_cursos_limite_inscricao ON "Cursos" IS
'Garante que a data limite de inscrição é antes ou igual à data de início do curso';

COMMENT ON FUNCTION check_single_profile() IS
'Função trigger que previne um utilizador de ter múltiplos perfis (gestor, formador, formando) simultaneamente';
