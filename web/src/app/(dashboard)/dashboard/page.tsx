'use client';

export const dynamic = 'force-dynamic';

import { useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMinhasInscricoes } from '@/hooks/queries';
import { EstadoBadge } from '@/components/features/StatusBadge';
import { LoadingState } from '@/components/features/LoadingState';
import { StatsCard } from '@/components/features/StatsCard';
import { ActivityHeatmap } from '@/components/features/ActivityHeatmap';
import { CircularProgress } from '@/components/features/CircularProgress';
import { EmptyState } from '@/components/features/EmptyState';
import { useAtividadeHeatmap } from '@/hooks/queries/useAtividade';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/dateUtils';

export default function FormandoDashboardPage() {
  const { currentUser } = useAuth();
  const { data: inscricoes = [], isLoading: loading } = useMinhasInscricoes();
  const {
    data: activityData,
    availableYears,
    selectedYear,
    setSelectedYear,
    isLoading: loadingActivity
  } = useAtividadeHeatmap();

  const stats = useMemo(
    () => ({
      total: inscricoes.length,
      aceites: inscricoes.filter((i) => i.estado === 'aceite').length,
      pendentes: inscricoes.filter((i) => i.estado === 'pendente').length,
      rejeitadas: inscricoes.filter((i) => i.estado === 'rejeitada').length,
    }),
    [inscricoes]
  );

  // Calculate overall progress (simplified - based on active courses)
  const overallProgress = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.aceites / stats.total) * 100);
  }, [stats]);

  // Get first name for greeting
  const firstName = currentUser?.nome?.split(' ')[0] || 'Formando';

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return <LoadingState message="A carregar dashboard..." />;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Continue de onde parou e alcance os seus objetivos de aprendizagem.
          </p>
        </div>
        <Link href="/cursos">
          <Button className="gap-2 group">
            <Sparkles className="h-4 w-4" />
            Explorar Cursos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Progress Overview Card */}
      {stats.total > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <CircularProgress value={overallProgress} size={100} strokeWidth={8} />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold">O Seu Progresso Geral</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Tem {stats.aceites} curso{stats.aceites !== 1 ? 's' : ''} ativo{stats.aceites !== 1 ? 's' : ''} de {stats.total} inscrição{stats.total !== 1 ? 'ões' : ''}.
                </p>
                {stats.pendentes > 0 && (
                  <p className="text-warning text-sm mt-2 flex items-center justify-center md:justify-start gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {stats.pendentes} inscrição{stats.pendentes !== 1 ? 'ões' : ''} a aguardar aprovação
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Link href="/minhas-inscricoes">
                  <Button variant="outline" size="sm">
                    Ver Inscrições
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatsCard
          label="Total de Inscrições"
          value={stats.total}
          icon={BookOpen}
          variant="info"
        />
        <StatsCard
          label="Cursos Ativos"
          value={stats.aceites}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          label="Pendentes"
          value={stats.pendentes}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          label="Rejeitadas"
          value={stats.rejeitadas}
          icon={AlertCircle}
          variant="error"
        />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap
        data={activityData}
        availableYears={availableYears}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        isLoading={loadingActivity}
      />

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Minhas Inscrições</CardTitle>
              <CardDescription>
                {inscricoes.length === 0
                  ? 'Ainda não está inscrito em nenhum curso'
                  : `A mostrar ${Math.min(inscricoes.length, 5)} de ${inscricoes.length} inscrições`}
              </CardDescription>
            </div>
            {inscricoes.length > 0 && (
              <Link href="/minhas-inscricoes">
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {inscricoes.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhuma inscrição encontrada"
              description="Comece explorando o catálogo de cursos e inscreva-se nas formações do seu interesse."
              actionLabel="Explorar Cursos"
              onAction={() => window.location.href = '/cursos'}
              variant="compact"
            />
          ) : (
            <div className="space-y-3">
              {inscricoes.slice(0, 5).map((inscricao) => (
                <div
                  key={inscricao.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all hover:shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{inscricao.curso?.nome || 'Curso Desconhecido'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Inscrito em {formatDate(inscricao.dataInscricao)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <EstadoBadge estado={inscricao.estado} />
                    {inscricao.estado === 'aceite' && (
                      <Link href={`/cursos/${inscricao.cursoId}/conteudo`}>
                        <Button size="sm" className="gap-1">
                          Continuar
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
