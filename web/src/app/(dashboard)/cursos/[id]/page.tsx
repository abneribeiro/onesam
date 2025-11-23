'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState, useCallback } from 'react';
import {
  Calendar,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Copy,
  Users,
  Play,
  Video,
  FileText,
  Link as LinkIcon,
  HelpCircle,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { NivelBadge, EstadoBadge } from '@/components/features/StatusBadge';
import { LoadingState } from '@/components/features/LoadingState';
import { useCurso, useInscreverCurso, useMinhaInscricaoCurso } from '@/hooks/queries';
import { useReviewsPorCurso, useReviewStats, useMinhaReview, useCreateReview, useUpdateReview, useDeleteReview } from '@/hooks/queries/useReviews';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { formatDate } from '@/lib/dateUtils';
import { useAuth } from '@/contexts/AuthContext';
import type { Review } from '@/services/review.service';

const AULA_ICONS = {
  video: Video,
  documento: FileText,
  link: LinkIcon,
  texto: FileText,
  quiz: HelpCircle
} as const;

export default function CourseDetailsPage() {
  const params = useParams();
  const cursoId = parseInt(params.id as string);
  const { currentUser } = useAuth();

  const { data: curso, isLoading: loading, error } = useCurso(cursoId);
  const { data: minhaInscricao, isLoading: loadingInscricao } = useMinhaInscricaoCurso(cursoId);
  const inscricaoMutation = useInscreverCurso();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const { data: reviews = [] } = useReviewsPorCurso(cursoId);
  const { data: reviewStats } = useReviewStats(cursoId);
  const { data: minhaReview } = useMinhaReview(cursoId);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const vagasInfo = useMemo(() => {
    if (!curso?.limiteVagas) return null;
    const totalInscritos = curso._count?.inscricoes || 0;
    const vagasRestantes = curso.limiteVagas - totalInscritos;
    return {
      total: curso.limiteVagas,
      restantes: vagasRestantes,
      percentual: (totalInscritos / curso.limiteVagas) * 100,
    };
  }, [curso]);

  const validacoes = useMemo(() => {
    if (!curso) return { podeInscrever: false, motivo: 'Curso não encontrado' };
    if (minhaInscricao) return { podeInscrever: false, motivo: 'Já inscrito', inscricaoExistente: true };
    if (new Date(curso.dataLimiteInscricao) < new Date()) return { podeInscrever: false, motivo: 'Prazo expirado' };
    if (vagasInfo && vagasInfo.restantes <= 0) return { podeInscrever: false, motivo: 'Vagas esgotadas' };
    if (!curso.visivel) return { podeInscrever: false, motivo: 'Indisponível' };
    return { podeInscrever: true, motivo: null };
  }, [curso, minhaInscricao, vagasInfo]);

  const totalAulas = useMemo(() => {
    if (!curso?.modulos) return 0;
    return curso.modulos.reduce((acc, m) => acc + (m.aulas?.length || 0), 0);
  }, [curso]);

  // CORREÇÃO: Funções memoizadas para evitar re-renders desnecessários
  const handleEnroll = useCallback(() => {
    if (!curso || !validacoes.podeInscrever) return;
    inscricaoMutation.mutate(
      { IDCurso: curso.id },
      { onSuccess: () => toast.success('Inscrição realizada! Aguarde aprovação.') }
    );
  }, [curso, validacoes.podeInscrever, inscricaoMutation]);

  const handleCreateReview = useCallback(async (data: { rating: number; comentario?: string }) => {
    await createReview.mutateAsync({ IDCurso: cursoId, ...data });
    setShowReviewForm(false);
  }, [createReview, cursoId]);

  const handleUpdateReview = useCallback(async (data: { rating: number; comentario?: string }) => {
    if (!editingReview) return;
    await updateReview.mutateAsync({ id: editingReview.id, data, cursoId });
    setEditingReview(null);
  }, [editingReview, updateReview, cursoId]);

  const handleDeleteReview = useCallback(async (reviewId: number) => {
    if (confirm('Tem certeza que deseja deletar esta avaliação?')) {
      await deleteReview.mutateAsync({ id: reviewId, cursoId });
    }
  }, [deleteReview, cursoId]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  }, []);

  const handleEditReview = useCallback((review: Review) => {
    setEditingReview(review);
    setShowReviewForm(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setShowReviewForm(false);
    setEditingReview(null);
  }, []);

  if (loading || loadingInscricao) {
    return <LoadingState message="A carregar curso..." />;
  }

  if (error || !curso) {
    return null;
  }

  const isEnrolled = minhaInscricao?.estado === 'aceite';

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/cursos" className="hover:text-foreground transition-colors">
          Cursos
        </Link>
        {curso.area && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/cursos?area=${curso.area.nome}`} className="hover:text-foreground transition-colors">
              {curso.area.nome}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate max-w-[200px]">{curso.nome}</span>
      </nav>

      {/* Hero Section - CORREÇÃO: Usar Image do Next.js para evitar CLS */}
      <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {curso.imagemCurso ? (
          <Image
            src={curso.imagemCurso}
            alt={curso.nome}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="h-16 w-16 text-primary/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <NivelBadge nivel={curso.nivel} />
            {curso.certificado && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Certificado
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{curso.nome}</h1>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white"
          onClick={handleCopyLink}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="sobre" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="sobre">Sobre</TabsTrigger>
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            </TabsList>

            {/* Tab: Sobre */}
            <TabsContent value="sobre" className="mt-6 space-y-6">
              {/* Descrição */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {curso.descricao || 'Sem descrição disponível.'}
                </p>
              </section>

              {/* Informações Rápidas */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Início</p>
                    <p className="text-sm font-medium">{formatDate(curso.dataInicio)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Fim</p>
                    <p className="text-sm font-medium">{formatDate(curso.dataFim)}</p>
                  </CardContent>
                </Card>
                {curso.cargaHoraria && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Duração</p>
                      <p className="text-sm font-medium">{curso.cargaHoraria}h</p>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Aulas</p>
                    <p className="text-sm font-medium">{totalAulas}</p>
                  </CardContent>
                </Card>
              </section>

              {/* Detalhes do Curso */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Área</span>
                    <span className="font-medium">{curso.area?.nome || '-'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria</span>
                    <span className="font-medium">{curso.categoria?.nome || '-'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge variant={curso.estado === 'em_curso' ? 'default' : 'secondary'}>
                      {curso.estado === 'em_curso' ? 'Em Curso' : curso.estado === 'planeado' ? 'Planeado' : curso.estado === 'terminado' ? 'Terminado' : 'Arquivado'}
                    </Badge>
                  </div>
                  {curso.notaMinimaAprovacao && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nota mínima</span>
                        <span className="font-medium">{curso.notaMinimaAprovacao}%</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Conteúdo */}
            <TabsContent value="conteudo" className="mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Conteúdo Programático</CardTitle>
                    <Badge variant="outline">
                      {curso.modulos?.length || 0} módulos • {totalAulas} aulas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {!curso.modulos || curso.modulos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>Conteúdo em breve.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {curso.modulos.map((modulo, index) => {
                        const aulas = modulo.aulas || [];
                        return (
                          <div key={modulo.id} className="border rounded-lg overflow-hidden">
                            <div className="flex items-center gap-3 p-4 bg-muted/30">
                              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{modulo.titulo}</h4>
                                <p className="text-xs text-muted-foreground">{aulas.length} aulas</p>
                              </div>
                            </div>
                            {aulas.length > 0 && (
                              <div className="divide-y">
                                {aulas.slice(0, isEnrolled ? aulas.length : 3).map((aula) => {
                                  const Icon = AULA_ICONS[aula.tipo] || FileText;
                                  return (
                                    <div key={aula.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      <span className="truncate flex-1">{aula.titulo}</span>
                                      {aula.duracao && (
                                        <span className="text-xs text-muted-foreground">{aula.duracao} min</span>
                                      )}
                                    </div>
                                  );
                                })}
                                {!isEnrolled && aulas.length > 3 && (
                                  <div className="px-4 py-2 text-xs text-muted-foreground text-center bg-muted/20">
                                    +{aulas.length - 3} aulas
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isEnrolled && totalAulas > 0 && (
                    <div className="mt-6">
                      <Link href={`/cursos/${curso.id}/conteudo`}>
                        <Button className="w-full" size="lg">
                          <Play className="h-4 w-4 mr-2" />
                          Acessar Aulas
                        </Button>
                      </Link>
                    </div>
                  )}

                  {!isEnrolled && !minhaInscricao && (
                    <p className="text-center text-sm text-muted-foreground mt-6">
                      Inscreva-se para ter acesso completo ao conteúdo.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Avaliações */}
            <TabsContent value="avaliacoes" className="mt-6 space-y-6">
              {reviewStats && <ReviewStats stats={reviewStats} />}

              {/* Mostrar review do usuário se existir e não estiver editando */}
              {minhaReview && !editingReview && !showReviewForm && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-primary">Sua Avaliação</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= minhaReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditReview(minhaReview)}
                      >
                        Editar
                      </Button>
                    </div>
                    {minhaReview.comentario && (
                      <p className="text-sm text-muted-foreground">{minhaReview.comentario}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Mostrar botão de avaliar apenas se inscrito e não tem review */}
              {isEnrolled && !minhaReview && !editingReview && !showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)} className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  Avaliar Curso
                </Button>
              )}

              {(showReviewForm || editingReview) && (
                <ReviewForm
                  cursoId={cursoId}
                  existingReview={editingReview}
                  onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
                  onCancel={handleCancelEdit}
                  isLoading={createReview.isPending || updateReview.isPending}
                />
              )}

              <ReviewList
                reviews={reviews}
                currentUserId={currentUser?.id}
                isAdmin={currentUser?.tipoPerfil === 'admin'}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                minhaReviewId={minhaReview?.id}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              {minhaInscricao ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sua Inscrição</p>
                      <p className="text-xs text-muted-foreground">
                        Desde {formatDate(minhaInscricao.dataInscricao)}
                      </p>
                    </div>
                    <EstadoBadge estado={minhaInscricao.estado} />
                  </div>

                  {isEnrolled && (
                    <>
                      <Separator />
                      <Link href={`/cursos/${curso.id}/conteudo`}>
                        <Button className="w-full" size="lg">
                          <Play className="h-4 w-4 mr-2" />
                          Continuar Curso
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={!validacoes.podeInscrever || inscricaoMutation.isPending}
                  >
                    {inscricaoMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                        A inscrever...
                      </span>
                    ) : (
                      'Inscrever-me'
                    )}
                  </Button>

                  {!validacoes.podeInscrever && validacoes.motivo && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validacoes.motivo}</span>
                    </div>
                  )}
                </>
              )}

              <Separator />

              {/* Quick Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Prazo de Inscrição</p>
                    <p className="text-muted-foreground">{formatDate(curso.dataLimiteInscricao)}</p>
                  </div>
                </div>

                {vagasInfo && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Vagas</span>
                      </div>
                      <span className="text-muted-foreground">
                        {vagasInfo.restantes}/{vagasInfo.total}
                      </span>
                    </div>
                    <Progress value={vagasInfo.percentual} className="h-1.5" />
                    {vagasInfo.restantes <= 5 && vagasInfo.restantes > 0 && (
                      <p className="text-xs text-amber-600">Últimas vagas!</p>
                    )}
                  </div>
                )}

                {curso.certificado && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Certificado incluído</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Link href="/cursos">
            <Button variant="ghost" className="w-full">
              ← Voltar ao Catálogo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
