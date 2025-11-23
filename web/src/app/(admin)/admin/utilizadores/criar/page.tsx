'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { utilizadorService } from '@/services/utilizador.service';
import { toast } from 'sonner';
import type { TipoPerfil } from '@/types';

const utilizadorSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  senha: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
  tipoPerfil: z.enum(['admin', 'formando'] as const, { message: 'Selecione o tipo de perfil' }),
  ativo: z.boolean(),
});

type UtilizadorFormValues = z.infer<typeof utilizadorSchema>;

export default function CriarUtilizadorPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UtilizadorFormValues>({
    resolver: zodResolver(utilizadorSchema),
    defaultValues: {
      tipoPerfil: 'formando',
      ativo: true,
    },
  });

  const ativo = watch('ativo');

  const onSubmit = useCallback(
    async (data: UtilizadorFormValues) => {
      try {
        const utilizadorData = {
          nome: data.nome,
          email: data.email,
          tipoPerfil: data.tipoPerfil,
          ativo: data.ativo,
          senha: data.senha,
        };

        await utilizadorService.create(utilizadorData);
        toast.success('Utilizador criado com sucesso');
        router.push('/admin/utilizadores');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao guardar utilizador';
        toast.error(message);
      }
    },
    [router]
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/utilizadores')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Utilizador</h1>
          <p className="text-muted-foreground">
            Preencha os dados do novo utilizador
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do utilizador</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="nome">Nome Completo *</FieldLabel>
                <Input
                  id="nome"
                  placeholder="Ex: João Silva"
                  disabled={isSubmitting}
                  {...register('nome')}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao.silva@exemplo.com"
                  disabled={isSubmitting}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="tipoPerfil">Tipo de Perfil *</FieldLabel>
                <Select
                  onValueChange={(value) => setValue('tipoPerfil', value as TipoPerfil)}
                  defaultValue="formando"
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="tipoPerfil">
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formando">Formando</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipoPerfil && (
                  <p className="text-sm text-destructive">{errors.tipoPerfil.message}</p>
                )}
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="senha">Senha *</FieldLabel>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                  {...register('senha')}
                />
                {errors.senha && (
                  <p className="text-sm text-destructive">{errors.senha.message}</p>
                )}
              </Field>

              <Field className="flex items-center gap-2 md:col-span-2">
                <Switch
                  id="ativo"
                  checked={ativo}
                  onCheckedChange={(checked) => setValue('ativo', checked)}
                  disabled={isSubmitting}
                />
                <FieldLabel htmlFor="ativo" className="mt-0! cursor-pointer">
                  Utilizador ativo
                </FieldLabel>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/utilizadores')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A guardar...
              </>
            ) : (
              'Criar Utilizador'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
