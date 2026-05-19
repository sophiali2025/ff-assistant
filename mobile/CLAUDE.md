# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fantasy Football Assistant — a mobile app that helps fantasy football players view rosters, get AI-powered start/sit recommendations, and track matchups. Integrates with Sleeper (fantasy football platform), Anthropic Claude (AI recommendations), and Tenor (GIFs).

## Monorepo Structure

This repo contains two separate applications at `/mobile` and `../backend`:

- **mobile/** — Expo React Native app (TypeScript)
- **backend/** — FastAPI Python API server

## Development Commands

### Mobile (from `/mobile`)
```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run in browser
```

### Backend (from `/backend`)
```bash
python main.py         # Runs uvicorn on 0.0.0.0:8000 with hot reload
```

No test runner, linter, or formatter is currently configured for either app.

## Architecture

### Mobile App

- **Framework**: Expo SDK 54, React Native 0.81, React 19
- **Routing**: Expo Router (file-based) — screens live in `app/` directory
- **Navigation**: Tab-based layout defined in `app/(tabs)/_layout.tsx`
- **Auth**: Supabase client initialized in `lib/supabase.ts` with AsyncStorage for session persistence
- **Path aliases**: `@/*` maps to the project root (configured in tsconfig)
- **Theming**: Light/dark mode via `@react-navigation/native` ThemeProvider and `constants/Colors.ts`

Route groups:
- `app/(tabs)/` — Main tab screens (matchup, roster, startsit)
- `app/(auth)/` — Login/signup screens

### Backend

- **Framework**: FastAPI with Pydantic schemas
- **Entry point**: `main.py` → runs `app/app.py:app`
- **Schemas**: Defined in `app/schemas.py` (Player, TeamScore, Matchup)
- **Data**: Currently uses mock data from `app/mock_data.py`
- **Service layer**: `services/` contains integrations (sleeper.py, claude.py, tenor.py)
- **Routers**: `routers/` has modular route handlers (leagues, startsit, gifs)

### Communication

The mobile app connects to the backend via `EXPO_PUBLIC_API_URL` (set in `.env`). The API client in `lib/api.ts` is not yet implemented.

## Environment Variables

### Mobile (`.env`)
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `EXPO_PUBLIC_API_URL` — Backend URL (e.g., `http://192.168.50.66:8000`)

### Backend (`.env`)
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY`
- `TENOR_API_KEY`

## Notes
I'm building the front end in react native but i don't have much experience on it. Teach me react basics while building the front end.
I'm making a full stack app for the first time. Teach me how to make requests to the backend while you are implementing them
