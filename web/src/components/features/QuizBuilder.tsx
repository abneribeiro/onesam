import { useState } from 'react';
import { useQuizzesPorAula, useDeleteQuiz } from '@/hooks/queries/useQuizzes';
import { QuizForm } from '@/components/forms/QuizForm';
import type { Quiz } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, HelpCircle, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QuizBuilderProps {
  aulaId: number;
}

export function QuizBuilder({ aulaId }: QuizBuilderProps) {
  const { data: quizzes = [], isLoading } = useQuizzesPorAula(aulaId);
  const deleteQuiz = useDeleteQuiz();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const openCreateForm = () => {
    setSelectedQuiz(null);
    setIsFormOpen(true);
  };

  const openEditForm = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedQuiz(null);
  };

  const openDeleteDialog = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (quizToDelete) {
      try {
        await deleteQuiz.mutateAsync(quizToDelete.id);
        setDeleteDialogOpen(false);
        setQuizToDelete(null);
      } catch (error) {
        console.error('Erro ao deletar quiz:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Carregando quizzes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Quizzes da Aula</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os quizzes e avaliações desta aula
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Quiz
        </Button>
      </div>

      {/* Lista de Quizzes */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <HelpCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Nenhum quiz criado</h4>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Crie o primeiro quiz para esta aula. Os quizzes ajudam a avaliar o aprendizado dos alunos.
            </p>
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      {quiz.titulo}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">
                        Nota mínima: {quiz.notaMinima}/20
                      </Badge>
                      <Badge variant="outline">
                        {quiz.maxTentativas} tentativas
                      </Badge>
                      <span>
                        Criado {formatDistanceToNow(new Date(quiz.dataCriacao), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditForm(quiz)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(quiz)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">
                      {/* Placeholder para número de perguntas */}
                      -
                    </p>
                    <p className="text-sm text-muted-foreground">Perguntas</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {/* Placeholder para tentativas */}
                      -
                    </p>
                    <p className="text-sm text-muted-foreground">Tentativas</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600">
                      {/* Placeholder para média */}
                      -
                    </p>
                    <p className="text-sm text-muted-foreground">Nota Média</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog do formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuiz ? 'Editar Quiz' : 'Novo Quiz'}
            </DialogTitle>
          </DialogHeader>
          <QuizForm
            aulaId={aulaId}
            quiz={selectedQuiz}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de eliminação */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja eliminar o quiz "{quizToDelete?.titulo}"?
              Esta ação não pode ser desfeita e todos os dados de tentativas dos alunos serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}