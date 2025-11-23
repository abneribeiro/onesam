'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/layouts/AuthLayout';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const resetPasswordSchema = z
  .object({
    novaSenha: z
      .string()
      .min(8, { error: 'Senha deve ter no mínimo 8 caracteres' })
      .regex(/[A-Z]/, { error: 'Senha deve conter pelo menos uma letra maiúscula' })
      .regex(/[a-z]/, { error: 'Senha deve conter pelo menos uma letra minúscula' })
      .regex(/[0-9]/, { error: 'Senha deve conter pelo menos um número' }),
    confirmPassword: z.string().min(1, { error: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.novaSenha === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = memo(function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Token inválido ou ausente');
    }
  }, [token]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      novaSenha: '',
      confirmPassword: '',
    },
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const onSubmit = useCallback(
    async (data: ResetPasswordFormValues) => {
      if (!token) {
        setError('Token inválido');
        return;
      }

      try {
        setError('');
        await authClient.resetPassword({ token, newPassword: data.novaSenha });
        toast.success('Senha redefinida com sucesso!');
        router.push('/login');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao redefinir senha. Tente novamente.';
        setError(message);
      }
    },
    [token, router]
  );

  if (!tokenValid) {
    return (
      <AuthLayout>
        <Card className="w-full shadow-xl border-border">
          <CardHeader className="space-y-2 text-center px-6 py-8">
            <CardTitle className="text-3xl font-bold tracking-tight">Token Inválido</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              O link de recuperação de senha é inválido ou expirou
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <Link href="/forgot-password">
              <Button className="w-full h-11 text-base font-medium">
                Solicitar novo link
              </Button>
            </Link>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-primary hover:underline font-medium transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full shadow-xl border-border">
        <CardHeader className="space-y-2 text-center px-6 py-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Redefinir Senha</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Digite a sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="novaSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 8 caracteres (maiúscula, minúscula, número)"
                          autoComplete="new-password"
                          disabled={form.formState.isSubmitting}
                          className="h-11 text-base pr-11 transition-colors"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                          onClick={togglePasswordVisibility}
                          tabIndex={-1}
                          disabled={form.formState.isSubmitting}
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
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repita a nova senha"
                          autoComplete="new-password"
                          disabled={form.formState.isSubmitting}
                          className="h-11 text-base pr-11 transition-colors"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                          onClick={toggleConfirmPasswordVisibility}
                          tabIndex={-1}
                          disabled={form.formState.isSubmitting}
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
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium mt-6"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary hover:underline font-medium transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
});

export default ResetPasswordPage;
