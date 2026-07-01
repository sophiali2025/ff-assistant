# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fantasy Football Assistant — a mobile app that helps fantasy football players view rosters and matchups, get AI-powered start/sit recommendations, trade analysis, and waiver pickup advice. Integrates with Sleeper (fantasy football platform), FantasyPros (fantasy football data), Tank01 (projections), and Anthropic Claude (AI recommendations).

## Monorepo Structure

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
- **Fonts**: Custom fonts (Jaro, Inter) loaded in `app/_layout.tsx`

Route groups:
- `app/(tabs)/` — Main tab screens (roster, ai, startsit, matchup)
- `app/(auth)/` — Login/signup screens
- `app/trade.tsx`, `app/startsit.tsx` — Stack screens navigated to from tabs

API layer (`lib/api.js`):
- All backend calls go through this file using `fetch()` with `EXPO_PUBLIC_API_URL`
- Hardcoded user/league constants at the top (will be dynamic later)
- Uses `Promise.all()` for parallel requests where possible

### Backend

- **Framework**: FastAPI with Pydantic schemas
- **Entry point**: `main.py` → runs `app.routes:app` via uvicorn
- **Router registration**: `app/routes.py` imports and mounts all routers with prefixes
- **Schemas**: `app/schemas.py` — all Pydantic models (Player, TradeRequest, CompareRequest, etc.)
- **Static data**: `app/data.py` loads player databases and ID mappings from `data/` files at startup (no database)
- **Services**: `services/` contains external API integrations (sleeper, fantasypros, claude, tank01, gemini)
- **Routers**: `routers/` has modular route handlers (sleeper, startsit, trades, projections, ai, gifs, leagues)

### ID Mapping System

All player lookups use Sleeper IDs as the primary key. Mapping files in `data/` translate between systems:
- `sleeper_fp_mappings.txt` — Sleeper ID → FantasyPros ID
- `sleeper_tank01_mappings.txt` — Sleeper ID → Tank01 ID
- `fantasycalc_player.txt` — FantasyCalc trade values keyed by Sleeper ID

### Communication Flow

```
Mobile (fetch) → Backend (FastAPI) → External APIs (Sleeper, FantasyPros, Tank01, Anthropic)
```

- GET requests use URL params (e.g., `/roster/{league_id}/{user_id}`)
- POST requests use JSON body (e.g., `/ai/evaluate_trade/claude`)
- Multiple player IDs are passed as colon-separated strings (e.g., `"4042:4046:8183"`)

### AI Integration

- `routers/ai.py` handles Claude and Gemini requests
- System prompts enforce JSON-only responses with specific schemas
- Trade eval sends player stats + full roster context to Claude for analysis
- The `services/claude.py` client uses `claude-sonnet-4-6` model

## Environment Variables

### Mobile (`.env`)
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `EXPO_PUBLIC_API_URL` — Backend URL (e.g., `http://192.168.1.113:8000`)

### Backend (`.env`)
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `RAPID_API_KEY` / `FANTASY_PROS_API_KEY`

## Guidelines

- I'm learning React Native — teach me React basics and explain new concepts while building the front end.
- I'm making a full stack app for the first time — teach me how to make requests to the backend and other APIs while implementing them.
- Do NOT add features, endpoints, or files I haven't explicitly asked for.
- When editing Python files, only add imports to the file I specify. Never introduce circular imports.
- When implementing UI interactions involving onBlur and onPress (e.g., dropdown selections), use setTimeout to defer blur handling so press events fire correctly.
