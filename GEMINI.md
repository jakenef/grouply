# Grouply: AI-Powered Event Discovery & Group Matching

Grouply is a cross-platform mobile application (iOS, Android, and Web) that helps users find and join group activities tailored to their interests through an AI-driven conversational interface.

## Tech Stack

- **Frontend:** React Native (Expo), Expo Router, NativeWind (TailwindCSS for RN)
- **Backend:** Node.js, Express, tRPC, Prisma, PostgreSQL
- **AI:** OpenAI API (Conversational concierge and recommendation engine)
- **Auth & Storage:** Supabase (Auth and Storage)
- **State Management:** TanStack Query (via tRPC)

## Architecture

### Frontend (`app/` & `app-components/`)

- **Navigation:** File-based routing using `expo-router`.
- **Layout:** `app/_layout.tsx` handles global providers (Auth, tRPC, QueryClient).
- **Styling:** NativeWind (v4) for consistent styling across platforms.
- **Component Library:** `app-components/` contains reusable UI elements (buttons, pickers, cards).
- **TRPC Client:** `lib/trpc.ts` configures the connection to the backend, including automatic IP resolution for Android emulators.

### Backend (`backend/server/`)

- **API:** tRPC for type-safe communication. Routers are defined in `backend/server/routers/`.
- **Database:** Prisma ORM with PostgreSQL. The schema is in `prisma/schema.prisma`.
- **Authentication:** Middleware in `backend/server/trpc.ts` validates Supabase JWTs and maps them to database users via `protectedProcedure`.
- **AI Services:** OpenAI integrations are housed in `backend/server/services/ai/`.

### Shared (`shared/`)

- Contains TypeScript interfaces and utility functions used by both the frontend and backend.

## Key Commands

### Development

- `npm install`: Install dependencies.
- `npm run dev:server`: Start the backend server with `nodemon` and `tsx`.
- `npx expo start`: Start the Expo development server.
- `npm run ios`: Run on iOS simulator.
- `npm run android`: Run on Android emulator.

### Database

- `npx prisma migrate dev`: Run database migrations.
- `npx prisma generate`: Generate the Prisma client.

### Quality & Testing

- `npm run lint`: Run Expo linting.
- `npm run server-lint`: Type-check the backend server code.
- `npm test`: Run Jest tests.

## Development Conventions

- **Type Safety:** Use tRPC for all API calls to ensure end-to-end type safety.
- **Styling:** Prefer NativeWind for UI components. Use colors from theme.ts
- **Authentication:** Use `protectedProcedure` for any route requiring a logged-in user.
- **AI Logic:** Keep AI-related logic within the `services/ai` directory to maintain modularity.
- **Validation:** Use Zod schemas in `backend/server/schemas/validation.ts` for input validation and DTO definitions.

## Project Structure

- `app/`: Screens and routing.
- `app-components/`: Shared UI components.
- `backend/`: Express server, tRPC routers, AI services.
- `prisma/`: Database schema and migrations.
- `lib/`: Utilities for auth, storage, and networking.
- `shared/`: Shared types and logic.
