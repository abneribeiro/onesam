'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle2,
  Users,
  Pencil,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NivelBadge, EstadoCursoBadge } from '@/components/features/StatusBadge';
import { LoadingState } from '@/components/features/LoadingState';
import { useCurso } from '@/hooks/queries';
import { formatDate } from '@/lib/dateUtils';

export default function AdminCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const cursoId = parseInt(id);

  const { data: curso, isLoading: loading, error } = useCurso(cursoId);

  const vagasInfo = useMemo(() => {
    if (!curso?.limiteVagas) return null;

    const totalInscritos = curso._count?.inscricoes || 0;
    const vagasRestantes = curso.limiteVagas - totalInscritos;
    const percentualOcupado = (totalInscritos / curso.limiteVagas) * 100;

    return {
      total: curso.limiteVagas,
      ocupadas: totalInscritos,
      restantes: vagasRestantes,
      percentual: percentualOcupado,
    };
  }, [curso]);

  if (loading) {
    return <LoadingState message="A carregar curso..." />;
  }

  if (error || !curso) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium">Curso não encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/cursos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Cursos
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/cursos" className="hover:text-foreground transition-colors">
          Cursos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{curso.nome}</span>
      </div>

      {/* Header com ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{curso.nome}</h1>
            <EstadoCursoBadge estado={curso.estado} />
          </div>
          <p className="text-muted-foreground">
            Detalhes do curso e informações administrativas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/cursos')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin/cursos/${cursoId}/conteudo`)}>
            <BookOpen className="mr-2 h-4 w-4" />
            Gerir Conteúdo
          </Button>
          <Button onClick={() => router.push(`/admin/cursos/${cursoId}/editar`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Imagem e informações principais */}
      <div className="relative w-full h-64 bg-gradient-to-r from-[var(--brand-500)] to-[var(--accent-500)] rounded-lg overflow-hidden">
        {curso.imagemCurso ? (
          <img
            src={curso.imagemCurso}
            alt={curso.nome}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="h-20 w-20 text-white/30" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <NivelBadge nivel={curso.nivel} />
            {curso.area && <Badge variant="secondary">{curso.area.nome}</Badge>}
            {curso.categoria && <Badge variant="outline" className="bg-white/10 text-white border-white/30">{curso.categoria.nome}</Badge>}
            {curso.certificado && (
              <Badge className="bg-[var(--success-500)] text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Certificado
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Grid de informações */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Descrição */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {curso.descricao || 'Sem descrição disponível'}
            </p>
          </CardContent>
        </Card>

        {/* Estatísticas rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Inscrições
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{curso._count?.inscricoes || 0}</p>
              <p className="text-sm text-muted-foreground">Total de inscritos</p>
            </div>
            {vagasInfo && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vagas disponíveis</span>
                    <span className="font-medium">{vagasInfo.restantes}/{vagasInfo.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${vagasInfo.percentual}%` }}
                    />
                  </div>
                </div>
              </>
            )}
            <Link href="/admin/inscricoes" className="block">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Ver Inscrições
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Início</span>
                <span className="text-sm font-medium">{formatDate(curso.dataInicio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fim</span>
                <span className="text-sm font-medium">{formatDate(curso.dataFim)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Limite Inscrição</span>
                <span className="text-sm font-medium">{formatDate(curso.dataLimiteInscricao)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Criado em</span>
                <span className="text-sm font-medium">{formatDate(curso.dataCriacao)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes técnicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nível</span>
              <NivelBadge nivel={curso.nivel} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <EstadoCursoBadge estado={curso.estado} />
            </div>
            {curso.cargaHoraria && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Carga Horária</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {curso.cargaHoraria}h
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Certificado</span>
              <Badge variant={curso.certificado ? 'default' : 'secondary'}>
                {curso.certificado ? 'Sim' : 'Não'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Visível</span>
              <Badge variant={curso.visivel ? 'default' : 'secondary'}>
                {curso.visivel ? 'Sim' : 'Não'}
              </Badge>
            </div>
            {curso.notaMinimaAprovacao && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nota Mínima</span>
                <span className="text-sm font-medium">{curso.notaMinimaAprovacao}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conteúdo do curso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Conteúdo
            </CardTitle>
            <CardDescription>Módulos e aulas do curso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-bold">{curso.modulos?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Módulos</p>
            </div>
            <div className="text-center py-4">
              <p className="text-3xl font-bold">
                {curso.modulos?.reduce((acc, m) => acc + (m.aulas?.length || 0), 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Aulas</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/admin/cursos/${cursoId}/conteudo`)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Gerir Conteúdo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
