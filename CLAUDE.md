# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (Expo)

```bash
npm start                  # Local dev — copies .env.dev → .env, starts Expo with --clear
npm run ios                # Run on iOS simulator
npm run android            # Run on Android emulator
npm run lint               # Expo lint
```

### Backend (Express/tRPC)

```bash
npm run dev:server         # Local backend with nodemon (uses .env.dev)
npm run server-lint        # Type-check backend only (tsconfig.server.json)
```

### Database

```bash
npm run migrate:dev        # Run Prisma migrations against local DB
npx prisma generate        # Regenerate Prisma client (outputs to backend/generated/prisma)
```

### Testing

```bash
npm test                   # Run all Jest tests
npm test -- --testPathPattern=<path>  # Run a single test file
```

### Deployment

```bash
npm run deploy:internal    # EAS OTA update → staging (iOS)
npm run update:production  # EAS OTA update → production (iOS + Android)
```

## Architecture

Grouply is a cross-platform mobile app (iOS/Android/Web) — React Native frontend + Node.js/Express backend — communicating exclusively over tRPC for end-to-end type safety.

### Frontend

- **Routing:** Expo Router with file-based routes. Route groups: `(app)` (authenticated tabs), `(auth)` (unauthenticated flows), `(events)`, `(profile)`.
- **Root layout** (`app/_layout.tsx`): mounts `AuthProvider`, `trpc.Provider`, `QueryClientProvider`, `GestureHandlerRootView`, and `SafePostHogProvider`. Also runs a backend health check on first load.
- **Auth middleware** (`app/_middleware.tsx`): enforces route-level auth guards (e.g., admin-only `/Dev` screen).
- **Styling:** NativeWind v4 (Tailwind for React Native). All colors are defined in `lib/theme.ts` and imported into `tailwind.config.js` — always reference theme colors via NativeWind className, not inline styles.
- **Components:** `app-components/` organized by feature area: `shared/`, `home/`, `events/`, `users/`, `onboarding/`, `dev/`.
- **tRPC client** (`lib/trpc.ts`): handles Android emulator `localhost → 10.0.2.2` translation, attaches Supabase JWT as `Authorization: Bearer` on every request, and enforces a 15-second fetch timeout.

### Backend

- **Entry:** `backend/server/index.ts` — Express app with tRPC mounted at `/trpc`.
- **tRPC setup** (`backend/server/trpc.ts`): defines four procedure tiers:
  - `publicProcedure` — no auth
  - `authProcedure` — valid Supabase JWT required (used for signup/registration)
  - `protectedProcedure` — JWT + DB user record required (most routes)
  - `paidProcedure` — active `Subscription` record required (admins bypass)
  - `adminProcedure` — `role === "ADMIN"` required
- **Routers** (`backend/server/routers/`): `users`, `events`, `activities`, `interests`, `traits`, `locations`, `messagesAI`, `reports`, `subscriptions`, `troubleshooting`. All assembled in `routers/index.ts` → `AppRouter`.
- **Database:** Prisma ORM → PostgreSQL. Schema in `prisma/schema.prisma`; generated client outputs to `backend/generated/prisma`. Key models: `User`, `Event`, `Activity`, `Location`, `ChatChannel`/`ChatMessage`, `Subscription`, `EventProfileSnapshot` (host vibe snapshot for matching).
- **AI services** (`backend/server/services/ai/`): OpenAI integrations — `generateAIResponse.ts` (conversational concierge), `generateEventFieldsFromContext.ts` (event creation assist).
- **Validation:** Zod schemas in `backend/server/schemas/validation.ts` are the source of truth for input shapes and DTOs.

### Shared

`shared/types/` — TypeScript interfaces used by both frontend and backend (User, Event, Location, Chat, Activities). `shared/utils/calculateAge.ts` — utility shared across both sides.

### Environment System

`APP_ENV` is the single control variable: `"local"` | `"staging"` | `"prod"`.

- Frontend reads it from `Constants.expoConfig.extra.env.APP_ENV`
- Backend reads it from `process.env.APP_ENV`
- IAP verification, Apple sandbox/production mode, and logging verbosity are all derived from this value automatically
- npm scripts copy the appropriate `.env.dev` / `.env.stg` file to `.env` before starting — never edit `.env` directly

## Conventions

- Use `protectedProcedure` for any route requiring a logged-in user; `paidProcedure` for subscription-gated features.
- All API calls go through tRPC — no raw `fetch` to the backend from the frontend.
- AI logic stays inside `backend/server/services/ai/`.
- Input validation uses Zod schemas in `backend/server/schemas/validation.ts`.
- Prisma client is a singleton at `backend/server/prisma.ts` — import from there.
- The `@` path alias maps to the repo root (both in source via `tsconfig.json` and in tests via `jest.config.js`).
