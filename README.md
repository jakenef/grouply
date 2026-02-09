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

Create a .env file in the root with:
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
GOOGLE_PLACES_API_KEY=...
# ci check
