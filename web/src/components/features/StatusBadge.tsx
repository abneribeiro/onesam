import { Badge } from '@/components/ui/badge';
import type { EstadoInscricao, EstadoCurso } from '@/types';

interface EstadoBadgeProps {
  estado: EstadoInscricao;
}

interface EstadoCursoBadgeProps {
  estado: EstadoCurso;
}

interface NivelBadgeProps {
  nivel: string;
}

/**
 * Badge para estados de inscricao
 * Usa cores semanticas do design system
 */
export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const variants: Record<
    EstadoInscricao,
    { label: string; className: string }
  > = {
    pendente: {
      label: 'Pendente',
      className: 'border-warning/30 bg-warning/10 text-warning-foreground dark:text-warning hover:bg-warning/20'
    },
    aceite: {
      label: 'Aceite',
      className: 'border-transparent bg-success text-success-foreground hover:bg-success/90'
    },
    rejeitada: {
      label: 'Rejeitada',
      className: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90'
    },
    cancelada: {
      label: 'Cancelada',
      className: 'border-border bg-secondary text-secondary-foreground hover:bg-secondary/80'
    },
  };

  const config = variants[estado];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

/**
 * Badge para estados de curso
 * Usa cores semanticas do design system
 */
export function EstadoCursoBadge({ estado }: EstadoCursoBadgeProps) {
  const variants: Record<
    EstadoCurso,
    { label: string; className: string }
  > = {
    planeado: {
      label: 'Planeado',
      className: 'border-info/30 bg-info/10 text-info dark:text-info hover:bg-info/20'
    },
    em_curso: {
      label: 'Em Curso',
      className: 'border-transparent bg-success text-success-foreground hover:bg-success/90'
    },
    terminado: {
      label: 'Terminado',
      className: 'border-border bg-muted text-muted-foreground hover:bg-muted/80'
    },
    arquivado: {
      label: 'Arquivado',
      className: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90'
    },
  };

  const config = variants[estado];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

/**
 * Badge para niveis de curso
 * Usa cores semanticas do design system
 */
export function NivelBadge({ nivel }: NivelBadgeProps) {
  const badges: Record<string, { label: string; className: string }> = {
    iniciante: {
      label: 'Iniciante',
      className: 'border-success/30 bg-success/10 text-success dark:text-success hover:bg-success/20'
    },
    intermedio: {
      label: 'Intermedio',
      className: 'border-accent/30 bg-accent/10 text-accent dark:text-accent hover:bg-accent/20'
    },
    avancado: {
      label: 'Avancado',
      className: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90'
    },
  };

  const config = badges[nivel] ?? badges['iniciante']!;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
