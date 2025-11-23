'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import {
    Calendar,
    BookOpen,
    Clock,
    CheckCircle2,
    ChevronRight,
    Users,
    LogIn,
    UserPlus,
    FileText,
    Video,
    Link as LinkIcon,
    HelpCircle,
    Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { NivelBadge } from '@/components/features/StatusBadge';
import { LoadingState } from '@/components/features/LoadingState';
import { useCurso } from '@/hooks/queries';
import { useReviewStats } from '@/hooks/queries/useReviews';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { formatDate } from '@/lib/dateUtils';

const AULA_ICONS = {
    video: Video,
    documento: FileText,
    link: LinkIcon,
    texto: FileText,
    quiz: HelpCircle
} as const;

export default function PublicCourseDetailsPage() {
    const params = useParams();
    const cursoId = parseInt(params.id as string);

    const { data: curso, isLoading: loading, error } = useCurso(cursoId);
    const { data: reviewStats } = useReviewStats(cursoId);

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

    const totalAulas = useMemo(() => {
        if (!curso?.modulos) return 0;
        return curso.modulos.reduce((acc, m) => acc + (m.aulas?.length || 0), 0);
    }, [curso]);

    if (loading) {
        return <LoadingState message="A carregar curso..." />;
    }

    if (error || !curso) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-lg text-muted-foreground">Curso não encontrado</p>
                <Button asChild>
                    <Link href="/">Voltar à Homepage</Link>
                </Button>
            </div>
        );
    }

    const prazoExpirado = new Date(curso.dataLimiteInscricao) < new Date();
    const vagasEsgotadas = vagasInfo && vagasInfo.restantes <= 0;

    return (
        <div className="flex flex-1 flex-col gap-6 min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto w-full px-4 pb-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    {curso.area && (
                        <>
                            <ChevronRight className="h-4 w-4" />
                            <Link href={`/?area=${curso.area.id}`} className="hover:text-foreground transition-colors">
                                {curso.area.nome}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground truncate max-w-[200px]">{curso.nome}</span>
                </nav>

                {/* Hero Section */}
                <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl mb-6">
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
                            <BookOpen className="h-20 w-20 text-primary/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex items-center gap-2 mb-3">
                            <NivelBadge nivel={curso.nivel} />
                            {curso.certificado && (
                                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Certificado
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{curso.nome}</h1>
                        <p className="text-white/80 text-lg max-w-3xl">{curso.descricao || 'Sem descrição disponível.'}</p>
                    </div>
                </div>

                {/* CTA Banner - Fazer Login/Registro */}
                <Card className="bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-400)] text-white border-0 shadow-lg mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Interessado neste curso?</h3>
                                <p className="text-white/90">Faça login ou crie uma conta para se inscrever</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    asChild
                                    size="lg"
                                    variant="secondary"
                                    className="gap-2"
                                >
                                    <Link href={`/login?from=/curso/${cursoId}`}>
                                        <LogIn className="h-5 w-5" />
                                        Fazer Login
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
                                >
                                    <Link href={`/register?from=/curso/${cursoId}`}>
                                        <UserPlus className="h-5 w-5" />
                                        Criar Conta
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                            <span className="text-muted-foreground">Nível</span>
                                            <NivelBadge nivel={curso.nivel} />
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
                                                                    {/* Show only first 3 lessons for public view */}
                                                                    {aulas.slice(0, 3).map((aula) => {
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
                                                                    {aulas.length > 3 && (
                                                                        <div className="px-4 py-3 text-sm text-muted-foreground text-center bg-muted/20">
                                                                            <p className="mb-2">+{aulas.length - 3} aulas adicionais</p>
                                                                            <p className="text-xs">Faça login para ver o conteúdo completo</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab: Avaliações */}
                            <TabsContent value="avaliacoes" className="mt-6 space-y-6">
                                {reviewStats ? (
                                    <ReviewStats stats={reviewStats} />
                                ) : (
                                    <Card>
                                        <CardContent className="p-6 text-center text-muted-foreground">
                                            <Star className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                            <p>Nenhuma avaliação ainda</p>
                                        </CardContent>
                                    </Card>
                                )}

                                <Card className="border-dashed">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Faça login para ver todas as avaliações e deixar a sua
                                        </p>
                                        <Button asChild>
                                            <Link href={`/login?from=/curso/${cursoId}`}>
                                                Fazer Login
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <Card className="sticky top-4 shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Prazo de Inscrição</p>
                                            <p className={`text-muted-foreground ${prazoExpirado ? 'text-destructive' : ''}`}>
                                                {formatDate(curso.dataLimiteInscricao)}
                                            </p>
                                        </div>
                                    </div>

                                    {vagasInfo && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Vagas</span>
                                                </div>
                                                <span className={`text-muted-foreground ${vagasInfo.restantes <= 5 && vagasInfo.restantes > 0 ? 'text-amber-600 font-semibold' : ''}`}>
                                                    {vagasInfo.restantes}/{vagasInfo.total}
                                                </span>
                                            </div>
                                            <Progress value={vagasInfo.percentual} className="h-2" />
                                            {vagasInfo.restantes <= 5 && vagasInfo.restantes > 0 && (
                                                <p className="text-xs text-amber-600 font-medium">Últimas vagas!</p>
                                            )}
                                            {vagasEsgotadas && (
                                                <p className="text-xs text-destructive font-medium">Vagas esgotadas</p>
                                            )}
                                        </div>
                                    )}

                                    {curso.certificado && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="text-sm font-medium">Certificado incluído</span>
                                        </div>
                                    )}

                                    {(prazoExpirado || vagasEsgotadas) && (
                                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                            {prazoExpirado ? 'Prazo de inscrição expirado' : 'Vagas esgotadas'}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Link href="/">
                            <Button variant="ghost" className="w-full">
                                ← Voltar à Homepage
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
