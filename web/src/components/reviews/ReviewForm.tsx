import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Review } from '@/services/review.service';

interface ReviewFormProps {
  cursoId?: number;
  existingReview?: Review | null;
  onSubmit: (data: { rating: number; comentario?: string }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ReviewForm({ existingReview, onSubmit, onCancel, isLoading }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comentario, setComentario] = useState(existingReview?.comentario || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      return;
    }
    onSubmit({ rating, comentario: comentario.trim() || undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingReview ? 'Editar Avaliação' : 'Avaliar Curso'}</CardTitle>
        <CardDescription>
          {existingReview
            ? 'Atualize sua avaliação sobre este curso'
            : 'Compartilhe sua experiência com outros formandos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Classificação <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hoveredRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && 'Muito Insatisfeito'}
                {rating === 2 && 'Insatisfeito'}
                {rating === 3 && 'Neutro'}
                {rating === 4 && 'Satisfeito'}
                {rating === 5 && 'Muito Satisfeito'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="comentario" className="text-sm font-medium">
              Comentário (opcional)
            </label>
            <Textarea
              id="comentario"
              placeholder="Conte-nos sobre sua experiência com este curso..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comentario.length}/2000 caracteres
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={rating === 0 || isLoading}>
              {isLoading ? 'Salvando...' : existingReview ? 'Atualizar Avaliação' : 'Publicar Avaliação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
