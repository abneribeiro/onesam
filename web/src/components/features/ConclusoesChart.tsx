import { useAnalyticsConclusoes } from '@/hooks/queries/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Users, Award } from 'lucide-react';

export function ConclusoesChart() {
  const { data: conclusoes = [], isLoading, error } = useAnalyticsConclusoes();

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Erro ao carregar dados do gráfico</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conclusões Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Carregando dados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTooltip = (value: number | undefined, name: string | undefined) => {
    const safeValue = value ?? 0;
    const safeName = name ?? '';
    if (safeName === 'conclusoes') {
      return [safeValue, 'Conclusões'];
    }
    if (safeName === 'certificados') {
      return [safeValue, 'Certificados'];
    }
    return [safeValue, safeName];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Conclusões Mensais
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolução das conclusões de cursos e emissões de certificados nos últimos 12 meses
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={conclusoes}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={formatTooltip}
                labelStyle={{
                  color: 'hsl(var(--foreground))',
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="conclusoes"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Conclusões"
              />
              <Line
                type="monotone"
                dataKey="certificados"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Certificados"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">
              {conclusoes.reduce((sum, item) => sum + item.conclusoes, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Conclusões</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">
              {conclusoes.reduce((sum, item) => sum + item.certificados, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Certificados</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Média</span>
            </div>
            <p className="text-2xl font-bold">
              {conclusoes.length > 0
                ? Math.round(conclusoes.reduce((sum, item) => sum + item.conclusoes, 0) / conclusoes.length)
                : 0
              }
            </p>
            <p className="text-xs text-muted-foreground">Por mês</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}