import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children || (actionLabel && onAction && (
        <Button onClick={onAction}>
          {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
          {actionLabel}
        </Button>
      ))}
    </div>
  );
}
