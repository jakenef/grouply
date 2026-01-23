# Environment Setup Guide

## Overview

Grouply uses separate environment configurations for local development, staging, and production.

## Environment Files

- **`.env.local`** - Local development with local database and backend
- **`.env.staging`** - Staging environment with Render backend and Supabase DB
- **`.env.production`** - Production environment (to be configured later)

## Local Development Workflow

### 1. Start Local Backend & Frontend

You need to start a local supabase instance with this command:

```bash
# Start local supabase (use this for mailpit and other services)
supabase start

# Apply Prisma migrations to this new local supabase db
npx prisma migrate dev
```

```bash
# Start local backend server (copies .env.local to .env)
npm run dev:server

# In another terminal, start Expo (copies .env.local to .env)
npm start
```

This uses:

- Local PostgreSQL database at `localhost:5432`
- Local backend at `http://localhost:3001`

### 2. Running on Device/Simulator

```bash
# iOS
npm run ios

# Android
npm run android
```

## Staging Workflow

### Option 1: Local App → Staging Backend

```bash
# Start Expo with staging environment
npm run start:staging

# Or for specific platform
npm run ios:staging
npm run android:staging
```

This connects your local app to:

- Staging backend on Render: `https://grouply-fdpg.onrender.com`
- Staging Supabase database

### Option 2: Push to Internal Build with EAS Update

```bash
# Build once for staging (only needed first time or when native code changes)
eas build --platform ios --profile staging

# For subsequent updates, use EAS Update (much faster)
eas update --channel staging --message "your update message"
```

Your staging build will automatically receive the update!

## EAS Build Profiles

### `development`

- Local development build with dev client
- Uses localhost URLs
- For testing native modules locally

### `preview`

- Internal distribution
- Quick preview builds

### `production`

- Production builds (to be configured)

## Environment Variables

### Frontend (Expo) Variables

These must be prefixed with `EXPO_PUBLIC_` to be accessible in your React Native code:

- `EXPO_PUBLIC_TRPC_URL` - Backend API URL
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` - Supabase anon/public key

### Backend Variables

- `DATABASE_URL` - PostgreSQL connection string (with pooling)
- `DIRECT_URL` - Direct PostgreSQL connection (for migrations)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key
- `GOOGLE_PLACES_API_KEY` - Google Places API key
- `OPENAI_API_KEY` - OpenAI API key

## Database Migrations

### Local

```bash
# Ensure .env.local is active
cp .env.local .env

# Run migrations
npx prisma migrate dev --name your_migration_name
```

### Staging

```bash
# Ensure .env.staging is active
cp .env.staging .env

# Run migrations (be careful!)
npx prisma migrate deploy
```

## Common Commands

```bash
# Local development (default)
npm start                    # Start Expo with local env
npm run dev:server           # Start backend with local env

# Staging
npm run start:staging        # Start Expo with staging env
npm run dev:server:staging   # Start backend with staging env

# EAS Updates
eas update --channel staging # Push update to staging build
eas build --profile staging  # Create new staging build
```

## Best Practices

1. **Always work on local first** - Make changes and test locally before pushing to staging
2. **Use EAS Update for quick iterations** - Much faster than rebuilding
3. **Be careful with staging DB** - It's shared, so migrations affect everyone
4. **Never commit `.env`, `.env.local`, or `.env.staging`** - These contain secrets
5. **Keep `.env.*.example` files updated** - So others know what variables are needed

## Troubleshooting

### Wrong environment being used?

Check which `.env` file is currently active:

```bash
cat .env
```

Manually switch if needed:

```bash
cp .env.local .env    # Switch to local
cp .env.staging .env  # Switch to staging
```

### EAS Update not working?

Make sure your build was created with the correct channel:

```bash
eas build:list --platform ios
```
