'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, Users, Award } from 'lucide-react';
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

const loginSchema = z.object({
  email: z.email({ error: 'Email invalido' }),
  palavrapasse: z.string().min(8, { error: 'A senha deve ter no minimo 8 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const features = [
  {
    icon: BookOpen,
    title: 'Cursos de Qualidade',
    description: 'Aceda a cursos desenvolvidos por especialistas',
  },
  {
    icon: Users,
    title: 'Comunidade',
    description: 'Conecte-se com outros formandos',
  },
  {
    icon: Award,
    title: 'Certificados',
    description: 'Obtenha certificados ao concluir cursos',
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(
    async (data: LoginFormValues) => {
      try {
        const user = await login(data.email, data.palavrapasse);
        const redirectPath = getDefaultRedirectPath(user.tipoPerfil);
        router.push(redirectPath);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao fazer login';
        toast.error(message);
      }
    },
    [login, router]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Form Section */}
        <div className="flex items-center justify-center p-6 lg:p-8">
          <div className="mx-auto w-full max-w-md space-y-8 animate-fade-in">
            {/* Logo and Header */}
            <div className="flex flex-col space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 transition-transform duration-200 hover:scale-105">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
                <p className="text-muted-foreground mt-2">
                  Entre com o seu email e senha para acessar a plataforma
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="h-11"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="palavrapasse">Senha</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                      tabIndex={-1}
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="palavrapasse"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      className="h-11 pr-10"
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
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.palavrapasse && (
                    <p className="text-sm text-destructive mt-1">{errors.palavrapasse.message}</p>
                  )}
                </Field>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </FieldGroup>
            </form>

            <FieldDescription className="text-center">
              Nao tem uma conta?{' '}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Registe-se
              </Link>
            </FieldDescription>
          </div>
        </div>

        {/* Hero Section */}
        <div className="hidden lg:flex relative h-full overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/90" />

          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
            <div className="max-w-lg space-y-8">
              {/* Main Title */}
              <div className="space-y-4 text-center animate-slide-up">
                <h2 className="text-4xl font-bold leading-tight">
                  Plataforma de
                  <span className="block text-white/90">Gestao de Cursos</span>
                </h2>
                <p className="text-lg text-white/80">
                  Gerencie cursos, formandos e inscricoes de forma simples e eficiente.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-8">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/15"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-white/70">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
