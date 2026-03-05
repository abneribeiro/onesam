import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import config from '../config/environment';
import logger from '../utils/logger';

const connectionString = config.database.url;

if (!connectionString) {
  throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
}

// Supabase-optimized SSL configuration
const sslConfig = config.database.ssl ? {
  rejectUnauthorized: false,
} : false;

// Supabase connection configuration with transaction pooling settings
const client = postgres(connectionString, {
  ssl: sslConfig,
  max: 1, // Single connection for transaction pooling
  idle_timeout: 0, // Disable idle timeout for pooler
  connect_timeout: config.database.timeout,
  prepare: false, // Required for transaction pooling
  transform: {
    undefined: null,
  },
  connection: {
    application_name: 'OneSAM-API',
  },
  onnotice: (notice) => {
    if (config.app.isDevelopment) {
      logger.debug('Database notice:', notice);
    }
  },
  debug: config.app.isDevelopment ? (_connection, query, parameters) => {
    logger.debug('Database query:', { query, parameters });
  } : false,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
