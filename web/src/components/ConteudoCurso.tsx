import { useModulosPorCurso, useCreateModulo } from '@/hooks/queries/useModulos';
import { useAulasPorModulo, useCreateAula, useMarcarAulaConcluida } from '@/hooks/queries/useAulas';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';

interface ConteudoCursoProps {
  cursoId: number;
  isAdmin?: boolean;
}

export function ConteudoCurso({ cursoId, isAdmin = false }: ConteudoCursoProps) {
  const { data: modulos, isLoading } = useModulosPorCurso(cursoId, true);
  const createModulo = useCreateModulo();

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Conteúdo do Curso</h2>
        {isAdmin && (
          <Button onClick={() => createModulo.mutate({ titulo: 'Novo Módulo', IDCurso: cursoId })}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Módulo
          </Button>
        )}
      </div>

      {modulos?.map((modulo) => (
        <Card key={modulo.id}>
          <CardHeader>
            <CardTitle>{modulo.titulo}</CardTitle>
            {modulo.descricao && <CardDescription>{modulo.descricao}</CardDescription>}
          </CardHeader>
          <CardContent>
            <ModuloContent moduloId={modulo.id} isAdmin={isAdmin} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ModuloContent({ moduloId, isAdmin }: { moduloId: number; isAdmin: boolean }) {
  const { data: aulas } = useAulasPorModulo(moduloId);
  const createAula = useCreateAula();
  const marcarConcluida = useMarcarAulaConcluida();

  return (
    <div className="space-y-2">
      {aulas?.map((aula) => (
        <div key={aula.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex-1">
            <h4 className="font-medium">{aula.titulo}</h4>
            <p className="text-sm text-muted-foreground">{aula.tipo}</p>
          </div>
          {!isAdmin && (
            <Button
              size="sm"
              variant={aula.progresso?.concluida ? 'default' : 'outline'}
              onClick={() => marcarConcluida.mutate({ aulaId: aula.id })}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => createAula.mutate({ titulo: 'Nova Aula', tipo: 'video', IDModulo: moduloId })}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Aula
        </Button>
      )}
    </div>
  );
}
