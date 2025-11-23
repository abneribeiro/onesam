import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAula, useUpdateAula } from '@/hooks/queries/useAulas';
import type { Aula } from '@/services/aula.service';
import { aulaService } from '@/services/aula.service';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const aulaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  descricao: z.string().optional(),
  tipo: z.enum(['video', 'documento', 'link', 'texto', 'quiz']),
  conteudo: z.string().optional(),
  url: z.string().optional(),
  duracao: z.number().int().positive().optional(),
  ordem: z.number().int().nonnegative().optional(),
  obrigatoria: z.boolean().optional()
}).refine((data) => {
  // Validar que conteúdo ou URL estão presentes conforme o tipo
  if (data.tipo === 'texto' && !data.conteudo) {
    return false;
  }
  // Para vídeo, a URL pode vir do upload - será validada no submit
  if (['documento', 'link'].includes(data.tipo) && !data.url) {
    return false;
  }
  return true;
}, {
  message: 'Conteúdo ou URL é obrigatório dependendo do tipo',
  path: ['conteudo']
});

type AulaFormData = z.infer<typeof aulaSchema>;

interface AulaFormProps {
  moduloId: number;
  cursoId: number;
  aula?: Aula | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AulaForm({ moduloId, cursoId, aula, onSuccess, onCancel }: AulaFormProps) {
  const createAula = useCreateAula();
  const updateAula = useUpdateAula();

  // Estado para upload de video
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AulaFormData>({
    resolver: zodResolver(aulaSchema),
    defaultValues: {
      titulo: aula?.titulo || '',
      descricao: aula?.descricao || '',
      tipo: aula?.tipo || 'video',
      conteudo: aula?.conteudo || '',
      url: aula?.url || '',
      duracao: aula?.duracao || undefined,
      ordem: aula?.ordem || 0,
      obrigatoria: aula?.obrigatoria ?? true
    }
  });

  const tipoSelecionado = form.watch('tipo');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Formato de vídeo não suportado. Use MP4, WebM, OGG ou MOV.');
        return;
      }

      // Validar tamanho (100MB)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError('O vídeo deve ter no máximo 100MB.');
        return;
      }

      setVideoFile(file);
      setUploadError(null);
      setUploadedUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setVideoFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadVideo = async (): Promise<string | null> => {
    if (!videoFile) return null;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const url = await aulaService.uploadVideo(
        videoFile,
        cursoId,
        (progress) => setUploadProgress(progress)
      );
      setUploadedUrl(url);
      setIsUploading(false);
      return url;
    } catch (error) {
      setUploadError('Erro ao fazer upload do vídeo. Tente novamente.');
      setIsUploading(false);
      return null;
    }
  };

  const onSubmit = async (data: AulaFormData) => {
    try {
      let finalUrl = data.url;

      // Se for video e tem arquivo selecionado, fazer upload primeiro
      if (data.tipo === 'video' && videoFile) {
        const uploadedVideoUrl = await handleUploadVideo();
        if (!uploadedVideoUrl) {
          return; // Upload falhou, não continuar
        }
        finalUrl = uploadedVideoUrl;
      }

      // Validar que vídeo tem URL (seja do upload ou digitada)
      if (data.tipo === 'video' && !finalUrl) {
        setUploadError('Por favor, faça upload de um vídeo ou insira uma URL.');
        return;
      }

      const aulaData = {
        ...data,
        url: finalUrl
      };

      if (aula) {
        await updateAula.mutateAsync({
          id: aula.id,
          data: aulaData
        });
      } else {
        await createAula.mutateAsync({
          ...aulaData,
          IDModulo: moduloId
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Aula *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Aula 1 - Conceitos Básicos" {...field} />
              </FormControl>
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
                  placeholder="Descreva o conteúdo desta aula..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Conteúdo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="documento">Documento/PDF</SelectItem>
                    <SelectItem value="link">Link Externo</SelectItem>
                    <SelectItem value="texto">Texto/Artigo</SelectItem>
                    <SelectItem value="quiz">Quiz/Avaliação</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duracao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 30"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo condicional baseado no tipo */}
        {tipoSelecionado === 'texto' ? (
          <FormField
            control={form.control}
            name="conteudo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdo *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite o conteúdo da aula..."
                    className="min-h-[200px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Pode usar Markdown para formatar o texto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : tipoSelecionado === 'video' ? (
          <div className="space-y-4">
            {/* Upload de Video */}
            <div className="space-y-2">
              <Label>Upload de Vídeo</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  videoFile ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                  uploadError && "border-destructive"
                )}
              >
                {!videoFile ? (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-full bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Arraste um vídeo ou clique para selecionar</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP4, WebM, OGG ou MOV (max. 100MB)
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Selecionar Vídeo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {videoFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(videoFile.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          Enviando... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {uploadedUrl && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Vídeo enviado com sucesso!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Separador ou URL alternativa */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou insira uma URL
                </span>
              </div>
            </div>

            {/* URL do video */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=... ou URL direta do vídeo"
                      {...field}
                      disabled={!!videoFile || isUploading}
                    />
                  </FormControl>
                  <FormDescription>
                    URL do YouTube, Vimeo ou link direto para o vídeo (MP4, WebM)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL *</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder={
                      tipoSelecionado === 'documento'
                        ? 'https://exemplo.com/documento.pdf'
                        : 'https://exemplo.com'
                    }
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {tipoSelecionado === 'documento' && 'URL do documento (PDF, DOC, etc.)'}
                  {tipoSelecionado === 'link' && 'Link para recurso externo'}
                  {tipoSelecionado === 'quiz' && 'Link para o quiz/avaliação'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
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
                  Ordem de exibição (0 = primeira)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="obrigatoria"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end">
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label>Aula Obrigatória</Label>
                </div>
                <FormDescription>
                  Se obrigatória, deve ser concluída
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createAula.isPending || updateAula.isPending || isUploading}
          >
            {isUploading ? 'A enviar vídeo...' : aula ? 'Atualizar' : 'Criar'} Aula
          </Button>
        </div>
      </form>
    </Form>
  );
}
