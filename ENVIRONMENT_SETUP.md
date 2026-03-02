# OneSAM Environment Setup Guide

This guide explains how to set up the OneSAM development environment using Supabase for database and storage.

## Overview

OneSAM uses **Supabase** for both development and production environments, providing:
- PostgreSQL database with real-time features
- Authentication and user management
- File storage and CDN
- Edge functions (future use)

This unified approach eliminates environment inconsistencies and simplifies development.

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- [Git](https://git-scm.com/) version control
- Supabase account (free tier available)

## Supabase Project Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Choose a name, database password, and region
4. Wait for project initialization (2-3 minutes)

### 2. Get Project Credentials

From your Supabase project dashboard:

1. **Settings > Database** - Copy the connection string
2. **Settings > API** - Copy Project URL, anon key, and service_role key

## Environment Configuration

### API Configuration (`api/.env`)

Copy `api/.env.example` to `api/.env` and update with your Supabase credentials:

```env
# Application Configuration
NODE_ENV=development
APP_NAME=OneSAM LMS
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
PORT=3000

# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
DATABASE_SSL=true

# Supabase Configuration
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Better Auth Configuration
BETTER_AUTH_SECRET=your_32_character_secret_here_dev_key
BETTER_AUTH_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_at_least_32_characters_long_development_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_characters_long_dev_key
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (optional)
EMAIL_FROM=no-reply@localhost
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_SECURE=true

# Redis Configuration (optional - use Upstash for production)
REDIS_URL=rediss://default:password@endpoint.upstash.io:6379

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,mp4,webm

# Logging Configuration
LOG_LEVEL=debug
LOG_FILE=app.log

# Security Configuration
BCRYPT_ROUNDS=10

# Monitoring (optional)
SENTRY_DSN=https://your_sentry_dsn_here

# Development Only
DISABLE_AUTH=false
```

### Web Configuration (`web/.env.local`)

Copy `web/.env.local.example` to `web/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Application Configuration
NEXT_PUBLIC_APP_NAME=OneSAM LMS
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Sistema de Gestão de Aprendizagem OneSAM

# Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,mp4,webm

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn_here
```

## Setup Steps

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd onesam
bun install
cd api && bun install
cd ../web && bun install
```

### 2. Configure Environment Variables
```bash
# Copy and edit API environment file
cp api/.env.example api/.env
# Edit api/.env with your Supabase credentials

# Copy and edit Web environment file
cp web/.env.local.example web/.env.local
```

### 3. Database Setup
```bash
cd api

# Generate and apply database migrations
bun run db:generate
bun run db:migrate

# Seed database with sample data
bun run seed

# Optional: Open Drizzle Studio to view data
bun run db:studio
```

### 4. Start Development Servers
```bash
# Terminal 1: Start API server
cd api
bun dev

# Terminal 2: Start web application
cd web
bun dev
```

The application will be available at:
- **API**: http://localhost:3000
- **Web**: http://localhost:3001
- **API Docs**: http://localhost:3000/docs

## Database Management

### Migrations
```bash
cd api

# Generate new migration from schema changes
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Push schema changes directly (development only)
bun run db:push

# Open Drizzle Studio database explorer
bun run db:studio
```

### Seeding
```bash
cd api

# Seed database with sample data
bun run seed

# Clean database and reseed
bun run seed:clean
```

## Storage Configuration

### Supabase Storage Buckets

Create the following buckets in your Supabase project:

1. **Storage > Buckets** in Supabase Dashboard
2. Create buckets:
   - `onesam-uploads` (private)
   - `onesam-avatars` (public)
   - `onesam-course-materials` (private)

### Bucket Policies

Configure RLS policies for each bucket based on your security requirements.

## Production Configuration

For production deployment:

1. **Environment Variables**: Update URLs to production domains
2. **Database**: Use Supabase production database
3. **SSL**: Ensure `DATABASE_SSL=true`
4. **Security**: Generate strong secrets and keys
5. **CORS**: Update `ALLOWED_ORIGINS` to production frontend URL

### Production Environment Variables

```env
NODE_ENV=production
APP_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com
BETTER_AUTH_URL=https://your-api-domain.com
LOG_LEVEL=info
BCRYPT_ROUNDS=12
```

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify DATABASE_URL and Supabase credentials
2. **Migration Failures**: Ensure database is accessible and credentials are correct
3. **File Upload Issues**: Check Supabase Storage buckets and policies
4. **Authentication Issues**: Verify BETTER_AUTH_SECRET and JWT secrets

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### Health Checks

Verify services are running:
- API Health: http://localhost:3000/health
- Database: `bun run db:studio`
- Supabase Dashboard: Check project status

## Development Workflow

1. **Feature Development**: Work on local environment with Supabase
2. **Database Changes**: Generate migrations, test locally
3. **Testing**: Run test suite with `bun test`
4. **Quality Checks**: Run `bun run typecheck` and `bun run lint`
5. **Deployment**: Deploy to production with environment variables