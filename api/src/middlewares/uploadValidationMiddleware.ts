import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import path from 'path';

interface AuthRequest extends Request {
  utilizador?: {
    id: number;
  };
}

interface UploadConfig {
  maxSize: number;
  allowedMimes: string[];
  allowedExtensions: string[];
  description: string;
}

/**
 * Middleware centralizado para validação de uploads
 */

// Configurações de validação por tipo
export const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    description: 'avatar'
  },
  courseImage: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    description: 'imagem de curso'
  },
  document: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedMimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'],
    description: 'documento'
  }
};

/**
 * Validar arquivo antes do upload
 * @param uploadType - Tipo do upload
 * @returns Middleware de validação
 */
export function validateUpload(uploadType: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    const config = UPLOAD_CONFIGS[uploadType];

    if (!config) {
      logger.error('Invalid upload type', { uploadType });
      res.status(500).json({
        success: false,
        mensagem: 'Tipo de upload não configurado'
      });
      return;
    }

    // Verificar se existe arquivo
    if (!req.file && !req.files) {
      logger.warn('No file provided for upload', { uploadType, userId: authReq.utilizador?.id });
      res.status(400).json({
        success: false,
        mensagem: `Nenhum arquivo foi enviado para ${config.description}`
      });
      return;
    }

    const file = req.file || (Array.isArray(req.files) ? req.files[0] : undefined);

    if (!file) {
      res.status(400).json({
        success: false,
        mensagem: `Arquivo inválido para ${config.description}`
      });
      return;
    }

    // Validar tamanho
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);

      logger.warn('File size exceeds limit', {
        uploadType,
        fileSize: file.size,
        maxSize: config.maxSize,
        fileName: file.originalname,
        userId: authReq.utilizador?.id
      });

      res.status(400).json({
        success: false,
        mensagem: `Arquivo muito grande para ${config.description}. Máximo: ${maxSizeMB}MB. Seu arquivo: ${fileSizeMB}MB`
      });
      return;
    }

    // Validar tipo MIME
    if (!config.allowedMimes.includes(file.mimetype)) {
      logger.warn('Invalid file mime type', {
        uploadType,
        mimetype: file.mimetype,
        allowedMimes: config.allowedMimes,
        fileName: file.originalname,
        userId: authReq.utilizador?.id
      });

      res.status(400).json({
        success: false,
        mensagem: `Tipo de arquivo não permitido para ${config.description}. Tipos aceitos: ${getReadableTypes(config.allowedMimes)}`
      });
      return;
    }

    // Validar extensão (segurança adicional)
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!config.allowedExtensions.includes(fileExtension)) {
      logger.warn('Invalid file extension', {
        uploadType,
        extension: fileExtension,
        allowedExtensions: config.allowedExtensions,
        fileName: file.originalname,
        userId: authReq.utilizador?.id
      });

      res.status(400).json({
        success: false,
        mensagem: `Extensão de arquivo não permitida para ${config.description}. Extensões aceitas: ${config.allowedExtensions.join(', ')}`
      });
      return;
    }

    // Validar nome do arquivo (segurança)
    if (!isValidFileName(file.originalname)) {
      logger.warn('Invalid file name', {
        uploadType,
        fileName: file.originalname,
        userId: authReq.utilizador?.id
      });

      res.status(400).json({
        success: false,
        mensagem: 'Nome de arquivo contém caracteres inválidos'
      });
      return;
    }

    logger.info('File validation passed', {
      uploadType,
      fileName: file.originalname,
      fileSize: file.size,
      mimetype: file.mimetype,
      userId: authReq.utilizador?.id
    });

    next();
  };
}

/**
 * Converter tipos MIME para nomes legíveis
 * @param mimeTypes - Array de tipos MIME
 * @returns String com tipos legíveis
 */
function getReadableTypes(mimeTypes: string[]): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'JPG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WEBP',
    'image/gif': 'GIF',
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'text/plain': 'TXT',
    'application/zip': 'ZIP',
    'application/x-rar-compressed': 'RAR'
  };

  return mimeTypes
    .map(mime => typeMap[mime] || mime.split('/')[1].toUpperCase())
    .join(', ');
}

/**
 * Validar se o nome do arquivo é seguro
 * @param fileName - Nome do arquivo
 * @returns Se o nome é válido
 */
function isValidFileName(fileName: string): boolean {
  // Verificar caracteres perigosos
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(fileName)) {
    return false;
  }

  // Verificar nomes reservados do Windows
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (reservedNames.test(fileName)) {
    return false;
  }

  // Verificar tamanho do nome
  if (fileName.length > 255) {
    return false;
  }

  // Verificar se não é apenas espaços ou pontos
  if (/^[\s.]+$/.test(fileName)) {
    return false;
  }

  return true;
}

/**
 * Middleware para tratar erros de upload do multer
 * @param error - Erro do multer
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 */
export function handleUploadError(error: any, req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthRequest;

  if (error) {
    logger.error('Upload error occurred', {
      error: error.message,
      code: error.code,
      field: error.field,
      userId: authReq.utilizador?.id
    });

    let message = 'Erro no upload do arquivo';

    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'Arquivo muito grande. Verifique o tamanho máximo permitido.';
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Muitos arquivos enviados.';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Campo de arquivo inesperado.';
    } else if (error.message.includes('não permitido')) {
      message = error.message;
    }

    res.status(400).json({
      success: false,
      mensagem: message
    });
    return;
  }

  next();
}
