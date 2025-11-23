import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ReviewStats as ReviewStatsType } from '@/services/review.service';

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const { totalReviews, mediaRating, distribuicao } = stats;

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const starData = [
    { stars: 5, count: distribuicao.estrela5 },
    { stars: 4, count: distribuicao.estrela4 },
    { stars: 3, count: distribuicao.estrela3 },
    { stars: 2, count: distribuicao.estrela2 },
    { stars: 1, count: distribuicao.estrela1 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações do Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Média Geral */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{mediaRating.toFixed(1)}</div>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= Math.round(mediaRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
              </div>
            </div>

            {/* Distribuição */}
            <div className="flex-1 space-y-2">
              {starData.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={getPercentage(count)} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
