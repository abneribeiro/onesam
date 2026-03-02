import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import config from '../config/environment';

const connectionString = config.database.url;

if (!connectionString) {
  throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
}

// Supabase always uses SSL
const sslConfig = config.database.ssl ? { rejectUnauthorized: false } : false;

const client = postgres(connectionString, {
  ssl: sslConfig,
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
