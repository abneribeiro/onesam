'use client';

export const dynamic = 'force-dynamic';


import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { Badge } from '@/components/ui/badge';
import type { Notificacao, TipoNotificacao } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const tipoNotificacaoConfig: Record<TipoNotificacao, { icon: string; color: string; bgColor: string }> = {
  inscricao_aprovada: { icon: '✓', color: 'text-green-600', bgColor: 'bg-green-50' },
  inscricao_rejeitada: { icon: '✗', color: 'text-red-600', bgColor: 'bg-red-50' },
  novo_curso: { icon: '📚', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  lembrete: { icon: '⏰', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  sistema: { icon: 'ℹ', color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

export default function Notificacoes() {
  const { notificacoes, isLoading, marcarComoLida, marcarTodasComoLidas, deletar, isMarking, isDeleting } = useNotificacoes();
  const router = useRouter();

  const naoLidas = notificacoes.filter(n => !n.lida);
  const lidas = notificacoes.filter(n => n.lida);

  const handleNotificacaoClick = (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      marcarComoLida(notificacao.id);
    }

    if (notificacao.linkAcao) {
      router.push(notificacao.linkAcao);
    }
  };

  const formatarData = (data: Date) => {
    return formatDistanceToNow(new Date(data), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const NotificacaoItem = ({ notificacao }: { notificacao: Notificacao }) => {
    const config = tipoNotificacaoConfig[notificacao.tipo];

    return (
      <div
        className={`p-4 rounded-lg border transition-colors ${
          !notificacao.lida ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200'
        } hover:shadow-md cursor-pointer`}
        onClick={() => handleNotificacaoClick(notificacao)}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center text-lg`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-medium text-sm">
                  {notificacao.titulo}
                  {!notificacao.lida && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                      Nova
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{notificacao.mensagem}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatarData(notificacao.dataCriacao)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {notificacao.linkAcao && (
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletar(notificacao.id);
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as suas notificações e atualizações
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">
            Acompanhe todas as suas notificações e atualizações
          </p>
        </div>
        {naoLidas.length > 0 && (
          <Button
            variant="outline"
            onClick={() => marcarTodasComoLidas()}
            disabled={isMarking}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notificacoes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma notificação
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Quando houver atualizações importantes, elas aparecerão aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {naoLidas.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Não lidas ({naoLidas.length})
                    </CardTitle>
                    <CardDescription>Notificações que ainda não foram visualizadas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {naoLidas.map((notificacao) => (
                  <NotificacaoItem key={notificacao.id} notificacao={notificacao} />
                ))}
              </CardContent>
            </Card>
          )}

          {lidas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Lidas ({lidas.length})
                </CardTitle>
                <CardDescription>Notificações anteriores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {lidas.map((notificacao) => (
                  <NotificacaoItem key={notificacao.id} notificacao={notificacao} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
