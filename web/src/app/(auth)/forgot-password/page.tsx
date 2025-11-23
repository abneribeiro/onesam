'use client';

import { useState, memo, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthLayout } from '@/layouts/AuthLayout';

const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Email inválido' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = memo(function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = useCallback(async (data: ForgotPasswordFormValues) => {
    try {
      setError('');
      setSuccess(false);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3000'}/api/auth/forget-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          redirectTo: `${window.location.origin}/reset-password`
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar email de recuperação');
      }
      setSuccess(true);
      form.reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar email. Tente novamente.';
      setError(message);
    }
  }, [form]);

  return (
    <AuthLayout>
      <Card className="w-full shadow-xl border-border">
        <CardHeader className="space-y-2 text-center px-6 py-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Esqueceu a senha?</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Digite o seu email para receber instruções de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {success && (
            <Alert variant="success" className="mb-6">
              <AlertDescription>
                Email enviado! Verifique a sua caixa de entrada.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        autoComplete="email"
                        disabled={form.formState.isSubmitting}
                        className="h-11 text-base transition-colors"
                      />
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
                    Enviando...
                  </>
                ) : (
                  'Enviar instruções'
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

export default ForgotPasswordPage;
