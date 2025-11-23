'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { NivelBadge } from './StatusBadge';
import { formatDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import type { CursoComRelations } from '@/types';

interface CursoCardProps {
  curso: CursoComRelations;
  className?: string;
  publicView?: boolean;
}

export const CursoCard = React.memo(function CursoCard({ curso, className, publicView = false }: CursoCardProps) {
  // Memoizar cálculos para evitar recálculo em cada render
  const { vagasRestantes, percentualVagas, isNovo, vagasLimitadas } = useMemo(() => {
    const vagasRestantesCalc = curso.limiteVagas
      ? curso.limiteVagas - (curso._count?.inscricoes || 0)
      : null;

    const percentualVagasCalc = curso.limiteVagas
      ? ((vagasRestantesCalc || 0) / curso.limiteVagas) * 100
      : 100;

    const isNovoCalc = curso.dataCriacao
      ? Date.now() - new Date(curso.dataCriacao).getTime() < 7 * 24 * 60 * 60 * 1000
      : false;

    const vagasLimitadasCalc = vagasRestantesCalc !== null && vagasRestantesCalc > 0 && vagasRestantesCalc <= 5;

    return {
      vagasRestantes: vagasRestantesCalc,
      percentualVagas: percentualVagasCalc,
      isNovo: isNovoCalc,
      vagasLimitadas: vagasLimitadasCalc,
    };
  }, [curso.limiteVagas, curso._count?.inscricoes, curso.dataCriacao]);

  return (
    <Card
      className={cn(
        'group overflow-hidden py-0 gap-0 hover:shadow-2xl transition-all duration-300',
        className
      )}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--brand-500)] to-[var(--accent-500)]">
        {curso.imagemCurso ? (
          <Image
            src={curso.imagemCurso}
            alt={curso.nome}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="h-16 w-16 text-white/80" aria-hidden="true" />
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          <NivelBadge nivel={curso.nivel} />
        </div>

        {isNovo && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="border-transparent bg-[var(--accent-500)] text-white hover:bg-[var(--accent-600)]">
              Novo
            </Badge>
          </div>
        )}

        {vagasLimitadas && (
          <div className="absolute bottom-3 left-3 z-10">
            <Badge
              variant="outline"
              className="bg-white/90 text-[var(--error-600)] border-[var(--error-600)] font-semibold"
            >
              Vagas Limitadas
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="px-6 pt-6">
        <CardTitle className="line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {curso.nome}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {curso.descricao || 'Sem descrição disponível'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-6">
        {curso.limiteVagas && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Vagas disponíveis</span>
              <span
                className={cn(
                  'font-medium',
                  vagasLimitadas && 'text-[var(--error-600)] font-semibold'
                )}
              >
                {vagasRestantes}/{curso.limiteVagas}
              </span>
            </div>
            <Progress
              value={percentualVagas}
              className="h-2"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>Início: {formatDate(curso.dataInicio)}</span>
          </div>

          {curso.cargaHoraria && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{curso.cargaHoraria}h</span>
            </div>
          )}

          {curso.limiteVagas && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{curso.limiteVagas} vagas</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 py-6">
        <Button asChild className="w-full group/button">
          <Link href={publicView ? `/curso/${curso.id}` : `/cursos/${curso.id}`}>
            Ver Detalhes
            <ArrowRight className="ml-2 h-4 w-4 group-hover/button:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});
