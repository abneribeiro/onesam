import { createClient } from '@supabase/supabase-js';
import config from './environment';
import logger from '../utils/logger';

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

export const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  COURSE_IMAGES: 'course-images',
  COURSE_CONTENT: 'course-content',
  CERTIFICATES: 'certificates',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * Ensures all required storage buckets exist in Supabase.
 * Creates buckets if they don't exist.
 * Non-blocking: logs warnings but doesn't stop server startup.
 */
export async function ensureStorageBuckets(): Promise<void> {
  const buckets = Object.values(STORAGE_BUCKETS);

  const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();

  if (listError) {
    logger.warn(`Could not list storage buckets: ${listError.message}. Buckets may need manual creation.`);
    return;
  }

  const existingBucketNames = new Set(existingBuckets?.map(b => b.name) || []);
  logger.info(`Existing buckets: ${Array.from(existingBucketNames).join(', ') || 'none'}`);

  for (const bucketName of buckets) {
    try {
      if (existingBucketNames.has(bucketName)) {
        logger.debug(`Storage bucket "${bucketName}" already exists`);
        continue;
      }

      const isPublic = bucketName === 'avatars' || bucketName === 'course-images' || bucketName === 'course-content';

      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: isPublic,
      });

      if (createError) {
        if (createError.message.includes('already exists')) {
          logger.debug(`Storage bucket "${bucketName}" already exists`);
        } else {
          logger.warn(`Could not create bucket "${bucketName}": ${createError.message}. Please create it manually in Supabase Dashboard.`);
        }
      } else {
        logger.info(`Storage bucket "${bucketName}" created successfully (public: ${isPublic})`);
      }
    } catch (error) {
      logger.warn(`Error with bucket "${bucketName}": ${error instanceof Error ? error.message : String(error)}. Please create it manually.`);
    }
  }
}
