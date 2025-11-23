import { Star, Trash2, Edit, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Review } from '@/services/review.service';

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: number;
  isAdmin?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  minhaReviewId?: number;
}

export function ReviewList({ reviews, currentUserId, isAdmin, onEdit, onDelete, minhaReviewId }: ReviewListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filtrar a review do usuário da lista principal (já é exibida separadamente)
  const filteredReviews = minhaReviewId
    ? reviews.filter(review => review.id !== minhaReviewId)
    : reviews;

  // Se não há reviews de outros usuários
  if (filteredReviews.length === 0) {
    // Se o usuário tem sua própria review, mostrar mensagem diferente
    if (minhaReviewId) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-sm">Ainda não há outras avaliações para este curso.</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Ainda não há avaliações para este curso.</p>
          <p className="text-sm mt-2">Seja o primeiro a avaliar!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredReviews.map((review) => {
        const isOwner = currentUserId === review.utilizadorId;
        const canEdit = isOwner;
        const canDelete = isOwner || isAdmin;

        return (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.utilizador?.avatar || undefined} />
                  <AvatarFallback>
                    {review.utilizador?.nome ? getInitials(review.utilizador.nome) : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-medium">{review.utilizador?.nome || 'Utilizador'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-4 w-4',
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.dataCriacao)}
                        </span>
                      </div>
                    </div>

                    {(canEdit || canDelete) && (
                      <div className="flex gap-1">
                        {canEdit && onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(review)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(review.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {review.comentario && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                      {review.comentario}
                    </p>
                  )}

                  {review.dataAtualizacao && review.dataAtualizacao !== review.dataCriacao && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Editado em {formatDate(review.dataAtualizacao)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
