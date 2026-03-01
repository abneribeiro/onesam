import { useAnalyticsKPIs } from '@/hooks/queries/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookOpen,
  UserCheck,
  Award,
  PlayCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';

export function KPIDashboard() {
  const { data: kpis, isLoading, error } = useAnalyticsKPIs();

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center text-muted-foreground">
                <div className="h-8 w-8 mx-auto mb-2 opacity-50 bg-muted rounded animate-pulse" />
                <p className="text-sm">Erro ao carregar</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const kpiCards = [
    {
      title: 'Total de Cursos',
      value: kpis.totalCursos,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Cursos criados na plataforma'
    },
    {
      title: 'Utilizadores',
      value: kpis.totalUtilizadores,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Utilizadores registados'
    },
    {
      title: 'Inscrições',
      value: kpis.totalInscricoes,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total de inscrições'
    },
    {
      title: 'Certificados',
      value: kpis.totalCertificados,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Certificados emitidos'
    },
    {
      title: 'Cursos Ativos',
      value: kpis.cursosAtivos,
      icon: PlayCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Cursos em andamento'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${kpis.taxaConclusaoMedia}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'Média geral',
      badge: kpis.taxaConclusaoMedia >= 70
        ? { text: 'Excelente', variant: 'default' as const }
        : kpis.taxaConclusaoMedia >= 50
        ? { text: 'Bom', variant: 'secondary' as const }
        : { text: 'Melhorar', variant: 'destructive' as const }
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;

        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.description}
                  </p>
                </div>
                {kpi.badge && (
                  <Badge variant={kpi.badge.variant} className="text-xs">
                    {kpi.badge.text}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}