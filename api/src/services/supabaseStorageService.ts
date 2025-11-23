import { supabaseAdmin, STORAGE_BUCKETS, type StorageBucket } from '../config/supabase';
import logger from '../utils/logger';
import { randomUUID } from 'crypto';

export class SupabaseStorageService {
  /**
   * Upload de avatar de utilizador
   */
  async uploadAvatar(file: Buffer, userId: number, mimeType: string): Promise<string> {
    try {
      const fileExt = this.getFileExtension(mimeType);
      const fileName = `${userId}-${randomUUID()}.${fileExt}`;
      // O bucket já se chama "avatars", não precisa de prefixo adicional
      const filePath = fileName;

      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        logger.error('Erro ao fazer upload de avatar', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Falha ao fazer upload do avatar');
      }

      return this.getPublicUrl(STORAGE_BUCKETS.AVATARS, data.path);
    } catch (error) {
      logger.error('Erro no uploadAvatar', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Upload de imagem de curso
   */
  async uploadCourseImage(file: Buffer, cursoId: number, mimeType: string): Promise<string> {
    try {
      const fileExt = this.getFileExtension(mimeType);
      const fileName = `curso-${cursoId}-${randomUUID()}.${fileExt}`;
      const filePath = `courses/${fileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.COURSE_IMAGES)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        logger.error('Erro ao fazer upload de imagem de curso', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Falha ao fazer upload da imagem do curso');
      }

      return this.getPublicUrl(STORAGE_BUCKETS.COURSE_IMAGES, data.path);
    } catch (error) {
      logger.error('Erro no uploadCourseImage', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Upload de conteúdo de curso (vídeos, documentos, etc)
   */
  async uploadCourseContent(
    file: Buffer,
    cursoId: number,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    try {
      const { data: bucket, error: bucketError } = await supabaseAdmin.storage.getBucket(STORAGE_BUCKETS.COURSE_CONTENT);

      if (bucketError || !bucket) {
        logger.error('Bucket de conteúdo não encontrado', {
          bucket: STORAGE_BUCKETS.COURSE_CONTENT,
          error: bucketError?.message
        });
        throw new Error(`Bucket de armazenamento "${STORAGE_BUCKETS.COURSE_CONTENT}" não está disponível. Verifique a configuração do Supabase.`);
      }

      const sanitizedFileName = this.sanitizeFileName(fileName);
      const filePath = `curso-${cursoId}/${randomUUID()}-${sanitizedFileName}`;
      const fileSizeMB = (file.length / (1024 * 1024)).toFixed(2);

      logger.info('Iniciando upload de conteúdo', {
        cursoId,
        fileName: sanitizedFileName,
        mimeType,
        fileSizeMB: `${fileSizeMB}MB`,
        filePath
      });

      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.COURSE_CONTENT)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        const errorDetails = {
          message: error.message,
          name: error.name,
          fileSizeMB,
          mimeType,
          cursoId,
        };
        logger.error('Erro ao fazer upload de conteúdo', errorDetails);

        if (error.message.includes('size') || error.message.includes('exceeded')) {
          throw new Error(`Arquivo muito grande (${fileSizeMB}MB). O tamanho máximo permitido é 50MB.`);
        }
        throw new Error('Falha ao fazer upload do conteúdo');
      }

      const publicUrl = this.getPublicUrl(STORAGE_BUCKETS.COURSE_CONTENT, data.path);
      logger.info('Upload de conteúdo concluído com sucesso', { cursoId, filePath, publicUrl });

      return publicUrl;
    } catch (error) {
      logger.error('Erro no uploadCourseContent', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Upload de certificado (PDF)
   */
  async uploadCertificate(file: Buffer, certificadoId: number): Promise<string> {
    try {
      const fileName = `certificado-${certificadoId}-${randomUUID()}.pdf`;
      // O bucket já se chama "certificates", não precisa de prefixo adicional
      const filePath = fileName;

      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.CERTIFICATES)
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (error) {
        logger.error('Erro ao fazer upload de certificado', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Falha ao fazer upload do certificado');
      }

      return this.getPublicUrl(STORAGE_BUCKETS.CERTIFICATES, data.path);
    } catch (error) {
      logger.error('Erro no uploadCertificate', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Deletar arquivo de um bucket
   */
  async deleteFile(bucket: StorageBucket, filePath: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);

      if (error) {
        logger.error('Erro ao deletar arquivo', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Falha ao deletar arquivo');
      }

      logger.info('Arquivo deletado com sucesso', { bucket, filePath });
    } catch (error) {
      logger.error('Erro no deleteFile', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Deletar avatar antigo de utilizador
   */
  async deleteOldAvatar(avatarUrl: string): Promise<void> {
    try {
      if (!avatarUrl) return;

      const filePath = this.extractPathFromUrl(avatarUrl);
      if (!filePath) return;

      await this.deleteFile(STORAGE_BUCKETS.AVATARS, filePath);
    } catch (error) {
      logger.warn('Erro ao deletar avatar antigo (não crítico)', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Deletar imagem antiga de curso
   */
  async deleteOldCourseImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl) return;

      const filePath = this.extractPathFromUrl(imageUrl);
      if (!filePath) return;

      await this.deleteFile(STORAGE_BUCKETS.COURSE_IMAGES, filePath);
    } catch (error) {
      logger.warn('Erro ao deletar imagem de curso antiga (não crítico)', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Deletar conteúdo antigo de curso
   */
  async deleteOldCourseContent(contentUrl: string): Promise<void> {
    try {
      if (!contentUrl) return;

      const filePath = this.extractPathFromUrl(contentUrl);
      if (!filePath) return;

      await this.deleteFile(STORAGE_BUCKETS.COURSE_CONTENT, filePath);
    } catch (error) {
      logger.warn('Erro ao deletar conteúdo de curso antigo (não crítico)', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Obter URL pública de um arquivo
   */
  getPublicUrl(bucket: StorageBucket, filePath: string): string {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * Obter URL assinada (com expiração) para conteúdo privado
   */
  async getSignedUrl(bucket: StorageBucket, filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        logger.error('Erro ao criar URL assinada', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Falha ao criar URL assinada');
      }

      return data.signedUrl;
    } catch (error) {
      logger.error('Erro no getSignedUrl', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Helper: Extrair path do arquivo a partir da URL completa
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part =>
        Object.values(STORAGE_BUCKETS).includes(part as StorageBucket)
      );

      if (bucketIndex === -1) return null;

      return pathParts.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  }

  /**
   * Helper: Obter extensão do arquivo baseado no MIME type
   */
  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    };

    return mimeToExt[mimeType] || 'bin';
  }

  /**
   * Helper: Sanitizar nome de arquivo
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
  }
}

export const supabaseStorageService = new SupabaseStorageService();
