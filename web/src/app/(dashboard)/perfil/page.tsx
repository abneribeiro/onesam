'use client';

export const dynamic = 'force-dynamic';


import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { getInitials } from '@/lib/utils';
import { Mail, User, Shield, Pencil, X, Upload, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdatePerfil, useUploadAvatar, useChangePassword } from '@/hooks/queries/usePerfil';

const perfilSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no minimo 2 caracteres').max(255),
  email: z.string().email('Email invalido'),
});

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual e obrigatoria'),
  novaSenha: z
    .string()
    .min(8, 'Nova senha deve ter no minimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiuscula')
    .regex(/[a-z]/, 'Deve conter pelo menos uma letra minuscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um numero'),
}).refine((data) => data.senhaAtual !== data.novaSenha, {
  message: 'Nova senha deve ser diferente da atual',
  path: ['novaSenha'],
});

type PerfilFormValues = z.infer<typeof perfilSchema>;
type SenhaFormValues = z.infer<typeof senhaSchema>;

export default function Perfil() {
  const { currentUser, refreshUserData } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePerfilMutation = useUpdatePerfil();
  const uploadAvatarMutation = useUploadAvatar();
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: currentUser?.nome || '',
      email: currentUser?.email || '',
    },
  });

  const {
    register: registerSenha,
    handleSubmit: handleSubmitSenha,
    formState: { errors: errorsSenha, isSubmitting: isSubmittingSenha },
    reset: resetSenha,
  } = useForm<SenhaFormValues>({
    resolver: zodResolver(senhaSchema),
  });

  if (!currentUser) {
    return null;
  }

  const handleEditToggle = () => {
    if (editMode) {
      reset({
        nome: currentUser.nome,
        email: currentUser.email,
      });
    }
    setEditMode(!editMode);
  };

  const onSubmitPerfil = async (data: PerfilFormValues) => {
    await updatePerfilMutation.mutateAsync(data);
    setEditMode(false);
  };

  const onSubmitSenha = async (data: SenhaFormValues) => {
    await changePasswordMutation.mutateAsync(data);
    setChangePasswordMode(false);
    resetSenha();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    await uploadAvatarMutation.mutateAsync({
      file,
      onProgress: setUploadProgress,
    });

    // Refresh session to get updated avatar from Better Auth
    await refreshUserData();

    setAvatarPreview(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie as informacoes da sua conta
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview || currentUser.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(currentUser.nome)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatarMutation.isPending}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <span className="text-white text-xs">{uploadProgress}%</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{currentUser.nome}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {currentUser.email}
              </CardDescription>
            </div>
            <Badge variant={currentUser.tipoPerfil === 'admin' ? 'default' : 'secondary'}>
              {currentUser.tipoPerfil === 'admin' ? 'Administrador' : 'Formando'}
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Informacoes Pessoais</h3>
            <Button
              variant={editMode ? 'ghost' : 'outline'}
              size="sm"
              onClick={handleEditToggle}
            >
              {editMode ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit(onSubmitPerfil)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nome">Nome Completo *</FieldLabel>
                  <Input
                    id="nome"
                    {...register('nome')}
                    disabled={isSubmitting}
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
                    {...register('email')}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'A guardar...' : 'Guardar Alteracoes'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Nome Completo</span>
                </div>
                <p className="text-lg font-medium">{currentUser.nome}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="text-lg font-medium">{currentUser.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Tipo de Perfil</span>
                </div>
                <p className="text-lg font-medium">
                  {currentUser.tipoPerfil === 'admin' ? 'Administrador' : 'Formando'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <Badge variant="outline" className="w-fit">
                  Ativo
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Seguranca</CardTitle>
              <CardDescription>Altere a sua senha</CardDescription>
            </div>
            <Button
              variant={changePasswordMode ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => {
                setChangePasswordMode(!changePasswordMode);
                if (changePasswordMode) {
                  resetSenha();
                }
              }}
            >
              {changePasswordMode ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {changePasswordMode && (
          <>
            <Separator />
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitSenha(onSubmitSenha)} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="senhaAtual">Senha Atual *</FieldLabel>
                    <Input
                      id="senhaAtual"
                      type="password"
                      {...registerSenha('senhaAtual')}
                      disabled={isSubmittingSenha}
                    />
                    {errorsSenha.senhaAtual && (
                      <p className="text-sm text-destructive">{errorsSenha.senhaAtual.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="novaSenha">Nova Senha *</FieldLabel>
                    <Input
                      id="novaSenha"
                      type="password"
                      {...registerSenha('novaSenha')}
                      disabled={isSubmittingSenha}
                    />
                    {errorsSenha.novaSenha && (
                      <p className="text-sm text-destructive">{errorsSenha.novaSenha.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Minimo 8 caracteres com maiuscula, minuscula e numero
                    </p>
                  </Field>
                </FieldGroup>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setChangePasswordMode(false);
                      resetSenha();
                    }}
                    disabled={isSubmittingSenha}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmittingSenha}>
                    {isSubmittingSenha ? 'A alterar...' : 'Alterar Senha'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
