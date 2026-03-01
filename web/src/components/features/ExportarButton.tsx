import { useMemo } from 'react';
import { useExportCSV } from '@/hooks/queries/useAnalytics';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download, FileSpreadsheet } from 'lucide-react';

interface ExportarButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
}

export function ExportarButton({
  variant = 'outline',
  size = 'default',
  className,
  showText = true
}: ExportarButtonProps) {
  const exportCSV = useExportCSV();

  const handleExport = () => {
    exportCSV.mutate();
  };

  const buttonContent = useMemo(() => (
    <>
      {exportCSV.isPending ? (
        <Download className="h-4 w-4 animate-pulse" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {exportCSV.isPending ? 'Exportando...' : 'Exportar CSV'}
        </span>
      )}
    </>
  ), [exportCSV.isPending, showText]);

  if (!showText) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleExport}
              disabled={exportCSV.isPending}
              variant={variant}
              size={size}
              className={className}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar relatório em CSV</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      onClick={handleExport}
      disabled={exportCSV.isPending}
      variant={variant}
      size={size}
      className={className}
    >
      {buttonContent}
    </Button>
  );
}