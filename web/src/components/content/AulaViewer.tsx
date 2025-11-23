'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import type { Aula } from '@/services/aula.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Video, AlertCircle, Download, FileIcon, Eye, RefreshCw } from 'lucide-react';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface AulaViewerProps {
  aula: Aula;
  onProgressUpdate?: (state: { played: number; playedSeconds: number }) => void;
}

export function AulaViewer({ aula, onProgressUpdate }: AulaViewerProps) {
  switch (aula.tipo) {
    case 'video':
      return <VideoViewer key={`video-${aula.id}`} url={aula.url!} aula={aula} onProgressUpdate={onProgressUpdate} />;
    case 'documento':
      return <DocumentoViewer url={aula.url!} titulo={aula.titulo} />;
    case 'link':
      return <LinkViewer url={aula.url!} titulo={aula.titulo} />;
    case 'texto':
      return <TextoViewer conteudo={aula.conteudo!} />;
    case 'quiz':
      return <QuizViewer url={aula.url!} />;
    default:
      return <div>Tipo de conteúdo não suportado</div>;
  }
}

interface VideoViewerProps {
  url: string;
  aula: Aula;
  onProgressUpdate?: (state: { played: number; playedSeconds: number }) => void;
}

function VideoViewer({ url, aula, onProgressUpdate }: VideoViewerProps) {
  const savedTimeKey = `aula-${aula.id}-time`;
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  // Reset error state when URL changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage(null);
    setIsLoading(true);

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[VideoViewer] Loading video:', {
        aulaId: aula.id,
        url,
        isSupabase: url?.includes('supabase.co'),
      });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [url, aula.id]);

  const getSavedTime = useCallback(() => {
    try {
      const saved = localStorage.getItem(savedTimeKey);
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  }, [savedTimeKey]);

  const handleProgress = useCallback((state: { played: number; playedSeconds: number }) => {
    if (!mountedRef.current) return;

    // Save progress to localStorage
    try {
      localStorage.setItem(savedTimeKey, state.playedSeconds.toString());
    } catch (e) {
      console.warn('[VideoViewer] Failed to save progress:', e);
    }

    // Call parent callback if provided
    if (onProgressUpdate) {
      onProgressUpdate(state);
    }
  }, [savedTimeKey, onProgressUpdate]);

  // Verificar se é uma URL de vídeo válida
  const isValidVideoUrl = (url: string): boolean => {
    if (!url) return false;

    // URLs do YouTube
    const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    if (youtubeRegex.test(url)) return true;

    // URLs do Vimeo
    const vimeoRegex = /vimeo\.com/;
    if (vimeoRegex.test(url)) return true;

    // URLs do Supabase Storage (mais abrangente)
    const supabaseRegex = /supabase\.(co|com|io)\/storage/;
    if (supabaseRegex.test(url)) return true;

    // URLs diretas de vídeo (MP4, WebM, OGG, etc.)
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|m3u8|mpd)(\?.*)?$/i;
    if (videoExtensions.test(url)) return true;

    // Outras plataformas suportadas pelo ReactPlayer
    const supportedPlatforms = [
      /facebook\.com/,
      /fb\.watch/,
      /soundcloud\.com/,
      /streamable\.com/,
      /wistia\.com/,
      /twitch\.tv/,
      /dailymotion\.com/,
      /mixcloud\.com/,
      /vidyard\.com/
    ];

    for (const platform of supportedPlatforms) {
      if (platform.test(url)) return true;
    }

    // Se parece ser uma URL HTTP/HTTPS válida, tentar reproduzir
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleError = useCallback(() => {
    if (!mountedRef.current) return;

    console.error('[VideoViewer] Video playback error:', {
      aulaId: aula.id,
      url,
    });

    setHasError(true);
    setErrorMessage('Não foi possível reproduzir este vídeo. Verifique se a URL está correta ou se o vídeo está disponível.');
    setIsLoading(false);
  }, [aula.id, url]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    setIsLoading(true);
  }, []);

  if (!url || !isValidVideoUrl(url)) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">URL de vídeo inválida ou não suportada</p>
        <p className="text-sm text-muted-foreground mb-4">
          Formatos suportados: YouTube, Vimeo, MP4, WebM, e outros
        </p>
        {url && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-mono break-all">{url}</p>
            <Button variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir link original
              </a>
            </Button>
          </div>
        )}
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="font-medium mb-2">Erro ao carregar o vídeo</p>
        <p className="text-sm text-muted-foreground mb-4">
          {errorMessage || 'Não foi possível reproduzir este vídeo. Verifique se a URL está correta.'}
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir link original
            </a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <VideoPlayer
      key={`player-${aula.id}-${url}`}
      url={url}
      onProgress={handleProgress}
      autoSaveProgress={true}
      initialTime={getSavedTime()}
      onError={handleError}
    />
  );
}

function DocumentoViewer({ url, titulo }: { url: string; titulo: string }) {
  const [previewError, setPreviewError] = useState(false);

  // Detectar tipo de documento
  const getDocumentType = (url: string): 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image' | 'text' | 'unknown' => {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.endsWith('.pdf')) return 'pdf';
    if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) return 'word';
    if (lowerUrl.endsWith('.xls') || lowerUrl.endsWith('.xlsx')) return 'excel';
    if (lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx')) return 'powerpoint';
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(lowerUrl)) return 'image';
    if (/\.(txt|md|json|xml|csv)$/i.test(lowerUrl)) return 'text';

    return 'unknown';
  };

  const documentType = getDocumentType(url);

  // Gerar URL para visualização via Google Docs Viewer (para Word, Excel, PowerPoint)
  const getGoogleViewerUrl = (url: string): string => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  // Obter ícone apropriado baseado no tipo
  const getDocumentIcon = () => {
    switch (documentType) {
      case 'pdf':
        return <FileText className="h-16 w-16 text-red-500 mx-auto" />;
      case 'word':
        return <FileIcon className="h-16 w-16 text-blue-500 mx-auto" />;
      case 'excel':
        return <FileIcon className="h-16 w-16 text-green-500 mx-auto" />;
      case 'powerpoint':
        return <FileIcon className="h-16 w-16 text-orange-500 mx-auto" />;
      case 'image':
        return <Eye className="h-16 w-16 text-purple-500 mx-auto" />;
      default:
        return <FileText className="h-16 w-16 text-muted-foreground mx-auto" />;
    }
  };

  // Obter label do tipo de documento
  const getDocumentLabel = () => {
    switch (documentType) {
      case 'pdf': return 'Documento PDF';
      case 'word': return 'Documento Word';
      case 'excel': return 'Planilha Excel';
      case 'powerpoint': return 'Apresentação PowerPoint';
      case 'image': return 'Imagem';
      case 'text': return 'Arquivo de Texto';
      default: return 'Documento';
    }
  };

  // Verificar se pode visualizar inline
  const canPreviewInline = documentType === 'pdf' || documentType === 'image' ||
    documentType === 'word' || documentType === 'excel' || documentType === 'powerpoint';

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        {getDocumentIcon()}
        <div>
          <h3 className="font-semibold mb-2">{titulo}</h3>
          <p className="text-sm text-muted-foreground mb-1">{getDocumentLabel()}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Clique no botão abaixo para visualizar ou baixar o documento
          </p>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <Button asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Documento
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={url} download>
              <Download className="mr-2 h-4 w-4" />
              Baixar
            </a>
          </Button>
        </div>

        {/* Preview para imagens */}
        {documentType === 'image' && !previewError && (
          <div className="mt-6 border-t pt-6">
            <p className="text-xs text-muted-foreground mb-4">Pré-visualização:</p>
            <div className="relative w-full bg-muted/50 rounded-lg overflow-hidden">
              <img
                src={url}
                alt={titulo}
                className="max-w-full max-h-[600px] mx-auto object-contain"
                onError={() => setPreviewError(true)}
              />
            </div>
          </div>
        )}

        {/* Preview para PDFs */}
        {documentType === 'pdf' && !previewError && (
          <div className="mt-6 border-t pt-6">
            <p className="text-xs text-muted-foreground mb-4">Pré-visualização (PDF):</p>
            <div className="relative w-full bg-muted/50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={url}
                className="w-full h-full border-0"
                title={titulo}
                onError={() => setPreviewError(true)}
              />
            </div>
          </div>
        )}

        {/* Preview para Word, Excel, PowerPoint via Google Docs Viewer */}
        {(documentType === 'word' || documentType === 'excel' || documentType === 'powerpoint') && !previewError && (
          <div className="mt-6 border-t pt-6">
            <p className="text-xs text-muted-foreground mb-4">
              Pré-visualização ({getDocumentLabel()}):
            </p>
            <div className="relative w-full bg-muted/50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={getGoogleViewerUrl(url)}
                className="w-full h-full border-0"
                title={titulo}
                onError={() => setPreviewError(true)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Visualização fornecida pelo Google Docs Viewer
            </p>
          </div>
        )}

        {/* Mensagem quando preview não disponível */}
        {!canPreviewInline && (
          <div className="mt-6 border-t pt-6">
            <p className="text-xs text-muted-foreground">
              Pré-visualização não disponível para este tipo de arquivo.
              Clique em &quot;Abrir Documento&quot; para visualizar.
            </p>
          </div>
        )}

        {/* Mensagem de erro no preview */}
        {previewError && (
          <div className="mt-6 border-t pt-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar a pré-visualização.
                Use o botão acima para abrir o documento.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function LinkViewer({ url, titulo }: { url: string; titulo: string }) {
  return (
    <Card className="p-8">
      <div className="text-center space-y-4">
        <ExternalLink className="h-16 w-16 text-muted-foreground mx-auto" />
        <div>
          <h3 className="font-semibold mb-2">Link Externo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este conteúdo está disponível em um site externo
          </p>
        </div>

        <Button asChild size="lg">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Acessar: {titulo}
          </a>
        </Button>

        <p className="text-xs text-muted-foreground pt-4">
          URL: <a href={url} className="text-primary underline" target="_blank" rel="noopener noreferrer">{url}</a>
        </p>
      </div>
    </Card>
  );
}

function TextoViewer({ conteudo }: { conteudo: string }) {
  // Função para converter texto simples em elementos com formatação básica
  // Suporta: **bold**, *italic*, links, listas, e quebras de linha
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Dividir por linhas
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      // Se linha vazia, adicionar espaço
      if (!line.trim()) {
        return <br key={lineIndex} />;
      }

      // Verificar se é um item de lista
      const isListItem = /^[\-\*]\s/.test(line);
      const isNumberedList = /^\d+\.\s/.test(line);

      // Processar formatação inline
      const processInlineFormatting = (text: string) => {
        const parts: (string | React.ReactElement)[] = [];
        let lastIndex = 0;
        let keyCounter = 0;

        // Regex para bold, italic e links
        const formatRegex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\))/g;
        let match;

        while ((match = formatRegex.exec(text)) !== null) {
          // Adicionar texto antes do match
          if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
          }

          if (match[2]) {
            // Bold: **text**
            parts.push(<strong key={`b-${keyCounter++}`}>{match[2]}</strong>);
          } else if (match[3]) {
            // Italic: *text*
            parts.push(<em key={`i-${keyCounter++}`}>{match[3]}</em>);
          } else if (match[4] && match[5]) {
            // Link: [text](url)
            parts.push(
              <a
                key={`l-${keyCounter++}`}
                href={match[5]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                {match[4]}
              </a>
            );
          }

          lastIndex = match.index + match[0].length;
        }

        // Adicionar texto restante
        if (lastIndex < text.length) {
          parts.push(text.slice(lastIndex));
        }

        return parts.length > 0 ? parts : text;
      };

      const content = processInlineFormatting(
        isListItem ? line.replace(/^[\-\*]\s/, '') :
          isNumberedList ? line.replace(/^\d+\.\s/, '') : line
      );

      if (isListItem || isNumberedList) {
        return (
          <div key={lineIndex} className="flex items-start gap-2 ml-4">
            <span className="text-muted-foreground">
              {isNumberedList ? line.match(/^\d+/)?.[0] + '.' : '•'}
            </span>
            <span>{content}</span>
          </div>
        );
      }

      // Verificar se é um cabeçalho (linha começa com #)
      if (line.startsWith('### ')) {
        return <h3 key={lineIndex} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={lineIndex} className="text-xl font-semibold mt-4 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={lineIndex} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
      }

      return <p key={lineIndex} className="mb-2">{content}</p>;
    });
  };

  return (
    <Card className="p-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <div className="text-foreground leading-relaxed">
          {renderFormattedText(conteudo)}
        </div>
      </div>
    </Card>
  );
}

function QuizViewer({ url }: { url: string }) {
  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 text-muted-foreground mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">?</span>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Quiz / Avaliação</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Teste seus conhecimentos com este quiz
          </p>
        </div>

        <Button asChild size="lg">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Iniciar Quiz
          </a>
        </Button>
      </div>
    </Card>
  );
}
