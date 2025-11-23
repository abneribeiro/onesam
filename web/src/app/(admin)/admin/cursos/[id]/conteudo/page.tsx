'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurso } from '@/hooks/queries/useCursos';
import {
  useModulosPorCurso,
  useDeleteModulo
} from '@/hooks/queries/useModulos';
import {
  useDeleteAula
} from '@/hooks/queries/useAulas';
import type { Modulo } from '@/services/modulo.service';
import type { Aula } from '@/services/aula.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Edit,
  Trash2,
  Video,
  FileText,
  Link as LinkIcon,
  File,
  HelpCircle,
  ArrowLeft,
  Eye,
  Clock,
  BookOpen,
  GripVertical,
  Play,
  ExternalLink,
  FolderOpen,
  Layers
} from 'lucide-react';
import { ModuloForm } from '@/components/forms/ModuloForm';
import { AulaForm } from '@/components/forms/AulaForm';
import { PageHeader } from '@/components/features/PageHeader';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/features/LoadingState';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function AdminCursoConteudoPage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = Number(params.id);

  const { data: curso, isLoading: loadingCurso, error: errorCurso } = useCurso(cursoId);
  const { data: modulos, isLoading: loadingModulos, error: errorModulos } = useModulosPorCurso(cursoId, true);

  const [moduloDialogOpen, setModuloDialogOpen] = useState(false);
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [editingAula, setEditingAula] = useState<Aula | null>(null);
  const [selectedModuloId, setSelectedModuloId] = useState<number | null>(null);
  const [previewAula, setPreviewAula] = useState<Aula | null>(null);
  const [expandedModulos, setExpandedModulos] = useState<string[]>([]);

  const deleteModulo = useDeleteModulo();
  const deleteAula = useDeleteAula();

  const handleCreateModulo = () => {
    setEditingModulo(null);
    setModuloDialogOpen(true);
  };

  const handleEditModulo = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setModuloDialogOpen(true);
  };

  const handleDeleteModulo = async (moduloId: number) => {
    if (window.confirm('Tem a certeza que deseja eliminar este módulo? Todas as aulas serão removidas.')) {
      await deleteModulo.mutateAsync(moduloId);
    }
  };

  const handleCreateAula = (moduloId: number) => {
    setSelectedModuloId(moduloId);
    setEditingAula(null);
    setAulaDialogOpen(true);
  };

  const handleEditAula = (aula: Aula) => {
    setSelectedModuloId(aula.moduloId);
    setEditingAula(aula);
    setAulaDialogOpen(true);
  };

  const handleDeleteAula = async (aulaId: number) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta aula?')) {
      await deleteAula.mutateAsync(aulaId);
    }
  };

  const handlePreviewAula = (aula: Aula) => {
    setPreviewAula(aula);
  };

  const getAulaIcon = (tipo: Aula['tipo']) => {
    const iconClass = "h-5 w-5";
    switch (tipo) {
      case 'video':
        return <Video className={cn(iconClass, "text-red-500")} />;
      case 'documento':
        return <File className={cn(iconClass, "text-blue-500")} />;
      case 'link':
        return <LinkIcon className={cn(iconClass, "text-green-500")} />;
      case 'texto':
        return <FileText className={cn(iconClass, "text-amber-500")} />;
      case 'quiz':
        return <HelpCircle className={cn(iconClass, "text-purple-500")} />;
      default:
        return <FileText className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const getAulaTypeLabel = (tipo: Aula['tipo']) => {
    const labels: Record<string, string> = {
      video: 'Vídeo',
      documento: 'Documento',
      link: 'Link Externo',
      texto: 'Texto',
      quiz: 'Quiz',
    };
    return labels[tipo] || tipo;
  };

  const getAulaTypeBadgeVariant = (tipo: Aula['tipo']): "default" | "secondary" | "destructive" | "outline" => {
    switch (tipo) {
      case 'video':
        return 'destructive';
      case 'quiz':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getTotalAulas = () => {
    if (!modulos) return 0;
    return modulos.reduce((acc, m) => acc + (m.aulas?.length || 0), 0);
  };

  const getTotalDuracao = () => {
    if (!modulos) return 0;
    return modulos.reduce((acc, m) => {
      const moduloDuracao = (m.aulas || []).reduce((sum, a) => sum + (a.duracao || 0), 0);
      return acc + moduloDuracao;
    }, 0);
  };

  const formatDuracao = (minutos: number) => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  if (loadingCurso || loadingModulos) {
    return <LoadingState message="A carregar conteúdo do curso..." />;
  }

  if (errorCurso || errorModulos) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <FileText className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-lg font-semibold text-destructive">
          Erro ao carregar o conteúdo do curso
        </p>
        <p className="text-sm text-muted-foreground">
          {errorCurso?.message || errorModulos?.message || 'Erro desconhecido'}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  if (!curso) {
    return <div className="p-8">Curso não encontrado</div>;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voltar</TooltipContent>
          </Tooltip>
          <div className="flex-1">
            <PageHeader
              title={curso.nome}
              description="Gerencie os módulos e aulas deste curso"
            />
          </div>
          <Button onClick={handleCreateModulo} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Módulo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Módulos</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modulos?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalAulas()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duração Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuracao(getTotalDuracao())}</div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {!modulos || modulos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FolderOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum módulo criado</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                Comece organizando o conteúdo do seu curso criando módulos. Cada módulo pode conter várias aulas.
              </p>
              <Button onClick={handleCreateModulo} size="lg">
                <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Módulo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Estrutura do Curso
              </CardTitle>
              <CardDescription>
                {modulos.length} módulo{modulos.length !== 1 ? 's' : ''} com {getTotalAulas()} aula{getTotalAulas() !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion
                type="multiple"
                value={expandedModulos}
                onValueChange={setExpandedModulos}
                className="w-full"
              >
                {modulos.map((modulo, index) => {
                  const aulas = modulo.aulas || [];
                  const moduloDuracao = aulas.reduce((sum, a) => sum + (a.duracao || 0), 0);

                  return (
                    <AccordionItem
                      key={modulo.id}
                      value={`modulo-${modulo.id}`}
                      className="border-b last:border-b-0"
                    >
                      <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
                        <div className="flex items-center gap-4 flex-1 text-left">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{modulo.titulo}</span>
                              <Badge variant="outline" className="font-normal">
                                {aulas.length} aula{aulas.length !== 1 ? 's' : ''}
                              </Badge>
                              {moduloDuracao > 0 && (
                                <Badge variant="secondary" className="font-normal">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDuracao(moduloDuracao)}
                                </Badge>
                              )}
                            </div>
                            {modulo.descricao && (
                              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                {modulo.descricao}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  onClick={() => handleEditModulo(modulo)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleEditModulo(modulo)}
                                >
                                  <Edit className="h-4 w-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Editar Módulo</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent text-destructive hover:text-destructive cursor-pointer"
                                  onClick={() => handleDeleteModulo(modulo.id)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteModulo(modulo.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar Módulo</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-2 mt-2">
                          {aulas.length === 0 ? (
                            <div className="text-center py-8 border border-dashed rounded-lg">
                              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground mb-4">
                                Nenhuma aula neste módulo
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCreateAula(modulo.id)}
                              >
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Aula
                              </Button>
                            </div>
                          ) : (
                            <>
                              {aulas.map((aula, aulaIndex) => (
                                <div
                                  key={aula.id}
                                  className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-xs font-medium">
                                      {aulaIndex + 1}
                                    </div>
                                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted/50">
                                      {getAulaIcon(aula.tipo)}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-medium truncate">{aula.titulo}</h4>
                                      <Badge variant={getAulaTypeBadgeVariant(aula.tipo)} className="text-xs">
                                        {getAulaTypeLabel(aula.tipo)}
                                      </Badge>
                                      {!aula.obrigatoria && (
                                        <Badge variant="outline" className="text-xs">
                                          Opcional
                                        </Badge>
                                      )}
                                    </div>
                                    {aula.descricao && (
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                        {aula.descricao}
                                      </p>
                                    )}
                                    {aula.duracao && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Clock className="h-3 w-3" />
                                        {aula.duracao} min
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handlePreviewAula(aula)}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Visualizar</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleEditAula(aula)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Editar</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteAula(aula.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Eliminar</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 border-dashed"
                                onClick={() => handleCreateAula(modulo.id)}
                              >
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Aula
                              </Button>
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Modulo Dialog */}
        <Dialog open={moduloDialogOpen} onOpenChange={setModuloDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingModulo ? 'Editar Módulo' : 'Novo Módulo'}
              </DialogTitle>
              <DialogDescription>
                {editingModulo
                  ? 'Atualize as informações do módulo'
                  : 'Crie um novo módulo para organizar as aulas'}
              </DialogDescription>
            </DialogHeader>
            <ModuloForm
              cursoId={cursoId}
              modulo={editingModulo}
              onSuccess={() => {
                setModuloDialogOpen(false);
                setEditingModulo(null);
              }}
              onCancel={() => {
                setModuloDialogOpen(false);
                setEditingModulo(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Aula Dialog */}
        <Dialog open={aulaDialogOpen} onOpenChange={setAulaDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAula ? 'Editar Aula' : 'Nova Aula'}
              </DialogTitle>
              <DialogDescription>
                {editingAula
                  ? 'Atualize as informações da aula'
                  : 'Crie uma nova aula com conteúdo educativo'}
              </DialogDescription>
            </DialogHeader>
            <AulaForm
              moduloId={selectedModuloId!}
              cursoId={cursoId}
              aula={editingAula}
              onSuccess={() => {
                setAulaDialogOpen(false);
                setEditingAula(null);
                setSelectedModuloId(null);
              }}
              onCancel={() => {
                setAulaDialogOpen(false);
                setEditingAula(null);
                setSelectedModuloId(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Preview Sheet */}
        <Sheet open={!!previewAula} onOpenChange={(open) => !open && setPreviewAula(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-2">
                {previewAula && getAulaIcon(previewAula.tipo)}
                <Badge variant={previewAula ? getAulaTypeBadgeVariant(previewAula.tipo) : 'secondary'}>
                  {previewAula ? getAulaTypeLabel(previewAula.tipo) : ''}
                </Badge>
                {previewAula && !previewAula.obrigatoria && (
                  <Badge variant="outline">Opcional</Badge>
                )}
              </div>
              <SheetTitle>{previewAula?.titulo}</SheetTitle>
              <SheetDescription>
                {previewAula?.descricao || 'Sem descrição'}
              </SheetDescription>
            </SheetHeader>

            {previewAula && (
              <div className="mt-6 space-y-6">
                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {previewAula.duracao && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{previewAula.duracao} minutos</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{previewAula.obrigatoria ? 'Obrigatória' : 'Opcional'}</span>
                  </div>
                </div>

                <Separator />

                {/* Content Preview */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Conteúdo</h4>

                  {previewAula.tipo === 'video' && previewAula.url && (
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Pré-visualização do vídeo</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={previewAula.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir Vídeo
                        </a>
                      </Button>
                    </div>
                  )}

                  {previewAula.tipo === 'link' && previewAula.url && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Link externo:</p>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={previewAula.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {previewAula.url}
                        </a>
                      </Button>
                    </div>
                  )}

                  {previewAula.tipo === 'documento' && previewAula.url && (
                    <div className="space-y-4">
                      <div className="p-8 bg-muted rounded-lg flex flex-col items-center justify-center">
                        <File className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Documento PDF</p>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={previewAula.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir Documento
                        </a>
                      </Button>
                    </div>
                  )}

                  {previewAula.tipo === 'texto' && previewAula.conteudo && (
                    <div className="prose prose-sm max-w-none">
                      <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm">
                        {previewAula.conteudo}
                      </div>
                    </div>
                  )}

                  {previewAula.tipo === 'quiz' && (
                    <div className="p-8 bg-muted rounded-lg flex flex-col items-center justify-center">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Quiz interativo</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        O quiz será exibido aos alunos durante o curso
                      </p>
                    </div>
                  )}

                  {!previewAula.conteudo && !previewAula.url && (
                    <div className="p-8 bg-muted rounded-lg text-center">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum conteúdo configurado
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setPreviewAula(null);
                      handleEditAula(previewAula);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Aula
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
