import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

/**
 * Input de senha com botão para mostrar/ocultar
 * Toggle entre type="password" e type="text"
 */
export function PasswordInput({
  value,
  onChange,
  className,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="pr-10"
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        tabIndex={-1} // Não incluir no tab order
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
