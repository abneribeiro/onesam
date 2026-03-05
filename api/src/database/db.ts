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

// Connection configuration adapts to test vs production environments
const isTestEnv = config.app.isTest;

const client = postgres(connectionString, {
  ssl: sslConfig,
  max: isTestEnv ? 5 : 1,
  idle_timeout: isTestEnv ? 20 : 0,
  connect_timeout: config.database.timeout,
  prepare: isTestEnv ? true : false,
  transform: {
    undefined: null,
  },
  connection: {
    application_name: isTestEnv ? 'OneSAM-API-Test' : 'OneSAM-API',
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
