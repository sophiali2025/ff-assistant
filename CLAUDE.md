# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fantasy Football Assistant — a mobile app that helps fantasy football players view rosters and matchups, get AI-powered start/sit recommendations, trade analysis, and waiver pickup advice. Integrates with Sleeper (fantasy football platform), FantasyPros (player projections and data), and Anthropic Claude (AI recommendations).

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
- `app/(tabs)/` — Main tab screens (roster, ai)
- `app/(auth)/` — Login/signup screens
- `app/(onboarding)/` — Onboarding flow for new users (username input, league selection)
- `app/trade.tsx`, `app/startsit.tsx`, `app/waiver.tsx` — Stack screens navigated to from tabs

Season & Week Management (`contexts/SeasonContext.tsx`):
- Fetches current NFL state from `/nfl/state` endpoint (refreshes every 24 hours)
- **Preseason handling**: During preseason (`season_type === 'pre'`), uses week 1 of current season for roster/matchup display
- **Postseason handling**: Uses week 17 of previous season
- **Regular season**: Uses `display_week` of `league_season`
- **Fallback**: If API fails, defaults to week 17 of 2025
- Test mode via env variables: `EXPO_PUBLIC_TEST_SEASON` and `EXPO_PUBLIC_TEST_WEEK`

UI Display Logic:
- **Null points display**: Components show "-" when points are `null` or `NaN` (game not played yet)
  - `PlayerRow.tsx`: Shows "-" for `actualPoints` when null
  - `TeamScore.tsx`: Shows "-" for both actual and projected points when null
  - `WeeklyMatch.tsx`: Accepts `number | null` for all point values
- **Preseason roster**: If `seasonType === 'pre'` and roster is empty, shows "Season has not started yet"
- **Error handling**: Gracefully handles missing roster/matchup data when switching leagues (returns empty arrays instead of crashing)

Auth & Onboarding:
- Global auth state managed via `AuthContext` (in `contexts/AuthContext.tsx`)
- `useAuth()` hook provides `user`, `session`, `loading`, and `signOut()`
- Protected routes via redirects in layout files
- Onboarding check queries `users` table to determine if user has completed setup
- New users → username screen → league picker → database insert → roster screen
- Returning users → login → roster screen (skip onboarding)

API layer (`lib/api.js`):
- All backend calls go through this file using `fetch()` with `EXPO_PUBLIC_API_URL`
- **Authentication**: `getAuthToken()` helper retrieves JWT token from Supabase session
- **Authenticated endpoints**: Onboarding and AI endpoints send `Authorization: Bearer {token}` headers
- **Dynamic user data**: `getActiveUserData()` queries Supabase database for user's Sleeper IDs
- Fetches `sleeper_user_id` from `users` table and active league's `league_id`/`sleeper_roster_id` from `leagues` table
- Uses `Promise.all()` for parallel requests where possible
- **Null handling**: Returns `null` for points when data is unavailable (games not played yet) instead of `0`
  - Allows UI to distinguish between "scored 0 points" and "game hasn't happened yet"
  - Applies to player points (`points_this_week`), matchup points, and projected points

### Backend

- **Framework**: FastAPI with Pydantic schemas
- **Entry point**: `main.py` → runs `app.routes:app` via uvicorn
- **Router registration**: `app/routes.py` imports and mounts all routers with prefixes
- **Schemas**: `app/schemas.py` — all Pydantic models (Player, TradeRequest, CompareRequest, etc.)
- **Static data**: `app/data.py` loads player databases and ID mappings from `data/` files at startup (no database)
- **Services**: `services/` contains external API integrations (sleeper, fantasypros, claude, tank01, gemini, supabase)
  - `services/supabase.py` — Supabase client and auth helpers (get_auth_token, verify_token_and_get_user_id, verify_league_ownership)
  - `services/fantasypros.py` — FantasyPros API integration for projections and player data
- **Routers**: `routers/` has modular route handlers (sleeper, startsit, trades, projections, ai, gifs, leagues, onboarding)

### Projections System

**Data Source**: FantasyPros API (PPR scoring)
- **Batch endpoint**: `/projection/batch/{week}?sleeper_ids={ids}&season={season}` — Fetches projections for multiple players
- **Single player**: `/projection/{player_id}/{week}?season={season}` — Fetches projection for one player
- **Roster total**: `/projection/roster/{league_id}/{roster_id}/{week}?season={season}` — Sums all starter projections

**Implementation**:
- Mobile app passes Sleeper IDs and season to backend
- Backend converts Sleeper IDs → FantasyPros IDs using `sleeper_fp_map`
- Calls FantasyPros API with correct season (e.g., "2026" for preseason 2026)
- Parses `points_ppr` field from response (PPR scoring format)
- Returns projections keyed by Sleeper IDs

**Response Structure**:
```json
{
  "players": [
    {
      "fpid": 23136,
      "name": "Player Name",
      "stats": {
        "points": 13.76,      // Standard scoring
        "points_ppr": 17.37,  // PPR scoring (used)
        "points_half": 15.56  // Half PPR scoring
      }
    }
  ]
}
```

**Important**: Season parameter is required to fetch correct projections (hardcoded "2025" will fail for 2026 preseason)

### Database (Supabase)

Three main tables:

**users**:
- `id` (uuid, FK to auth.users.id) — Supabase auth user ID
- `sleeper_username` (text) — User's Sleeper username
- `sleeper_user_id` (text) — Sleeper user ID (used for API calls)

**leagues**:
- `id` (uuid, PK) — League record ID
- `user_id` (uuid, FK to users.id) — Owner of this league record
- `league_id` (text) — Sleeper league ID
- `league_name` (text) — League display name
- `season` (int4) — Year (e.g., 2025)
- `sleeper_roster_id` (int4) — User's roster ID in this league
- `is_active` (bool) — Whether this is the user's currently selected league
- Roster position counts: `num_qbs`, `num_wrs`, `num_rbs`, `num_tes`, `num_flex`, `num_bench`
- League settings: `num_teams`, `scoring_format`

**saved_recommendations**:
- `id` (uuid, PK)
- `user_id` (uuid, FK to users.id)
- `league_id` (text)
- `week` (int4), `season` (int4), `type` (text)
- `players_considered` (jsonb), `recommendation` (jsonb)

Users can have multiple leagues but only one is active at a time (`is_active = true`)

### ID Mapping System

All player lookups use Sleeper IDs as the primary key. Mapping files in `data/` translate between systems:
- `sleeper_fp_mappings.txt` — Sleeper ID → FantasyPros ID
- `sleeper_tank01_mappings.txt` — Sleeper ID → Tank01 ID
- `fantasycalc_player.txt` — FantasyCalc trade values keyed by Sleeper ID

### Communication Flow

```
Mobile (fetch + JWT token) → Backend (FastAPI + auth validation) → External APIs (Sleeper, FantasyPros, Tank01, Anthropic)
                             ↓                                      ↓
                      Supabase (verify token)              Supabase (database queries)
```

- GET requests use URL params (e.g., `/roster/{league_id}/{user_id}`)
- POST requests use JSON body (e.g., `/ai/evaluate_trade/claude`)
- **Authenticated requests** include `Authorization: Bearer {token}` header
- Multiple player IDs are passed as colon-separated strings (e.g., `"4042:4046:8183"`)
- User data queries go directly to Supabase from mobile app (read operations)
- Database writes (onboarding, league switching) go through backend endpoints

### Authentication & Onboarding Flow

**Authentication Pattern:**
- Mobile app stores JWT token in Supabase session (managed by Supabase client)
- `getAuthToken()` helper in `lib/api.js` retrieves token from session
- Authenticated endpoints require `Authorization: Bearer {token}` header
- Backend validates token via `verify_token_and_get_user_id()` (returns 401 if invalid)
- Some endpoints also verify league ownership via `verify_league_ownership()` (returns 403 if unauthorized)

**New User Journey:**
1. Sign up → Supabase creates auth user
2. Redirect to `/(onboarding)/username` (index.tsx checks users table, finds no entry)
3. User enters Sleeper username → validate via backend `/user/{username}/id` → get `sleeper_user_id`
4. Navigate to `/(onboarding)/pick-league` with params
5. Fetch user's leagues from backend `/user/{sleeperUserId}/leagues/2025` → display list
6. User picks league → fetch roster to get `sleeper_roster_id`
7. **Call backend** `POST /onboarding/complete` with auth token → backend inserts into `users` and `leagues` tables
8. Navigate to `/(tabs)/roster`

**Returning User Journey:**
1. Login → Supabase validates credentials
2. Redirect to `/` (index.tsx)
3. Query `users` table → user exists
4. Redirect to `/(tabs)/roster`

**Switch League Flow:**
1. User navigates to `/(onboarding)/pick-league` (without params)
2. Fetch user data from Supabase → get existing leagues
3. User selects different league
4. **Call backend** `POST /onboarding/switch-league` with auth token → backend updates `is_active` flags

**Route Protection:**
- `app/(auth)/_layout.tsx` → redirects authenticated users to `/`
- `app/(tabs)/_layout.tsx` → redirects unauthenticated users to login
- `app/index.tsx` → checks onboarding status and routes accordingly

### AI Integration

- `routers/ai.py` handles Claude and Gemini requests
- **All AI endpoints require authentication** (JWT token validation)
- **Trade/waiver endpoints verify league ownership** (prevents analyzing other users' data)
- **League settings retrieved from Supabase** — All endpoints call `verify_league_ownership()` to get scoring format and roster structure from database (eliminates external Sleeper API call)
- **Helper function** — `get_league_type_from_format()` converts `scoring_format` from DB ("1", "0.5", "0") to readable strings ("PPR", "HALF", "STD")
- **Roster structure in prompts** — All AI prompts include roster constraints (e.g., "1 QB, 2 RB, 2 WR, 1 TE, 2 FLEX slots") for better positional analysis
- System prompts enforce JSON-only responses with specific schemas
- Trade eval sends player stats + full roster context to Claude for analysis
- The `services/claude.py` client uses `claude-sonnet-4-6` model

**Protected Endpoints:**
- `POST /ai/compare/claude` — Token validation + ownership check (gets league settings)
- `POST /ai/evaluate_trade/claude` — Token validation + ownership check (gets league settings)
- `POST /ai/evaluate_waiver/claude` — Token validation + ownership check (gets league settings)

**League Settings Flow:**
```
AI endpoint → verify_league_ownership(user_id, league_id) → Supabase leagues table
          ↓
league_record (scoring_format, num_qbs, num_rbs, num_wrs, num_tes, num_flex, num_bench)
          ↓
get_league_type_from_format() → "PPR"/"HALF"/"STD"
          ↓
Build roster_info string → "1 QB, 2 RB, 2 WR, 1 TE, 2 FLEX slots"
          ↓
Include in AI prompt for context-aware recommendations
```

## Environment Variables

### Mobile (`.env`)
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection (auth + database)
- `EXPO_PUBLIC_API_URL` — Backend URL (e.g., `http://192.168.1.113:8000`)

### Backend (`.env`)
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — Supabase connection for server-side operations
- `ANTHROPIC_API_KEY` — Claude API for AI recommendations
- `GEMINI_API_KEY` — Google Gemini API (alternative AI provider)
- `RAPID_API_KEY` / `FANTASY_PROS_API_KEY` — FantasyPros for player data

## Guidelines

- I'm learning React Native — teach me React basics and explain new concepts while building the front end.
- I'm making a full stack app for the first time — teach me how to make requests to the backend and other APIs while implementing them.
- Do NOT add features, endpoints, or files I haven't explicitly asked for.
- When editing Python files, only add imports to the file I specify. Never introduce circular imports.
- When implementing UI interactions involving onBlur and onPress (e.g., dropdown selections), use setTimeout to defer blur handling so press events fire correctly.
