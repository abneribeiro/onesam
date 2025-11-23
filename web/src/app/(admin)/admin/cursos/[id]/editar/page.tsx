'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Upload, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { LoadingState } from '@/components/features/LoadingState';
import { cursoService } from '@/services/curso.service';
import { areaService } from '@/services/area.service';
import { categoriaService } from '@/services/categoria.service';
import { toast } from 'sonner';
import type { EstadoCurso, AreaBase, CategoriaBase } from '@/types';

const cursoSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter no minimo 3 caracteres' }),
  descricao: z.string().min(10, { message: 'Descricao deve ter no minimo 10 caracteres' }),
  estado: z.enum(['planeado', 'em_curso', 'terminado', 'arquivado'] as const, { message: 'Selecione o estado' }),
  nivel: z.enum(['iniciante', 'intermedio', 'avancado'] as const, { message: 'Selecione o nivel' }),
  cargaHoraria: z.number().min(1, { message: 'Carga horaria minima de 1 hora' }),
  dataInicio: z.string().min(1, { message: 'Data de inicio e obrigatoria' }),
  dataFim: z.string().min(1, { message: 'Data de fim e obrigatoria' }),
  dataLimiteInscricao: z.string().min(1, { message: 'Data limite de inscricao e obrigatoria' }),
  areaId: z.number().min(1, { message: 'Selecione uma area' }),
  categoriaId: z.number().min(1, { message: 'Selecione uma categoria' }),
  limiteVagas: z.number().optional(),
  notaMinimaAprovacao: z.number().min(0).max(100).optional(),
});

type CursoFormValues = z.infer<typeof cursoSchema>;

export default function CreateEditCurso() {
  const params = useParams();
  const id = params.id as string;
  const isEdit = Boolean(id) && id !== 'criar';
  const router = useRouter();
  const [loading, setLoading] = useState(isEdit);
  const [areas, setAreas] = useState<AreaBase[]>([]);
  const [categorias, setCategorias] = useState<CategoriaBase[]>([]);
  const [imagemCurso, setImagemCurso] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<CursoFormValues>({
    resolver: zodResolver(cursoSchema),
    defaultValues: {
      estado: 'planeado',
      nivel: 'iniciante',
      cargaHoraria: 10,
    },
  });

  const areaId = watch('areaId');

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    if (areaId && areaId > 0) {
      loadCategoriasByArea(areaId);
    }
  }, [areaId]);

  useEffect(() => {
    if (isEdit && id) {
      loadCurso(parseInt(id));
    }
  }, [id, isEdit]);

  const loadAreas = async () => {
    try {
      const data = await areaService.getAll();
      setAreas(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erro ao carregar areas');
    }
  };

  const loadCategoriasByArea = async (areaId: number) => {
    try {
      const data = await categoriaService.getByArea(areaId);
      setCategorias(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erro ao carregar categorias');
    }
  };

  const loadCurso = async (cursoId: number) => {
    try {
      setLoading(true);
      const curso = await cursoService.buscarCurso(cursoId);
      reset({
        nome: curso.nome,
        descricao: curso.descricao || '',
        estado: curso.estado as EstadoCurso,
        nivel: curso.nivel,
        cargaHoraria: curso.cargaHoraria || 10,
        dataInicio: curso.dataInicio ? new Date(curso.dataInicio).toISOString().split('T')[0] : '',
        dataFim: curso.dataFim ? new Date(curso.dataFim).toISOString().split('T')[0] : '',
        dataLimiteInscricao: curso.dataLimiteInscricao ? new Date(curso.dataLimiteInscricao).toISOString().split('T')[0] : '',
        areaId: curso.areaId || 1,
        categoriaId: curso.categoriaId || 1,
        limiteVagas: curso.limiteVagas || undefined,
        notaMinimaAprovacao: curso.notaMinimaAprovacao || 10,
      });
    } catch {
      toast.error('Erro ao carregar curso');
      router.push('/admin/cursos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = useCallback(
    async (data: CursoFormValues) => {
      try {
        const cursoData = {
          ...data,
          IDArea: data.areaId,
          IDCategoria: data.categoriaId,
        };

        if (isEdit && id) {
          await cursoService.atualizarCursoComImagem(parseInt(id), cursoData, imagemCurso || undefined);
          toast.success('Curso atualizado com sucesso');
        } else {
          await cursoService.criarCursoComImagem(cursoData, imagemCurso || undefined);
          toast.success('Curso criado com sucesso');
        }
        router.push('/admin/cursos');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao guardar curso';
        toast.error(message);
      }
    },
    [isEdit, id, router, imagemCurso]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Apenas ficheiros de imagem sao permitidos');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('A imagem deve ter no maximo 10MB');
        return;
      }
      setImagemCurso(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setImagemCurso(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <LoadingState message="A carregar..." />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/cursos')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? 'Editar Curso' : 'Criar Curso'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Atualize as informacoes do curso' : 'Preencha os dados do novo curso'}
            </p>
          </div>
        </div>
        {isEdit && (
          <Link href={`/admin/cursos/${id}/conteudo`}>
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Gerir Conteudos
            </Button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacoes Basicas</CardTitle>
            <CardDescription>Dados principais do curso</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="nome">Nome do Curso *</FieldLabel>
                <Input
                  id="nome"
                  placeholder="Ex: Introducao ao React"
                  disabled={isSubmitting}
                  {...register('nome')}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="descricao">Descricao *</FieldLabel>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o conteudo e objetivos do curso..."
                  rows={4}
                  disabled={isSubmitting}
                  {...register('descricao')}
                />
                {errors.descricao && (
                  <p className="text-sm text-destructive">{errors.descricao.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="nivel">Nivel *</FieldLabel>
                <Select
                  onValueChange={(value) => setValue('nivel', value as 'iniciante' | 'intermedio' | 'avancado')}
                  defaultValue="iniciante"
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="nivel">
                    <SelectValue placeholder="Selecione o nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermedio">Intermedio</SelectItem>
                    <SelectItem value="avancado">Avancado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nivel && (
                  <p className="text-sm text-destructive">{errors.nivel.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="estado">Estado *</FieldLabel>
                <Select
                  onValueChange={(value) => setValue('estado', value as EstadoCurso)}
                  defaultValue="planeado"
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planeado">Planeado</SelectItem>
                    <SelectItem value="em_curso">Em Curso</SelectItem>
                    <SelectItem value="terminado">Terminado</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <p className="text-sm text-destructive">{errors.estado.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="cargaHoraria">Carga Horaria (horas) *</FieldLabel>
                <Input
                  id="cargaHoraria"
                  type="number"
                  min="1"
                  placeholder="Ex: 40"
                  disabled={isSubmitting}
                  {...register('cargaHoraria', { valueAsNumber: true })}
                />
                {errors.cargaHoraria && (
                  <p className="text-sm text-destructive">{errors.cargaHoraria.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="limiteVagas">Limite de Vagas</FieldLabel>
                <Input
                  id="limiteVagas"
                  type="number"
                  min="1"
                  placeholder="Ex: 30 (opcional)"
                  disabled={isSubmitting}
                  {...register('limiteVagas', { valueAsNumber: true })}
                />
                {errors.limiteVagas && (
                  <p className="text-sm text-destructive">{errors.limiteVagas.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="dataInicio">Data de Inicio *</FieldLabel>
                <Input
                  id="dataInicio"
                  type="date"
                  disabled={isSubmitting}
                  {...register('dataInicio')}
                />
                {errors.dataInicio && (
                  <p className="text-sm text-destructive">{errors.dataInicio.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="dataFim">Data de Fim *</FieldLabel>
                <Input
                  id="dataFim"
                  type="date"
                  disabled={isSubmitting}
                  {...register('dataFim')}
                />
                {errors.dataFim && (
                  <p className="text-sm text-destructive">{errors.dataFim.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="dataLimiteInscricao">Data Limite de Inscricao *</FieldLabel>
                <Input
                  id="dataLimiteInscricao"
                  type="date"
                  disabled={isSubmitting}
                  {...register('dataLimiteInscricao')}
                />
                {errors.dataLimiteInscricao && (
                  <p className="text-sm text-destructive">{errors.dataLimiteInscricao.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="areaId">Area *</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    const id = parseInt(value);
                    setValue('areaId', id);
                    setValue('categoriaId', 0);
                  }}
                  defaultValue={String(areaId || 0)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="areaId">
                    <SelectValue placeholder="Selecione uma area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={String(area.id)}>
                        {area.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.areaId && (
                  <p className="text-sm text-destructive">{errors.areaId.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="categoriaId">Categoria *</FieldLabel>
                <Select
                  onValueChange={(value) => setValue('categoriaId', parseInt(value))}
                  defaultValue={String(watch('categoriaId') || 0)}
                  disabled={isSubmitting || !areaId || categorias.length === 0}
                >
                  <SelectTrigger id="categoriaId">
                    <SelectValue placeholder={!areaId ? "Selecione uma area primeiro" : categorias.length === 0 ? "Nenhuma categoria disponivel" : "Selecione uma categoria"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={String(categoria.id)}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoriaId && (
                  <p className="text-sm text-destructive">{errors.categoriaId.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="notaMinimaAprovacao">Nota Minima de Aprovacao (%)</FieldLabel>
                <Input
                  id="notaMinimaAprovacao"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ex: 70 (opcional)"
                  disabled={isSubmitting}
                  {...register('notaMinimaAprovacao', { valueAsNumber: true })}
                />
                {errors.notaMinimaAprovacao && (
                  <p className="text-sm text-destructive">{errors.notaMinimaAprovacao.message}</p>
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagem do Curso</CardTitle>
            <CardDescription>Adicione uma imagem para o curso (opcional, maximo 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imagemCurso"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imagemCurso ? 'Alterar Imagem' : 'Selecionar Imagem'}
                </Button>
                {imagemCurso && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {previewUrl && (
                <div className="relative w-full max-w-md rounded-lg border overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/cursos')}
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
              isEdit ? 'Atualizar Curso' : 'Criar Curso'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
