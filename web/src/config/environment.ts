import { z } from 'zod';

// Client-side environment validation schema
const clientEnvSchema = z.object({
  // Next.js environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // API configuration
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL').default('http://localhost:3000/api'),

  // Supabase configuration (public keys only)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Application settings
  NEXT_PUBLIC_APP_NAME: z.string().default('OneSAM LMS'),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),

  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_DEBUG: z.string().default('false').transform(val => val === 'true'),

  // File upload limits
  NEXT_PUBLIC_MAX_FILE_SIZE: z.string().regex(/^\d+$/, 'NEXT_PUBLIC_MAX_FILE_SIZE must be a number').default('10485760').transform(Number), // 10MB
  NEXT_PUBLIC_ALLOWED_FILE_TYPES: z.string().default('jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,mp4,webm'),

  // Video player configuration
  NEXT_PUBLIC_ENABLE_VIDEO_ANALYTICS: z.string().default('false').transform(val => val === 'true'),
  NEXT_PUBLIC_VIDEO_QUALITY_OPTIONS: z.string().default('480p,720p,1080p'),

  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('NEXT_PUBLIC_SENTRY_DSN must be a valid URL').optional(),
});

// Server-side only environment variables (for API routes, middleware, etc.)
const serverEnvSchema = z.object({
  // Database (for API routes that need direct DB access)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').optional(),

  // JWT secrets (for API routes)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long').optional(),

  // Email configuration (for contact forms, etc.)
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email').optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().regex(/^\d+$/, 'EMAIL_PORT must be a number').transform(Number).optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),

  // Supabase service key (for server operations)
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required').optional(),
});

// Validate environment variables
let clientEnv: z.infer<typeof clientEnvSchema>;
let serverEnv: z.infer<typeof serverEnvSchema> | null = null;

try {
  // Always validate client environment
  clientEnv = clientEnvSchema.parse(process.env);

  // Only validate server environment on server-side
  if (typeof window === 'undefined') {
    serverEnv = serverEnvSchema.parse(process.env);
  }
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingOrInvalidVars = error.issues.map(issue => {
      const path = issue.path.join('.');
      return `${path}: ${issue.message}`;
    });

    console.error('❌ Environment validation failed:');
    missingOrInvalidVars.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease check your .env.local file and ensure all required variables are set correctly.');

    if (typeof window === 'undefined') {
      // Only exit process on server-side
      process.exit(1);
    } else {
      // On client-side, show error in console but don't crash
      console.error('Client-side environment validation failed. Some features may not work correctly.');
    }
  } else {
    console.error('Unexpected error during environment validation:', error);
    if (typeof window === 'undefined') {
      process.exit(1);
    }
  }

  // If validation failed, we can't proceed safely
  throw new Error('Environment validation failed');
}

// Configuration object with validated values
export const config = {
  app: {
    name: clientEnv.NEXT_PUBLIC_APP_NAME,
    version: clientEnv.NEXT_PUBLIC_APP_VERSION,
    environment: clientEnv.NODE_ENV,
    isDevelopment: clientEnv.NODE_ENV === 'development',
    isProduction: clientEnv.NODE_ENV === 'production',
  },

  api: {
    url: clientEnv.NEXT_PUBLIC_API_URL,
  },

  supabase: {
    url: clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: serverEnv?.SUPABASE_SERVICE_KEY,
  },

  features: {
    analytics: clientEnv.NEXT_PUBLIC_ENABLE_ANALYTICS,
    debug: clientEnv.NEXT_PUBLIC_ENABLE_DEBUG,
    videoAnalytics: clientEnv.NEXT_PUBLIC_ENABLE_VIDEO_ANALYTICS,
  },

  upload: {
    maxFileSize: clientEnv.NEXT_PUBLIC_MAX_FILE_SIZE,
    allowedFileTypes: clientEnv.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',').map(type => type.trim()),
  },

  video: {
    qualityOptions: clientEnv.NEXT_PUBLIC_VIDEO_QUALITY_OPTIONS.split(',').map(q => q.trim()),
  },

  monitoring: {
    sentryDsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
    sentryEnabled: !!clientEnv.NEXT_PUBLIC_SENTRY_DSN && clientEnv.NODE_ENV === 'production',
  },

  // Server-side only configuration
  server: serverEnv ? {
    database: {
      url: serverEnv.DATABASE_URL,
    },
    auth: {
      jwtSecret: serverEnv.JWT_SECRET,
    },
    email: {
      from: serverEnv.EMAIL_FROM,
      host: serverEnv.EMAIL_HOST,
      port: serverEnv.EMAIL_PORT,
      user: serverEnv.EMAIL_USER,
      pass: serverEnv.EMAIL_PASS,
      enabled: !!(serverEnv.EMAIL_HOST && serverEnv.EMAIL_FROM),
    },
  } : null,
} as const;

// Log successful configuration load (client-side only in development)
if (typeof window !== 'undefined' && config.app.isDevelopment) {
  console.log('Client configuration loaded:', {
    environment: config.app.environment,
    appName: config.app.name,
    apiUrl: config.api.url,
    features: config.features,
  });
}

// Validation helper functions
export function validateFileSize(size: number): boolean {
  return size <= config.upload.maxFileSize;
}

export function validateFileType(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? config.upload.allowedFileTypes.includes(extension) : false;
}

export function getMaxFileSizeMB(): number {
  return config.upload.maxFileSize / (1024 * 1024);
}

export default config;