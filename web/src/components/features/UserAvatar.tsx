import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    nome: string;
    email?: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  online?: boolean;
  className?: string;
}

/**
 * Avatar de usuário com fallback para iniciais
 * Opcionalmente mostra indicador de status online
 */
export function UserAvatar({
  user,
  size = 'md',
  showStatus = false,
  online = false,
  className,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-20 w-20 text-2xl',
    xl: 'h-32 w-32 text-4xl',
  };

  const statusSizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
    xl: 'h-6 w-6',
  };

  // Gera iniciais do nome (primeira letra de cada palavra, máximo 2)
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .filter((_, i, arr) => i === 0 || i === arr.length - 1) // Primeira e última palavra
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.avatar} alt={user.nome} />
        <AvatarFallback className="font-semibold bg-[var(--muted)] text-[var(--muted-foreground)]">
          {getInitials(user.nome)}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            statusSizeClasses[size],
            online ? 'bg-[var(--success-500)]' : 'bg-[var(--muted)]'
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
