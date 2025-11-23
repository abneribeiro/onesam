'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultRedirectPath } from '@/lib/auth';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    nome: z.string().min(3, { error: 'Nome deve ter no mínimo 3 caracteres' }),
    email: z.email({ error: 'Email inválido' }),
    palavrapasse: z
      .string()
      .min(8, { error: 'Senha deve ter no mínimo 8 caracteres' })
      .regex(/[A-Z]/, { error: 'Senha deve conter pelo menos uma letra maiúscula' })
      .regex(/[a-z]/, { error: 'Senha deve conter pelo menos uma letra minúscula' })
      .regex(/[0-9]/, { error: 'Senha deve conter pelo menos um número' }),
    confirmPassword: z.string().min(1, { error: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.palavrapasse === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = useCallback(
    async (data: RegisterFormValues) => {
      try {
        const user = await registerUser({
          nome: data.nome,
          email: data.email,
          palavrapasse: data.palavrapasse,
          tipoPerfil: 'formando',
        });
        const redirectPath = getDefaultRedirectPath(user.tipoPerfil);
        router.push(redirectPath);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao registar';
        toast.error(message);
      }
    },
    [registerUser, router]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 lg:p-8">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
              <p className="text-sm text-muted-foreground">
                Preencha os dados abaixo para criar a sua conta
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="João Silva"
                    autoComplete="name"
                    disabled={isSubmitting}
                    {...register('nome')}
                  />
                  {errors.nome && (
                    <p className="text-sm text-destructive">{errors.nome.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </Field>


                <Field>
                  <FieldLabel htmlFor="palavrapasse">Senha</FieldLabel>
                  <div className="relative">
                    <Input
                      id="palavrapasse"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres (maiúscula, minúscula, número)"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      className="pr-10"
                      {...register('palavrapasse')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      </span>
                    </Button>
                  </div>
                  {errors.palavrapasse && (
                    <p className="text-sm text-destructive">{errors.palavrapasse.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      className="pr-10"
                      {...register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      </span>
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </Field>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </FieldGroup>
            </form>

            <FieldDescription className="text-center">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </FieldDescription>
          </div>
        </div>

        <div className="hidden lg:flex relative h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary" />
          <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
            <div className="max-w-md space-y-6 text-center">
              <h2 className="text-4xl font-bold">
                Junte-se à nossa comunidade
              </h2>
              <p className="text-lg text-white/90">
                Aceda a cursos, desenvolva novas competências e participe da nossa comunidade de formandos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
