import { addDays, subDays } from 'date-fns';

export interface CourseData {
  areaId: number;
  categoriaId: number;
  nome: string;
  descricao: string;
  estado: 'planeado' | 'em_curso' | 'terminado' | 'arquivado';
  nivel: 'iniciante' | 'intermedio' | 'avancado';
  cargaHoraria: number;
  limiteVagas?: number;
  dataInicio: Date;
  dataFim: Date;
  dataLimiteInscricao: Date;
  visivel: boolean;
  certificado: boolean;
  imagemCurso?: string;
  notaMinimaAprovacao: number;
}

export interface ModuleData {
  cursoId: number;
  titulo: string;
  descricao: string;
  ordem: number;
}

export interface LessonData {
  moduloId: number;
  titulo: string;
  tipo: 'video' | 'texto' | 'quiz' | 'documento';
  url?: string;
  conteudo?: string;
  ordem: number;
  duracao?: number;
}

export function generateCourseData(areaId: number, categoriaId: number, courseConfig: {
  nome: string;
  descricao: string;
  nivel: 'iniciante' | 'intermedio' | 'avancado';
  cargaHoraria: number;
}): CourseData {
  const baseDate = new Date();
  const isActive = Math.random() > 0.3; // 70% chance of being active

  return {
    areaId,
    categoriaId,
    nome: courseConfig.nome,
    descricao: courseConfig.descricao,
    estado: isActive ? (Math.random() > 0.5 ? 'em_curso' : 'planeado') : 'terminado',
    nivel: courseConfig.nivel,
    cargaHoraria: courseConfig.cargaHoraria,
    limiteVagas: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 20 : undefined,
    dataInicio: isActive ? addDays(baseDate, Math.floor(Math.random() * 60) - 30) : subDays(baseDate, Math.floor(Math.random() * 180)),
    dataFim: isActive ? addDays(baseDate, Math.floor(Math.random() * 90) + 30) : subDays(baseDate, Math.floor(Math.random() * 90)),
    dataLimiteInscricao: isActive ? addDays(baseDate, Math.floor(Math.random() * 14) + 7) : subDays(baseDate, Math.floor(Math.random() * 200) + 10),
    visivel: true,
    certificado: Math.random() > 0.3, // 70% offer certificates
    imagemCurso: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
    notaMinimaAprovacao: 10
  };
}

export function generateModuleData(cursoId: number, moduleConfig: {
  titulo: string;
  descricao: string;
  ordem: number;
}): ModuleData {
  return {
    cursoId,
    titulo: moduleConfig.titulo,
    descricao: moduleConfig.descricao,
    ordem: moduleConfig.ordem,
  };
}

export function generateLessonData(moduloId: number, lessonConfig: {
  titulo: string;
  tipo: 'video' | 'texto' | 'quiz' | 'documento';
  ordem: number;
  duracao?: number;
  customUrl?: string;
  customContent?: string;
}): LessonData {
  const { titulo, tipo, ordem, duracao, customUrl, customContent } = lessonConfig;

  // Generate appropriate content based on lesson type
  let url: string | undefined;
  let conteudo: string | undefined;

  switch (tipo) {
    case 'video':
      url = customUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Placeholder
      break;
    case 'documento':
      url = customUrl || `https://docs.google.com/document/d/${titulo.toLowerCase().replace(/\s+/g, '-')}`;
      break;
    case 'quiz':
      url = customUrl || `https://quiz.example.com/${titulo.toLowerCase().replace(/\s+/g, '-')}`;
      break;
    case 'texto':
      conteudo = customContent || `Conteúdo da aula: ${titulo}`;
      break;
  }

  return {
    moduloId,
    titulo,
    tipo,
    url,
    conteudo,
    ordem,
    duracao: duracao || (tipo === 'video' ? Math.floor(Math.random() * 30) + 15 : undefined)
  };
}

// Predefined course templates for common areas
export function getWebDevelopmentCourses(areaId: number, categoriaId: number): CourseData[] {
  return [
    generateCourseData(areaId, categoriaId, {
      nome: 'React 19 - Fundamentos e Novidades',
      descricao: 'Aprenda as últimas funcionalidades do React 19, incluindo Server Components, Actions e concurrent features.',
      nivel: 'intermedio',
      cargaHoraria: 40,
    }),
    generateCourseData(areaId, categoriaId, {
      nome: 'Node.js com TypeScript',
      descricao: 'Desenvolvimento backend robusto com Node.js e TypeScript para APIs modernas.',
      nivel: 'intermedio',
      cargaHoraria: 35,
    })
  ];
}