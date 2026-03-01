import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuizParaResolver, useSubmeterQuiz } from '@/hooks/queries/useQuizzes';
import type { QuizResposta } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quizSubmissionSchema = z.object({
  respostas: z.record(z.string(), z.string())
});

type QuizSubmissionData = z.infer<typeof quizSubmissionSchema>;

interface QuizPlayerProps {
  quizId: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function QuizPlayer({ quizId, onComplete, onCancel }: QuizPlayerProps) {
  const { data: quizData, isLoading, error } = useQuizParaResolver(quizId);
  const submeterQuiz = useSubmeterQuiz();

  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tempoRestante, setTempoRestante] = useState<number | null>(null);

  const form = useForm<QuizSubmissionData>({
    resolver: zodResolver(quizSubmissionSchema),
    defaultValues: {
      respostas: {}
    }
  });

  const quiz = quizData?.quiz;
  const perguntas = quiz?.perguntas || [];
  const progresso = ((perguntaAtual + 1) / perguntas.length) * 100;

  // Timer para quiz com limite de tempo (se implementado no futuro)
  useEffect(() => {
    if (tempoRestante && tempoRestante > 0) {
      const timer = setTimeout(() => {
        setTempoRestante(tempoRestante - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (tempoRestante === 0) {
      // Auto-submit quando tempo acaba
      handleSubmit();
    }
  }, [tempoRestante]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Carregando quiz...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !quiz) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar quiz. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (!quizData.podeReitentar && quizData.tentativasRestantes === 0) {
    const melhorTentativa = quizData.tentativas[0]; // Assuming first is best
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {melhorTentativa?.aprovado ? (
              <Trophy className="h-12 w-12 text-yellow-500" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </div>
          <CardTitle>
            {melhorTentativa?.aprovado ? 'Quiz Concluído!' : 'Limite de Tentativas Excedido'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              Melhor Nota: <span className="text-primary">{quizData.melhorNota}/20</span>
            </p>
            <p className="text-muted-foreground">
              Nota Mínima: {quiz.notaMinima}/20
            </p>
          </div>

          {quizData.tentativas.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Histórico de Tentativas:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {quizData.tentativas.map((tentativa, index) => (
                  <div key={tentativa.id} className="flex justify-between items-center text-sm">
                    <span>Tentativa {tentativa.tentativa}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={tentativa.aprovado ? "default" : "destructive"}>
                        {tentativa.nota}/20
                      </Badge>
                      {tentativa.aprovado && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onCancel && (
            <Button onClick={onCancel} className="w-full">
              Voltar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const pergunta = perguntas[perguntaAtual];
  const respostas = form.watch('respostas');
  const respostasCompletas = perguntas.every((_, index) =>
    respostas[perguntas[index].id.toString()]
  );

  const proximaPergunta = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    }
  };

  const perguntaAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1);
    }
  };

  const handleSubmit = async () => {
    const formData = form.getValues();
    const quizRespostas: QuizResposta[] = perguntas.map(pergunta => ({
      perguntaId: pergunta.id,
      respostaSelecionada: parseInt(formData.respostas[pergunta.id.toString()] || '0')
    }));

    try {
      await submeterQuiz.mutateAsync({
        id: quizId,
        respostas: quizRespostas
      });
      onComplete?.();
    } catch (error) {
      console.error('Erro ao submeter quiz:', error);
    }
  };

  const confirmarSubmissao = () => {
    if (respostasCompletas) {
      setShowConfirmDialog(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <div>
              <CardTitle>{quiz.titulo}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span>Nota mínima: {quiz.notaMinima}/20</span>
                <span>Tentativa {(quizData.tentativas.length || 0) + 1}/{quiz.maxTentativas}</span>
                {quizData.tentativasRestantes > 0 && (
                  <Badge variant="secondary">
                    {quizData.tentativasRestantes} tentativas restantes
                  </Badge>
                )}
              </div>
            </div>
            {tempoRestante && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-mono">
                  {Math.floor(tempoRestante / 60)}:{(tempoRestante % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pergunta {perguntaAtual + 1} de {perguntas.length}</span>
              <span>{Math.round(progresso)}%</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Pergunta atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">Q{perguntaAtual + 1}.</span>
            {pergunta?.pergunta}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={respostas[pergunta?.id.toString()] || ''}
            onValueChange={(value: string) =>
              form.setValue(`respostas.${pergunta.id}`, value)
            }
            className="space-y-3"
          >
            {pergunta?.opcoes.map((opcao, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={index.toString()}
                  id={`pergunta-${pergunta.id}-opcao-${index}`}
                />
                <Label
                  htmlFor={`pergunta-${pergunta.id}-opcao-${index}`}
                  className="flex-1 cursor-pointer p-3 rounded-lg border transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium text-primary mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {opcao.texto}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={perguntaAnterior}
          disabled={perguntaAtual === 0}
        >
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {/* Indicadores de progresso */}
          <div className="flex gap-1">
            {perguntas.map((_, index) => (
              <button
                key={index}
                onClick={() => setPerguntaAtual(index)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-medium transition-colors",
                  index === perguntaAtual
                    ? "bg-primary text-primary-foreground"
                    : respostas[perguntas[index].id.toString()]
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-muted text-muted-foreground border"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {perguntaAtual < perguntas.length - 1 ? (
            <Button onClick={proximaPergunta}>
              Próxima
            </Button>
          ) : (
            <Button
              onClick={confirmarSubmissao}
              disabled={!respostasCompletas || submeterQuiz.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submeterQuiz.isPending ? 'Enviando...' : 'Finalizar Quiz'}
            </Button>
          )}
        </div>
      </div>

      {/* Alerta sobre perguntas não respondidas */}
      {!respostasCompletas && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Algumas perguntas ainda não foram respondidas. Complete todas antes de finalizar.
          </AlertDescription>
        </Alert>
      )}

      {/* Dialog de confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Quiz?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Tem certeza de que deseja finalizar este quiz?</p>
              <div className="text-sm space-y-1">
                <p><strong>Perguntas respondidas:</strong> {perguntas.length}</p>
                <p><strong>Nota mínima necessária:</strong> {quiz.notaMinima}/20</p>
                <p><strong>Tentativas restantes após esta:</strong> {quizData.tentativasRestantes - 1}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Esta ação não pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Finalizar Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}