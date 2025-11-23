import { Badge } from '@/components/ui/badge';
import type { TipoPerfil } from '@/types';

interface PerfilBadgeProps {
  perfil: TipoPerfil;
  className?: string;
}

/**
 * Badge para tipo de perfil de usuário
 * Diferencia visualmente Admin de Formando
 */
export function PerfilBadge({ perfil, className }: PerfilBadgeProps) {
  const config = {
    admin: {
      label: 'Administrador',
      className: 'border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90',
    },
    formando: {
      label: 'Formando',
      className: 'border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80',
    },
  };

  const { label, className: badgeClassName } = config[perfil];

  return (
    <Badge variant="outline" className={`${badgeClassName} ${className || ''}`}>
      {label}
    </Badge>
  );
}
