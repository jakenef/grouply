# Grouply

> AI-powered event discovery and group matching app

---

## Overview

Grouply is a cross-platform mobile application that helps users find and join group activities and events tailored to their interests. Powered by AI, Grouply acts as a smart event concierge, learning what users want to do and surfacing the best matching events in their area.

## Features

- AI event concierge: Conversational assistant to help users find activities
- Personalized event suggestions based on user input and preferences
- Group size, time, and activity filtering
- Real-time chat and messaging
- User profiles and onboarding
- Cross-platform: iOS, Android, and Web

## Tech Stack

- **Frontend:** React Native (Expo), Expo Router, NativeWind (TailwindCSS for RN)
- **Backend:** Node.js, Express, tRPC, Prisma, PostgreSQL
- **AI:** OpenAI API integration
- **Auth & Storage:** Supabase

## Project Structure

- `app/` — All screens and navigation (file-based routing)
- `app-components/` — Shared and feature-specific UI components
- `backend/` — Express server, tRPC routers, AI services
- `prisma/` — Database schema and migrations
- `lib/` — Shared utilities (auth, storage, theme, etc.)
- `assets/` — Images and static assets

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL database (local or cloud)
- OpenAI API key
- Supabase project & keys

### Setup

1. **Clone the repo:**

   ```bash
   git clone https://github.com/jakenef/grouply.git
   cd grouply
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env` and fill in required values (OpenAI, Supabase, DB, etc.)

4. **Set up the database:**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the backend server:**

   ```bash
   npm run dev:server
   ```

6. **Start the frontend (Expo)**
   ```bash
   npx expo start
   ```

**Running on Devices**
iOS: npm run ios
Android: npm run android
Web: npm run web

**Linting & Testing**
Lint: npm run lint
Test: npm run test

### Architecture

Frontend:
File-based routing via Expo Router
NativeWind for styling (see tailwind.config.js)
Shared UI in app-components/

Backend:
Express server with tRPC API
AI services in backend/server/services/ai/
Database access via Prisma

### Environment Variables

Grouply uses a single `APP_ENV` variable to determine the environment (local, staging, prod):

- **`APP_ENV`**: Must be `"local"`, `"staging"`, or `"prod"`
- **Local development**: Use `.env.dev` (automatically copied by npm scripts)
- **Staging**: Use `.env.stg` (automatically copied by npm scripts)
- **Production**: Set `APP_ENV=prod` in your deployment environment

#### Environment Files

| File | Purpose | APP_ENV | URLs |
|------|---------|---------|------|
| `.env.dev` | Local development | `local` | localhost:3001, 127.0.0.1:54321 |
| `.env.stg` | Staging deployment | `staging` | Render staging, Supabase staging |
| Production | Environment variables | `prod` | Production URLs |

#### Required Variables (all environments)

```bash
APP_ENV=local                    # "local", "staging", or "prod"
DATABASE_URL=postgresql://...    # PostgreSQL connection
OPENAI_API_KEY=sk-...           # OpenAI API key
EXPO_PUBLIC_SUPABASE_URL=...    # Supabase URL
EXPO_PUBLIC_SUPABASE_KEY=...    # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=...   # Supabase service role key
EXPO_PUBLIC_TRPC_URL=...        # Backend API URL
GOOGLE_PLACES_API_KEY=...       # Google Places API
```

#### Environment Detection

- **Frontend**: Reads `APP_ENV` from `Constants.expoConfig.extra.env.APP_ENV`
- **Backend**: Reads `APP_ENV` from `process.env.APP_ENV`
- **Apple IAP**: Automatically sets to `"PRODUCTION"` for prod, `"SANDBOX"` otherwise
- **IAP Mode**: Local uses mock receipts, staging/prod use real verification

#### Scripts

```bash
npm start              # Local development (copies .env.dev to .env)
npm start:staging      # Staging mode (copies .env.stg to .env)
npm run dev:server     # Local backend (uses .env.dev)
npm run dev:server:staging  # Staging backend (uses .env.stg)
```
