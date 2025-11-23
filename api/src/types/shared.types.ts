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

// Tipos de conteúdo (sincronizado com Schema DB)
export type TipoConteudo = 'video' | 'documento' | 'link' | 'texto' | 'quiz';

// Tipos de avaliação (sincronizado com Schema DB)
export type TipoAvaliacao = 'participacao' | 'trabalho' | 'exame';

// Tipos de notificação (sincronizado com Schema DB)
export type TipoNotificacao = 'inscricao_aprovada' | 'inscricao_rejeitada' | 'novo_curso' | 'lembrete' | 'sistema';

// Interface base de Utilizador
export interface UtilizadorBase {
  id: number;
  nome: string;
  email: string;
  avatar: string | null;
  ativo: boolean;
  tipoPerfil: TipoPerfil;
  dataCriacao: Date;
}

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

// Interface de Conteúdo (sincronizado com Schema DB)
export interface ConteudoBase {
  id: number;
  titulo: string;
  descricao: string | null;
  tipo: TipoConteudo;
  url: string | null;
  ordem: number;
  duracao: number | null;
  cursoId: number;
  dataCriacao: Date;
}

// Interface de Avaliação
export interface AvaliacaoBase {
  id: number;
  titulo: string;
  descricao: string;
  tipo: TipoAvaliacao;
  peso: number;
  notaMaxima: number;
  dataAbertura: Date;
  dataFecho: Date;
  tentativasMaximas: number | null;
  cursoId: number;
  conteudoId: number | null;
  dataCriacao: Date;
}

// Interface de Certificado
export interface CertificadoBase {
  id: number;
  codigo: string;
  formandoId: number;
  cursoId: number;
  notaFinal: number;
  dataEmissao: Date;
  urlCertificado: string;
}

// Interface de Notificação
export interface NotificacaoBase {
  id: number;
  utilizadorId: number;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  lida: boolean;
  dataCriacao: Date;
}

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

// Tipos para formulários (dados de input) - sincronizado com Schema DB - simplificado
export interface CursoInput {
  nome: string;
  descricao: string;
  nivel: NivelCurso;
  dataInicio: string;
  dataFim: string;
  dataLimiteInscricao: string;
  limiteVagas?: number;
  cargaHoraria: number;
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
  perfil: 'formando'; // Apenas formandos podem se auto-registrar
  linkedin?: string;
}

// Tipos de filtros
export interface CursoFiltros {
  estado?: EstadoCurso;
  nivel?: NivelCurso;
  categoriaId?: number;
  areaId?: number;
}

export interface NotificacaoFiltros {
  lida?: boolean;
  tipo?: TipoNotificacao;
  limite?: number;
  pagina?: number;
}
