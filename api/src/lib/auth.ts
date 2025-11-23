import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../database/db';
import * as schema from '../database/schema';
import crypto from 'crypto';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.utilizadores,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
    usePlural: false,
  }),

  baseURL: process.env.BASE_URL || 'http://localhost:3000',

  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  user: {
    fields: {
      name: 'nome',
      image: 'avatar',
      createdAt: 'dataCriacao',
      updatedAt: 'dataAtualizacao',
    },
    additionalFields: {
      tipoPerfil: {
        type: 'string',
        required: true,
        input: true,
      },
      perfilId: {
        type: 'number',
        required: false,
        input: false,
      },
      ativo: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // 1 hora (aumentado de 5 minutos para melhor UX)
    },
  },

  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    ...(process.env.ADDITIONAL_TRUSTED_ORIGINS?.split(',').filter(Boolean) || []),
  ],

  advanced: {
    database: {
      generateId: (options) => {
        if (options.model === 'user') {
          return undefined as any;
        }
        return crypto.randomUUID();
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              emailVerified: true,
              ativo: true,
            },
          };
        },
      },
    },
  },
});

// Exportar tipos inferidos do Better Auth para uso no backend e frontend
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
