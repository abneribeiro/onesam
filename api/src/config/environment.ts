import { z } from 'zod';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Load environment variables from the correct file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

// Environment validation schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),

  // Application settings
  APP_NAME: z.string().default('OneSAM LMS'),
  APP_URL: z.string().url('APP_URL must be a valid URL').default('http://localhost:3000'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:3001'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').default('3000').transform(Number),

  // Database configuration (Supabase always uses SSL)
  DATABASE_URL: z.string()
    .url('DATABASE_URL must be a valid URL')
    .refine(
      (url) => url.includes('supabase.co') || url.includes('localhost') || url.includes('127.0.0.1'),
      'DATABASE_URL must be a Supabase URL or localhost for development'
    ),
  DATABASE_SSL: z.string().default('true').transform(val => val === 'true'),
  DATABASE_MAX_CONNECTIONS: z.string().regex(/^\d+$/, 'DATABASE_MAX_CONNECTIONS must be a number').default('10').transform(Number),
  DATABASE_TIMEOUT: z.string().regex(/^\d+$/, 'DATABASE_TIMEOUT must be a number').default('60').transform(Number),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Better Auth configuration
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters long'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),

  // Supabase configuration
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),

  // Email configuration (optional but validated if provided)
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email').optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().regex(/^\d+$/, 'EMAIL_PORT must be a number').transform(Number).optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_SECURE: z.string().default('false').transform(val => val === 'true'),

  // Redis configuration (optional)
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/, 'RATE_LIMIT_WINDOW_MS must be a number').default('900000').transform(Number), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/, 'RATE_LIMIT_MAX_REQUESTS must be a number').default('100').transform(Number),

  // CORS
  ALLOWED_ORIGINS: z.string().optional(),

  // File upload
  MAX_FILE_SIZE: z.string().regex(/^\d+$/, 'MAX_FILE_SIZE must be a number').default('10485760').transform(Number), // 10MB
  ALLOWED_FILE_TYPES: z.string().default('jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,mp4,webm'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('app.log'),

  // Security
  BCRYPT_ROUNDS: z.string().regex(/^\d+$/, 'BCRYPT_ROUNDS must be a number').default('12').transform(Number),

  // Monitoring (optional)
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),

  // Development only
  DISABLE_AUTH: z.string().default('false').transform(val => val === 'true'),
});

// Validate environment variables
let validatedEnv: z.infer<typeof envSchema>;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingOrInvalidVars = error.issues.map(issue => {
      const path = issue.path.join('.');
      return `${path}: ${issue.message}`;
    });

    logger.error('Environment validation failed:', {
      errors: missingOrInvalidVars,
    });

    console.error('❌ Environment validation failed:');
    missingOrInvalidVars.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease check your .env file and ensure all required variables are set correctly.');

    process.exit(1);
  } else {
    logger.error('Unexpected error during environment validation:', error as Error);
    process.exit(1);
  }
}

// Configuration object with validated values
const config = {
  app: {
    name: validatedEnv.APP_NAME,
    url: validatedEnv.APP_URL,
    frontendUrl: validatedEnv.FRONTEND_URL,
    port: validatedEnv.PORT,
    environment: validatedEnv.NODE_ENV,
    isDevelopment: validatedEnv.NODE_ENV === 'development',
    isProduction: validatedEnv.NODE_ENV === 'production',
    isStaging: validatedEnv.NODE_ENV === 'staging',
    isTest: validatedEnv.NODE_ENV === 'test',
  },

  database: {
    url: validatedEnv.DATABASE_URL,
    ssl: validatedEnv.DATABASE_SSL,
    maxConnections: validatedEnv.DATABASE_MAX_CONNECTIONS,
    timeout: validatedEnv.DATABASE_TIMEOUT,
  },

  auth: {
    jwtSecret: validatedEnv.JWT_SECRET,
    jwtExpiresIn: validatedEnv.JWT_EXPIRES_IN,
    refreshSecret: validatedEnv.JWT_REFRESH_SECRET,
    refreshExpiresIn: validatedEnv.JWT_REFRESH_EXPIRES_IN,
    betterAuthSecret: validatedEnv.BETTER_AUTH_SECRET,
    betterAuthUrl: validatedEnv.BETTER_AUTH_URL,
    bcryptRounds: validatedEnv.BCRYPT_ROUNDS,
    disableAuth: validatedEnv.DISABLE_AUTH && (validatedEnv.NODE_ENV === 'development' || validatedEnv.NODE_ENV === 'test'),
  },

  supabase: {
    url: validatedEnv.SUPABASE_URL,
    anonKey: validatedEnv.SUPABASE_ANON_KEY,
    serviceKey: validatedEnv.SUPABASE_SERVICE_KEY,
  },

  email: {
    from: validatedEnv.EMAIL_FROM,
    host: validatedEnv.EMAIL_HOST,
    port: validatedEnv.EMAIL_PORT,
    user: validatedEnv.EMAIL_USER,
    pass: validatedEnv.EMAIL_PASS,
    secure: validatedEnv.EMAIL_SECURE,
    enabled: !!(validatedEnv.EMAIL_HOST && validatedEnv.EMAIL_FROM),
  },

  redis: {
    url: validatedEnv.REDIS_URL,
    enabled: !!validatedEnv.REDIS_URL,
  },

  rateLimit: {
    windowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
    maxRequests: validatedEnv.RATE_LIMIT_MAX_REQUESTS,
  },

  cors: {
    allowedOrigins: validatedEnv.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [],
  },

  upload: {
    maxFileSize: validatedEnv.MAX_FILE_SIZE,
    allowedFileTypes: validatedEnv.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()),
  },

  logging: {
    level: validatedEnv.LOG_LEVEL,
    file: validatedEnv.LOG_FILE,
  },

  monitoring: {
    sentryDsn: validatedEnv.SENTRY_DSN,
    sentryEnabled: !!validatedEnv.SENTRY_DSN && validatedEnv.NODE_ENV === 'production',
  },
} as const;

// Log successful configuration load
logger.info('Configuration loaded successfully', {
  environment: config.app.environment,
  appName: config.app.name,
  port: config.app.port,
  emailEnabled: config.email.enabled,
  redisEnabled: config.redis.enabled,
  sentryEnabled: config.monitoring.sentryEnabled,
});

// Warn about development-only features in production
if (config.app.isProduction) {
  if (config.auth.disableAuth) {
    logger.warn('AUTH DISABLED: This should never happen in production!');
  }
}

export default config;