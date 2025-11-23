'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurso } from '@/hooks/queries/useCursos';
import { useModulosPorCurso } from '@/hooks/queries/useModulos';
import { useProgressoCurso, useMarcarAulaConcluida } from '@/hooks/queries/useAulas';
import type { Aula } from '@/services/aula.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Link as LinkIcon,
  File,
  HelpCircle,
  Play,
  PanelLeftClose,
  PanelLeft,
  Clock,
  BookOpen,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AulaViewer } from '@/components/content/AulaViewer';

export default function FormandoCursoConteudo() {
  const params = useParams();
  const router = useRouter();
  const cursoId = Number(params.id);

  const { data: curso, isLoading: loadingCurso } = useCurso(cursoId);
  const { data: modulos, isLoading: loadingModulos } = useModulosPorCurso(cursoId, true);
  const { data: progresso } = useProgressoCurso(cursoId);

  // Compute initial values from modulos
  const initialState = useMemo(() => {
    if (modulos && modulos.length > 0) {
      return {
        openModulos: [modulos[0].id.toString()],
        selectedAula: modulos[0].aulas?.[0] ?? null
      };
    }
    return { openModulos: [] as string[], selectedAula: null as Aula | null };
  }, [modulos]);

  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [openModulos, setOpenModulos] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const marcarConcluida = useMarcarAulaConcluida();

  // Use computed initial values if user hasn't interacted yet
  const effectiveOpenModulos = hasUserInteracted ? openModulos : initialState.openModulos;
  const effectiveSelectedAula = hasUserInteracted ? selectedAula : initialState.selectedAula;

  const toggleModulo = (moduloId: string) => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      // Initialize with current effective state
      setOpenModulos(effectiveOpenModulos.includes(moduloId)
        ? effectiveOpenModulos.filter((id) => id !== moduloId)
        : [...effectiveOpenModulos, moduloId]
      );
      setSelectedAula(effectiveSelectedAula);
    } else {
      setOpenModulos((prev) =>
        prev.includes(moduloId)
          ? prev.filter((id) => id !== moduloId)
          : [...prev, moduloId]
      );
    }
  };

  const handleSelectAula = (aula: Aula) => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      setOpenModulos(effectiveOpenModulos);
    }
    setSelectedAula(aula);
  };

  const handleMarcarConcluida = async () => {
    if (effectiveSelectedAula && !effectiveSelectedAula.progresso?.concluida) {
      await marcarConcluida.mutateAsync({ aulaId: effectiveSelectedAula.id });
    }
  };

  const getAulaIcon = (tipo: Aula['tipo']) => {
    const icons = {
      video: Video,
      documento: File,
      link: LinkIcon,
      texto: FileText,
      quiz: HelpCircle
    };
    return icons[tipo] || FileText;
  };

  const getAulaTypeLabel = (tipo: Aula['tipo']) => {
    const labels = {
      video: 'Vídeo',
      documento: 'Documento',
      link: 'Link',
      texto: 'Texto',
      quiz: 'Quiz'
    };
    return labels[tipo] || 'Conteúdo';
  };

  if (loadingCurso || loadingModulos) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Curso não encontrado</h2>
          <p className="text-muted-foreground mb-4">O curso solicitado não existe ou foi removido.</p>
          <Button onClick={() => router.back()}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const percentualCompleto = progresso?.percentual || 0;
  const totalAulas = progresso?.totalAulas || 0;
  const aulasConcluidas = progresso?.aulasConcluidas || 0;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container max-w-full px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{curso.nome}</h1>
              <p className="text-sm text-muted-foreground truncate hidden sm:block">{curso.descricao}</p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{percentualCompleto}%</p>
                  <p className="text-xs text-muted-foreground">Completo</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">
                  <span className="font-semibold">{aulasConcluidas}</span>
                  <span className="text-muted-foreground">/{totalAulas} aulas</span>
                </span>
              </div>
            </div>
          </div>
          {/* Mobile Progress */}
          <div className="md:hidden mt-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{aulasConcluidas}/{totalAulas} aulas</span>
              <span className="font-semibold">{percentualCompleto}%</span>
            </div>
            <Progress value={percentualCompleto} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            'border-r bg-muted/30 transition-all duration-300 flex flex-col',
            sidebarCollapsed ? 'w-0 md:w-14' : 'w-full md:w-80 lg:w-96'
          )}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b flex items-center justify-between shrink-0">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Conteúdo do Curso</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Sidebar Content */}
          {!sidebarCollapsed && (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {!modulos || modulos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhum conteúdo disponível</p>
                  </div>
                ) : (
                  modulos.map((modulo, index) => {
                    const aulas = modulo.aulas || [];
                    const aulasConcluidasModulo = aulas.filter((a) => a.progresso?.concluida).length;
                    const isOpen = effectiveOpenModulos.includes(modulo.id.toString());
                    const moduloProgress = aulas.length > 0 ? (aulasConcluidasModulo / aulas.length) * 100 : 0;

                    return (
                      <Collapsible
                        key={modulo.id}
                        open={isOpen}
                        onOpenChange={() => toggleModulo(modulo.id.toString())}
                      >
                        <Card className="overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <div className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-sm truncate">{modulo.titulo}</h3>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Progress value={moduloProgress} className="h-1.5 flex-1" />
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                      {aulasConcluidasModulo}/{aulas.length}
                                    </Badge>
                                  </div>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 text-muted-foreground transition-transform shrink-0',
                                    isOpen && 'rotate-180'
                                  )}
                                />
                              </div>
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <Separator />
                            <div className="p-1">
                              {aulas.map((aula) => {
                                const isConcluida = aula.progresso?.concluida || false;
                                const isSelected = effectiveSelectedAula?.id === aula.id;
                                const IconComponent = getAulaIcon(aula.tipo);

                                return (
                                  <div
                                    key={aula.id}
                                    className={cn(
                                      'flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-all group',
                                      isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent'
                                    )}
                                    onClick={() => handleSelectAula(aula)}
                                  >
                                    <div
                                      className={cn(
                                        'relative flex items-center justify-center h-8 w-8 rounded-md shrink-0',
                                        isSelected
                                          ? 'bg-primary-foreground/20'
                                          : isConcluida
                                          ? 'bg-green-100 dark:bg-green-900/30'
                                          : 'bg-muted'
                                      )}
                                    >
                                      <IconComponent
                                        className={cn(
                                          'h-4 w-4',
                                          isSelected
                                            ? 'text-primary-foreground'
                                            : isConcluida
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-muted-foreground'
                                        )}
                                      />
                                      {isConcluida && !isSelected && (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={cn(
                                          'text-sm font-medium truncate',
                                          isSelected
                                            ? 'text-primary-foreground'
                                            : isConcluida
                                            ? 'text-muted-foreground'
                                            : ''
                                        )}
                                      >
                                        {aula.titulo}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span
                                          className={cn(
                                            'text-xs',
                                            isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                          )}
                                        >
                                          {getAulaTypeLabel(aula.tipo)}
                                        </span>
                                        {aula.duracao && (
                                          <>
                                            <span
                                              className={cn(
                                                'text-xs',
                                                isSelected ? 'text-primary-foreground/50' : 'text-muted-foreground/50'
                                              )}
                                            >
                                              •
                                            </span>
                                            <span
                                              className={cn(
                                                'text-xs flex items-center gap-1',
                                                isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                              )}
                                            >
                                              <Clock className="h-3 w-3" />
                                              {aula.duracao} min
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <ChevronRight className="h-4 w-4 text-primary-foreground shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="container max-w-5xl py-6 px-4 lg:px-8">
            {effectiveSelectedAula ? (
              <div className="space-y-6">
                {/* Aula Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={effectiveSelectedAula.obrigatoria ? 'default' : 'secondary'}>
                        {effectiveSelectedAula.obrigatoria ? 'Obrigatória' : 'Opcional'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {getAulaTypeLabel(effectiveSelectedAula.tipo)}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold">{effectiveSelectedAula.titulo}</h2>
                    {effectiveSelectedAula.descricao && (
                      <p className="text-muted-foreground mt-2">{effectiveSelectedAula.descricao}</p>
                    )}
                  </div>
                </div>

                {/* Aula Content */}
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <AulaViewer key={`aula-viewer-${effectiveSelectedAula.id}`} aula={effectiveSelectedAula} />
                  </CardContent>
                </Card>

                {/* Completion Card */}
                {!effectiveSelectedAula.progresso?.concluida ? (
                  <Card className="border-dashed">
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-center sm:text-left">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Concluir esta aula</p>
                            <p className="text-sm text-muted-foreground">
                              Marque como concluída para acompanhar seu progresso
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleMarcarConcluida}
                          disabled={marcarConcluida.isPending}
                          className="shrink-0"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {marcarConcluida.isPending ? 'Salvando...' : 'Marcar como Concluída'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-400">
                              Aula Concluída!
                            </p>
                            {effectiveSelectedAula.progresso.dataConclusao && (
                              <p className="text-sm text-muted-foreground">
                                Concluída em{' '}
                                {new Date(effectiveSelectedAula.progresso.dataConclusao).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                  <CardHeader className="text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Play className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Selecione uma aula</CardTitle>
                    <CardDescription>
                      Escolha uma aula no menu lateral para começar a estudar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setSidebarCollapsed(false)}
                      className="md:hidden"
                    >
                      <PanelLeft className="mr-2 h-4 w-4" />
                      Abrir conteúdo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
