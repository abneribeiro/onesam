import { useElegibilidadeCertificado, useDownloadCertificado } from '@/hooks/queries/useCertificados';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface CertificadoDownloadProps {
  cursoId: number;
  cursoNome: string;
  className?: string;
}

export function CertificadoDownload({ cursoId, cursoNome, className }: CertificadoDownloadProps) {
  const { data: elegibilidade, isLoading } = useElegibilidadeCertificado(cursoId);
  const downloadCertificado = useDownloadCertificado();

  const handleDownload = () => {
    downloadCertificado.mutate({ cursoId, cursoNome });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-sm">Verificando elegibilidade...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!elegibilidade?.podeGerar) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Complete todas as aulas do curso para obter o certificado</span>
          <Badge variant="secondary" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            Em progresso
          </Badge>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 text-green-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Certificado Disponível</span>
              <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluído
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Parabéns! Você concluiu o curso e pode baixar seu certificado.
            </p>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleDownload}
                disabled={downloadCertificado.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadCertificado.isPending ? 'Gerando...' : 'Baixar Certificado'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Baixar certificado em PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}