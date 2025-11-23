/**
 * Tipos compartilhados entre Frontend e Backend
 * Este arquivo contém tipos que devem ser sincronizados entre as duas camadas
 */

// Perfis de utilizador (simplificado: apenas admin e formando)
export type TipoPerfil = 'admin' | 'formando';

// Estados de curso
export type EstadoCurso = 'planeado' | 'em_curso' | 'terminado' | 'arquivado';
export type NivelCurso = 'iniciante' | 'intermedio' | 'avancado';

// Estados de inscrição (sincronizado com Schema DB)
export type EstadoInscricao = 'pendente' | 'aceite' | 'rejeitada' | 'cancelada';

// Interface base de Utilizador
export interface UtilizadorBase {
  id: number;
  nome: string;
  email: string;
  emailVerified: boolean;
  avatar: string | null;
  ativo: boolean;
  tipoPerfil: TipoPerfil;
  perfilId?: number;
  dataCriacao: Date;
  dataAtualizacao?: Date;
}

// Alias para uso comum
export type Utilizador = UtilizadorBase;

// Interface de Curso (sincronizado com Schema DB - simplificado)
export interface CursoBase {
  id: number;
  nome: string;
  descricao: string;
  estado: EstadoCurso;
  nivel: NivelCurso;
  visivel: boolean;
  certificado: boolean;
  notaMinimaAprovacao: number;
  imagemCurso: string | null;
  dataInicio: Date;
  dataFim: Date;
  dataLimiteInscricao: Date;
  limiteVagas: number | null;
  cargaHoraria: number;
  areaId: number | null;
  categoriaId: number | null;
  dataCriacao: Date;
}

// Interface de Inscrição (sincronizado com Schema DB)
export interface InscricaoBase {
  id: number;
  utilizadorId: number;
  cursoId: number;
  estado: EstadoInscricao;
  dataInscricao: Date;
  dataCriacao: Date;
}

export type TipoNotificacao = 'inscricao_aprovada' | 'inscricao_rejeitada' | 'novo_curso' | 'lembrete' | 'sistema';

export interface Notificacao {
  id: number;
  utilizadorId: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  linkAcao: string | null;
  dataCriacao: Date;
  dataLeitura: Date | null;
}

// Interfaces com relations
export interface CursoComRelations extends CursoBase {
  area?: AreaBase;
  categoria?: CategoriaBase;
  inscricoes?: InscricaoBase[];
  modulos?: Array<{
    id: number;
    titulo: string;
    descricao: string | null;
    ordem: number;
    aulas?: Array<{
      id: number;
      titulo: string;
      duracao: number | null;
      tipo: 'video' | 'documento' | 'link' | 'texto' | 'quiz';
    }>;
  }>;
  _count?: {
    inscricoes: number;
  };
}

export interface InscricaoComRelations extends InscricaoBase {
  curso?: CursoBase;
  utilizador?: Pick<UtilizadorBase, 'id' | 'nome' | 'email' | 'avatar'>;
}

// Token payload para JWT
export interface TokenPayload {
  id: number;
  email: string;
  tipoPerfil: TipoPerfil;
  perfilId: number;
  iat?: number;
  exp?: number;
}

// Aliases para uso comum
export type Curso = CursoBase;
export type Inscricao = InscricaoBase;
export type Categoria = CategoriaBase;
export type Area = AreaBase;

// Interface de Categoria
export interface CategoriaBase {
  id: number;
  nome: string;
  descricao: string | null;
  areaId: number | null;
}

// Interface de Área
export interface AreaBase {
  id: number;
  nome: string;
  descricao: string | null;
}

// Tipos de resposta da API (padrão português)
export interface ApiResponse<T> {
  dados?: T;
  mensagem?: string;
}

export interface ApiError {
  erro: string;
  detalhes?: string | string[];
}

// Tipos para formulários (dados de input) - sincronizado com Schema DB
export interface CursoInput {
  nome: string;
  descricao?: string;
  nivel?: NivelCurso;
  dataInicio: string;
  dataFim: string;
  dataLimiteInscricao?: string | null;
  limiteVagas?: number | null;
  cargaHoraria?: number;
  notaMinimaAprovacao?: number;
  certificado?: boolean;
  visivel?: boolean;
  IDArea: number;
  IDCategoria: number;
}

export interface InscricaoInput {
  IDCurso: number;
}

export interface LoginInput {
  email: string;
  palavrapasse: string;
}

export interface RegisterInput {
  nome: string;
  email: string;
  palavrapasse: string;
  tipoPerfil?: 'formando'; // Apenas formandos podem se auto-registrar
  linkedin?: string;
}

// Tipos de filtros
export interface CursoFiltros {
  search?: string;
  estado?: EstadoCurso;
  nivel?: NivelCurso;
  categoriaId?: number;
  areaId?: number;
}
