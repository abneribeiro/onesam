import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateModulo, useUpdateModulo } from '@/hooks/queries/useModulos';
import type { Modulo } from '@/services/modulo.service';
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

const moduloSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  descricao: z.string().optional(),
  ordem: z.number().int().nonnegative().optional()
});

type ModuloFormData = z.infer<typeof moduloSchema>;

interface ModuloFormProps {
  cursoId: number;
  modulo?: Modulo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ModuloForm({ cursoId, modulo, onSuccess, onCancel }: ModuloFormProps) {
  const createModulo = useCreateModulo();
  const updateModulo = useUpdateModulo();

  const form = useForm<ModuloFormData>({
    resolver: zodResolver(moduloSchema),
    defaultValues: {
      titulo: modulo?.titulo || '',
      descricao: modulo?.descricao || '',
      ordem: modulo?.ordem || 0
    }
  });

  const onSubmit = async (data: ModuloFormData) => {
    try {
      if (modulo) {
        await updateModulo.mutateAsync({
          id: modulo.id,
          data
        });
      } else {
        await createModulo.mutateAsync({
          ...data,
          IDCurso: cursoId
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar módulo:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Módulo *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Módulo 1 - Introdução" {...field} />
              </FormControl>
              <FormDescription>
                Nome que identifica o módulo no curso
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o que será abordado neste módulo..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Breve descrição do conteúdo do módulo (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ordem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Ordem de exibição do módulo (0 = primeiro)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createModulo.isPending || updateModulo.isPending}>
            {modulo ? 'Atualizar' : 'Criar'} Módulo
          </Button>
        </div>
      </form>
    </Form>
  );
}
