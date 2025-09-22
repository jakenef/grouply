# Grouply - AI Coding Assistant Instructions

## Project Overview

Grouply is a React Native mobile application built with Expo and using file-based routing via Expo Router. The application appears to be in early development stages, focusing on creating a mobile application for group-related functionality.

## Architecture & Structure

### Routing

- File-based routing using Expo Router
- Main entry point is `app/_layout.tsx` which sets up the SafeAreaProvider and Stack Navigator
- Routes are defined by files in the `app/` directory, with `index.tsx` as the root route

### Styling

- Uses NativeWind (Tailwind for React Native) for styling
- Custom theme configuration in `tailwind.config.js` with defined color palette:
  - Primary: `#4f47e5`
  - Custom success, warning, and danger colors with accent variants
- Apply styles using className prop: `<View className="flex-1 justify-center items-center">`

### UI Components

- React Native core components (`View`, `Text`, etc.)
- No custom component library is established yet

## Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Devices

- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

### Linting

```bash
npm run lint
```

## Key Technologies & Dependencies

### Core

- React Native 0.81.4
- Expo 54.0.4
- Expo Router 6.0.2 for navigation
- TypeScript for type safety

### UI & Styling

- NativeWind 4.2.0 (TailwindCSS for React Native)
- Expo Vector Icons for iconography

### Navigation

- React Navigation 7.x (via `@react-navigation/native` and related packages)
- Bottom tabs navigation support

## Common Patterns & Conventions

### File Structure

- `app/` - Contains all screens and navigation using file-based routing
- `assets/images/` - Contains all application images
- No established components directory yet (consider suggesting creating one)

### Styling Convention

- Use NativeWind className props for styling
- Reference the color theme in `tailwind.config.js` for consistent styling

## Platform Configuration

- Cross-platform support for iOS, Android, and Web
- Specific platform configurations in `app.json`
- Custom splash screen and icons already configured
- New React Native architecture enabled

## Expo Features Used

- Expo Splash Screen
- Expo Status Bar
- Expo Linking
- Expo Constants
- Expo System UI

When contributing, ensure to follow the existing patterns and leverage the Expo ecosystem for cross-platform compatibility.
