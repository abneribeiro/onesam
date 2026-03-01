import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { db } from './database/db';
import { sql } from 'drizzle-orm';
import config from './config';
import { configurarCronCursos } from './services/cursoEstadoService';
import { ensureStorageBuckets } from './config/supabase';

import areaRoutes from './routes/areaRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import cursoRoutes from './routes/cursoRoutes';
import inscricaoRoutes from './routes/inscricaoRoutes';
import utilizadorRoutes from './routes/utilizadorRoutes';
import adminRoutes from './routes/adminRoutes';
import notificacaoRoutes from './routes/notificacaoRoutes';
import moduloRoutes from './routes/moduloRoutes';
import aulaRoutes from './routes/aulaRoutes';
import reviewRoutes from './routes/reviewRoutes';
import quizRoutes from './routes/quizRoutes';
import certificadoRoutes from './routes/certificadoRoutes';

import { errorHandler } from './utils/errorHandler';
import betterAuthMiddleware from './middlewares/betterAuthMiddleware';
import requestLogger from './middlewares/requestLogger';
import morganMiddleware from './middlewares/morganMiddleware';
import { notFound } from './utils/errorHandler';
import { generalRateLimiter, authRateLimiter } from './middlewares/rateLimitMiddleware';
import logger from './utils/logger';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import { apiReference } from '@scalar/express-api-reference';

import { auth } from './lib/auth';
import { toNodeHandler } from 'better-auth/node';

import { healthCheck } from './controllers/healthController';

const app: Express = express();

// Helmet para segurança HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "'unsafe-inline'", // Necessário para Scalar API Reference
        "'unsafe-eval'"   // Necessário para alguns componentes do Scalar
      ],
      imgSrc: ["'self'", "data:", "https:", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.scalar.com", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration - supports multiple origins for production deployment
const getAllowedOrigins = () => {
  const origins = [config.app.frontendUrl];

  // Add additional origins from environment variable (comma-separated)
  if (config.cors.allowedOrigins.length > 0) {
    origins.push(...config.cors.allowedOrigins);
  }

  // In development, allow all localhost ports
  if (config.app.isDevelopment) {
    origins.push('http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173');
  }

  return origins;
};

app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
    // Enable preflight for all routes
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(cookieParser());

// Servir arquivos estáticos da pasta uploads (imagens, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir arquivos estáticos da pasta public (favicon, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// Rota específica para favicon
app.get('/favicon.ico', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/favicon.ico'), (err) => {
    if (err) {
      res.status(204).end(); // No Content - evita erro 404 no console
    }
  });
});

// HTTP request logging com Morgan integrado ao Winston
app.use(morganMiddleware);

// Request logging middleware
app.use(requestLogger);

// Rate limiting global - protege contra ataques de força bruta
// Exclui health check e documentação automaticamente
app.use('/api', generalRateLimiter);

// Documentação da API - Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'OneSAM API Documentation',
}));

// Documentação da API - Scalar
app.use('/api/reference', apiReference({
  spec: {
    content: swaggerSpec,
  },
  theme: 'purple',
}));

// Health check endpoint - usando controller completo
app.get('/api/health', healthCheck);

// Rate limiting específico para autenticação - proteção contra força bruta
// 5 tentativas por 15 minutos por IP
app.use('/api/auth', authRateLimiter);

// Better Auth handler - DEVE VIR ANTES do express.json()
// Sintaxe para Express v5: usar *splat em vez de *
app.all('/api/auth/*splat', toNodeHandler(auth));

// IMPORTANTE: express.json() DEVE vir DEPOIS do handler Better Auth
// para evitar problemas com o cliente de autenticação
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas públicas (sem autenticação) - DEPRECATED, manter temporariamente para compatibilidade
// app.use('/api/auth', authRoutes);

// Rotas de catálogo (GET público, modificações requerem autenticação)
app.use('/api/areas', areaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/cursos', cursoRoutes);

// Rotas autenticadas (qualquer perfil)
app.use('/api/inscricoes', betterAuthMiddleware, inscricaoRoutes);
app.use('/api/utilizadores', betterAuthMiddleware, utilizadorRoutes);
app.use('/api/notificacoes', betterAuthMiddleware, notificacaoRoutes);
app.use('/api/modulos', moduloRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificados', certificadoRoutes);
app.use('/api/admin', betterAuthMiddleware, adminRoutes);

app.get('/', (_req, res) => {
  res.json({
    message: 'API da Plataforma de Formação - OneSAM',
    version: '3.0.0',
    documentation: {
      swagger: '/api/docs',
      scalar: '/api/reference',
    },
    health: '/api/health',
  });
});

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware de tratamento de erros global
app.use(errorHandler);

// Função para iniciar o servidor
const iniciarServidor = async () => {
  try {
    // Testar conexão com o banco de dados Drizzle
    await db.execute(sql`SELECT 1`);
    logger.info('Database connection established successfully (Drizzle ORM)');

    // Ensure Supabase storage buckets exist
    await ensureStorageBuckets();
    logger.info('Supabase storage buckets verified');

    // Iniciar o servidor HTTP
    const PORT = config.app.port;
    const server = app.listen(PORT, () => {
      logger.info('Server started successfully', { port: PORT });
      // Configurar tarefas agendadas (CRON)
      configurarCronCursos();
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          logger.info('Database connections closed');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', err instanceof Error ? err : new Error(String(err)));
          process.exit(1);
        }
      });

      // Forçar shutdown após 10 segundos se não conseguir fechar gracefully
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listeners para sinais de termination
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Iniciar o servidor se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  iniciarServidor();
}

export default app;
