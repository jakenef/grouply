# Environment Setup Guide

## Overview

Grouply uses a single `APP_ENV` environment variable to manage three distinct environments:

- **`local`** - Local development with localhost services
- **`staging`** - Staging deployment with remote services
- **`prod`** - Production deployment

## APP_ENV Detection System

### How It Works

1. **Single Source of Truth**: `APP_ENV` determines all environment behavior
2. **Frontend Detection**: Reads from `Constants.expoConfig.extra.env.APP_ENV`
3. **Backend Detection**: Reads from `process.env.APP_ENV`
4. **Auto-Configuration**: Apple IAP, IAP verification mode, logging levels all derived from APP_ENV

### Environment Files

| File | APP_ENV Value | Usage | URLs |
|------|---------------|-------|------|
| `.env.dev` | `local` | Local development | localhost:3001, 127.0.0.1:54321 |
| `.env.stg` | `staging` | Staging deployment | Render staging, Supabase staging |
| `.env` (deployed) | `prod` | Production | Production URLs |

## Local Development Workflow

### 1. Setup Local Services

```bash
# Start local Supabase (for auth, storage, database)
supabase start

# Apply Prisma migrations to local database
npx prisma migrate dev
```

### 2. Start Development Servers

```bash
# Start local backend server (uses .env.dev)
npm run dev:server

# In another terminal, start Expo frontend (uses .env.dev)
npm start
```

**What this does:**
- Copies `.env.dev` to `.env` (sets `APP_ENV=local`)
- Backend connects to local PostgreSQL (port 54322)
- Frontend connects to localhost:3001 backend
- IAP uses mock receipts, Apple uses SANDBOX

### 3. Running on Device/Simulator

```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
```

## Staging Workflow

### Option 1: Local App → Staging Backend

```bash
# Start Expo with staging configuration
npm run start:staging
```

**What this does:**
- Copies `.env.stg` to `.env` (sets `APP_ENV=staging`)
- App connects to staging Render backend
- Uses staging Supabase database
- IAP uses real verification, Apple uses SANDBOX

### Option 2: EAS Internal Build

```bash
# Build for staging (first time only)
eas build --platform ios --profile staging

# Push updates to staging builds (much faster)
npm run deploy:internal
```

## Production Deployment

### Backend (Render)
Set these environment variables in Render dashboard:
```bash
APP_ENV=prod
DATABASE_URL=your-prod-database-url
# ... other prod variables
```

### Mobile App (EAS)
```bash
# Production builds and updates
npm run eas:build:ios         # Build for App Store
npm run update:production     # Push updates to production
```

## Database Migrations

### Local
```bash
npm run migrate:dev           # Migrates local database
```

### Staging
```bash
npm run migrate:staging       # Migrates staging database
```

### Production
```bash
# Set APP_ENV=prod in deployment environment first
npx prisma migrate deploy
```

## Environment Variables Reference

### Required in All Environments

```bash
APP_ENV=local                    # "local", "staging", or "prod" 
DATABASE_URL=postgresql://...    # PostgreSQL connection
DIRECT_URL=postgresql://...      # Direct PostgreSQL (for migrations)
EXPO_PUBLIC_TRPC_URL=...        # Backend API URL
EXPO_PUBLIC_SUPABASE_URL=...    # Supabase project URL  
EXPO_PUBLIC_SUPABASE_KEY=...    # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=...   # Supabase admin key
OPENAI_API_KEY=sk-...           # OpenAI API key
GOOGLE_PLACES_API_KEY=...       # Google Places API key
```

### Auto-Derived from APP_ENV

- **`APPLE_APP_STORE_ENV`**: `"PRODUCTION"` for prod, `"SANDBOX"` otherwise
- **IAP Verification Mode**: Mock for local, real for staging/prod
- **Logging Level**: Verbose for local, minimal for prod

## Script Reference

```bash
# Local Development
npm start                     # Frontend (local env)
npm run dev:server           # Backend (local env)

# Staging 
npm start:staging            # Frontend (staging env)
npm run dev:server:staging   # Backend (staging env)

# Production Updates
npm run update:production    # Push updates to prod builds

# Database
npm run migrate:dev          # Local migrations
npm run migrate:staging      # Staging migrations
```

## Environment Validation

Both frontend and backend will throw clear errors if `APP_ENV` is missing or invalid:

```bash
Error: Invalid or missing APP_ENV: "". Expected "local", "staging", or "prod".
Make sure APP_ENV is set in your .env file.
```

## Best Practices

1. **Never commit `.env` files** - They contain secrets and are auto-generated
2. **Keep example files updated** - Update `.env.*.example` when adding new variables  
3. **Test locally first** - Always develop and test in `local` before staging
4. **Use staging for integration testing** - Test with real services before production
5. **Set production APP_ENV correctly** - Ensure `APP_ENV=prod` in deployment configs

## Troubleshooting

### Check Current Environment
```bash
# Frontend: Look for APP_ENV in the EnvDebugger component
# Backend: Check console logs for "[ENV] Running in {env} mode"
```

### Wrong Environment?
```bash
cat .env                     # Check which .env file is active
npm start                    # Re-copies .env.dev to .env (local)
npm start:staging           # Re-copies .env.stg to .env (staging)
```

### APP_ENV Error?
1. Verify `APP_ENV` is set in your `.env.dev` and `.env.stg` files
2. Check `app.config.ts` includes APP_ENV in the extra.env section
3. For backend, ensure your `.env` file is being loaded by the server
