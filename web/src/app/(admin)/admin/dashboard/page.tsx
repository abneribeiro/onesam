'use client';

export const dynamic = 'force-dynamic';


import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NivelBadge } from '@/components/features/StatusBadge';
import { LoadingState } from '@/components/features/LoadingState';
import { StatsCard } from '@/components/features/StatsCard';
import { useAdminStats, useCursosPopulares } from '@/hooks/queries';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: cursosPopulares = [], isLoading: loadingCursos } = useCursosPopulares(5);

  const loading = loadingStats || loadingCursos;

  if (loading) {
    return <LoadingState message="A carregar dashboard..." />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          label="Total de Cursos"
          value={stats?.totalCursos ?? 0}
          icon={BookOpen}
          variant="info"
        />
        <StatsCard
          label="Utilizadores"
          value={stats?.totalUtilizadores ?? 0}
          icon={Users}
          variant="info"
        />
        <StatsCard
          label="Total de Inscrições"
          value={stats?.totalInscricoes ?? 0}
          icon={FileText}
          variant="default"
        />
        <StatsCard
          label="Inscrições Pendentes"
          value={stats?.inscricoesPendentes ?? 0}
          icon={FileText}
          variant="warning"
        />
        <StatsCard
          label="Inscrições Aceites"
          value={stats?.inscricoesAceites ?? 0}
          icon={Users}
          variant="success"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cursos Mais Populares
            </CardTitle>
            <CardDescription>
              Top 5 cursos com mais inscrições
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cursosPopulares.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum curso com inscrições ainda
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead className="text-right">Inscrições</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cursosPopulares.map((curso, index) => (
                      <TableRow key={curso.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{curso.nome}</TableCell>
                        <TableCell><NivelBadge nivel={curso.nivel} /></TableCell>
                        <TableCell className="text-right font-semibold">
                          {curso.numInscricoes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Inscrições</CardTitle>
            <CardDescription>
              Estado atual das inscrições
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Pendentes</span>
              <span className="text-2xl font-bold text-[var(--warning-600))]">{stats?.inscricoesPendentes ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Aceites</span>
              <span className="text-2xl font-bold text-[var(--success-600))]">{stats?.inscricoesAceites ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-bold">{stats?.totalInscricoes ?? 0}</span>
            </div>
            {(stats?.inscricoesPendentes ?? 0) > 0 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                Aceda à página de inscrições para gerir as pendentes
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
