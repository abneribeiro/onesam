import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { EstadoCurso, EstadoInscricao, NivelCurso, TipoPerfil } from '../types';

/**
 * Formata data para exibição (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: pt });
}

/**
 * Formata data e hora para exibição (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: pt });
}

/**
 * Formata data relativa (ex: "há 2 horas")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: pt });
}

/**
 * Formata estado do curso para exibição
 */
export function formatEstadoCurso(estado: EstadoCurso): string {
  const map: Record<EstadoCurso, string> = {
    planeado: 'Planeado',
    em_curso: 'Em Curso',
    terminado: 'Terminado',
    arquivado: 'Arquivado',
  };
  return map[estado] || estado;
}

/**
 * Formata nível do curso para exibição
 */
export function formatNivelCurso(nivel: NivelCurso): string {
  const map: Record<NivelCurso, string> = {
    iniciante: 'Iniciante',
    intermedio: 'Intermédio',
    avancado: 'Avançado',
  };
  return map[nivel] || nivel;
}

/**
 * Formata estado da inscrição para exibição
 */
export function formatEstadoInscricao(estado: EstadoInscricao): string {
  const map: Record<EstadoInscricao, string> = {
    pendente: 'Pendente',
    aceite: 'Aceite',
    rejeitada: 'Rejeitada',
    cancelada: 'Cancelada',
  };
  return map[estado] || estado;
}

/**
 * Formata perfil do utilizador para exibição
 */
export function formatPerfil(perfil: TipoPerfil): string {
  const map: Record<TipoPerfil, string> = {
    admin: 'Administrador',
    formando: 'Formando',
  };
  return map[perfil] || perfil;
}

/**
 * Formata duração em minutos para horas/minutos
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Formata tamanho de arquivo em bytes para KB/MB/GB
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formata número de telefone (adiciona espaços)
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  if (cleaned.length === 12 && cleaned.startsWith('351')) {
    return `+351 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  return phone;
}

/**
 * Trunca texto e adiciona reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
