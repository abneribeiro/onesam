import { defineConfig } from 'drizzle-kit';
import config from './src/config/environment';

export default defineConfig({
  schema: './src/database/schema/*',
  out: './src/database/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.database.url,
    // Supabase always uses SSL
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false
  },
  verbose: true,
  strict: true,
});
