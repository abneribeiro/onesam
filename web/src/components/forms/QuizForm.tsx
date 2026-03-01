import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateQuiz, useUpdateQuiz } from '@/hooks/queries/useQuizzes';
import type { Quiz } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const perguntaSchema = z.object({
  pergunta: z.string().min(1, 'Pergunta é obrigatória'),
  opcoes: z.array(z.string().min(1, 'Opção não pode estar vazia')).min(2, 'Mínimo 2 opções').max(6, 'Máximo 6 opções'),
  respostaCorreta: z.number().min(0, 'Resposta correta é obrigatória'),
  ordem: z.number().int().nonnegative().optional()
});

const quizSchema = z.object({
  aulaId: z.number().int().positive(),
  titulo: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  notaMinima: z.number().min(0, 'Nota mínima deve ser >= 0').max(20, 'Nota máxima é 20').optional().default(10),
  maxTentativas: z.number().int().min(1, 'Mínimo 1 tentativa').max(10, 'Máximo 10 tentativas').optional().default(3),
  perguntas: z.array(perguntaSchema).min(1, 'Mínimo 1 pergunta').max(50, 'Máximo 50 perguntas')
});

type QuizFormData = z.infer<typeof quizSchema>;

interface QuizFormProps {
  aulaId: number;
  quiz?: Quiz | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function QuizForm({ aulaId, quiz, onSuccess, onCancel }: QuizFormProps) {
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();

  const form = useForm({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      aulaId,
      titulo: quiz?.titulo || '',
      notaMinima: quiz?.notaMinima || 10,
      maxTentativas: quiz?.maxTentativas || 3,
      perguntas: quiz ? [] : [
        {
          pergunta: '',
          opcoes: ['', ''],
          respostaCorreta: 0,
          ordem: 0
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'perguntas'
  });

  const adicionarPergunta = () => {
    const novaOrdem = fields.length;
    append({
      pergunta: '',
      opcoes: ['', ''],
      respostaCorreta: 0,
      ordem: novaOrdem
    });
  };

  const adicionarOpcao = (perguntaIndex: number) => {
    const perguntaAtual = form.getValues(`perguntas.${perguntaIndex}`);
    if (perguntaAtual.opcoes.length < 6) {
      const novasOpcoes = [...perguntaAtual.opcoes, ''];
      form.setValue(`perguntas.${perguntaIndex}.opcoes`, novasOpcoes);
    }
  };

  const removerOpcao = (perguntaIndex: number, opcaoIndex: number) => {
    const perguntaAtual = form.getValues(`perguntas.${perguntaIndex}`);
    if (perguntaAtual.opcoes.length > 2) {
      const novasOpcoes = perguntaAtual.opcoes.filter((_, index) => index !== opcaoIndex);
      form.setValue(`perguntas.${perguntaIndex}.opcoes`, novasOpcoes);

      // Ajustar resposta correta se necessário
      if (perguntaAtual.respostaCorreta >= opcaoIndex && perguntaAtual.respostaCorreta > 0) {
        form.setValue(`perguntas.${perguntaIndex}.respostaCorreta`, perguntaAtual.respostaCorreta - 1);
      }
    }
  };

  const onSubmit = async (data: QuizFormData) => {
    try {
      if (quiz) {
        await updateQuiz.mutateAsync({
          id: quiz.id,
          data
        });
      } else {
        await createQuiz.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar quiz:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações básicas do quiz */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Quiz *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Avaliação - Módulo 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="notaMinima"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota Mínima (0-20) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Nota mínima para aprovação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxTentativas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de Tentativas *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Quantas vezes o aluno pode tentar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Perguntas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Perguntas
              <Badge variant="secondary" className="ml-2">
                {fields.length}
              </Badge>
            </CardTitle>
            <Button type="button" onClick={adicionarPergunta} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, perguntaIndex) => (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      Pergunta {perguntaIndex + 1}
                    </CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(perguntaIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pergunta */}
                  <FormField
                    control={form.control}
                    name={`perguntas.${perguntaIndex}.pergunta`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enunciado da Pergunta *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite a pergunta..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Opções */}
                  <div className="space-y-2">
                    <FormLabel>Opções de Resposta *</FormLabel>
                    <FormField
                      control={form.control}
                      name={`perguntas.${perguntaIndex}.opcoes`}
                      render={({ field }) => (
                        <div className="space-y-2">
                          {field.value.map((opcao, opcaoIndex) => (
                            <div key={opcaoIndex} className="flex items-center gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <FormField
                                  control={form.control}
                                  name={`perguntas.${perguntaIndex}.respostaCorreta`}
                                  render={({ field: respostaField }) => (
                                    <input
                                      type="radio"
                                      checked={respostaField.value === opcaoIndex}
                                      onChange={() => respostaField.onChange(opcaoIndex)}
                                      className="text-primary"
                                    />
                                  )}
                                />
                                <Input
                                  placeholder={`Opção ${String.fromCharCode(65 + opcaoIndex)}`}
                                  value={opcao}
                                  onChange={(e) => {
                                    const novasOpcoes = [...field.value];
                                    novasOpcoes[opcaoIndex] = e.target.value;
                                    field.onChange(novasOpcoes);
                                  }}
                                  className={cn(
                                    form.watch(`perguntas.${perguntaIndex}.respostaCorreta`) === opcaoIndex &&
                                    "border-green-500 bg-green-50"
                                  )}
                                />
                              </div>
                              {field.value.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removerOpcao(perguntaIndex, opcaoIndex)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}

                          {field.value.length < 6 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => adicionarOpcao(perguntaIndex)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Opção
                            </Button>
                          )}
                        </div>
                      )}
                    />
                    <FormMessage />
                  </div>

                  {/* Resposta correta selecionada */}
                  <FormField
                    control={form.control}
                    name={`perguntas.${perguntaIndex}.respostaCorreta`}
                    render={({ field }) => (
                      <div className="text-sm text-muted-foreground">
                        Resposta correta:
                        <Badge variant="secondary" className="ml-2">
                          Opção {String.fromCharCode(65 + field.value)}
                        </Badge>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createQuiz.isPending || updateQuiz.isPending}
          >
            {quiz ? 'Atualizar' : 'Criar'} Quiz
          </Button>
        </div>
      </form>
    </Form>
  );
}