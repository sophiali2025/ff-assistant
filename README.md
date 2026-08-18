# Fantasy Football Assistant

A mobile app that helps fantasy football players manage their teams with AI-powered recommendations for start/sit decisions, trade analysis, and waiver pickups.

## Features

- **Roster Management** - View your roster with real-time scores and projections
- **Start/Sit Assistant** - AI-powered recommendations for lineup decisions
- **Trade Analyzer** - Evaluate trades with player values and AI analysis
- **Waiver Pickup Advisor** - Find the best available players and get drop recommendations
- **Multi-League Support** - Manage multiple fantasy leagues in one app
- **Dynamic Season/Week** - Automatically adapts to current NFL week and season

## Tech Stack

### Mobile App
- **Framework**: Expo SDK 54 + React Native 0.81
- **Language**: TypeScript
- **Routing**: Expo Router (file-based)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)

### Backend
- **Framework**: FastAPI (Python)
- **AI**: Claude 4.6 (Anthropic API)
- **Data Sources**:
  - Sleeper API (fantasy platform integration)
  - FantasyPros API (player projections & rankings)
  - Tank01 API (additional projections)

## Project Structure

```
ff-assistant/
├── mobile/              # Expo React Native app
│   ├── app/            # Screens (Expo Router file-based routing)
│   │   ├── (tabs)/    # Main tab screens (roster, ai)
│   │   ├── (auth)/    # Login/signup screens
│   │   ├── (onboarding)/ # New user onboarding
│   │   ├── trade.tsx  # Trade analyzer screen
│   │   ├── waiver.tsx # Waiver pickup screen
│   │   └── startsit.tsx # Start/sit assistant
│   ├── components/     # Reusable React components
│   ├── contexts/       # React Context (AuthContext, SeasonContext)
│   └── lib/           # API client and utilities
│
└── backend/            # FastAPI server
    ├── app/           # FastAPI app setup
    ├── routers/       # API route handlers
    ├── services/      # External API integrations
    └── data/          # Player ID mappings
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- iOS Simulator (Mac) or Android Emulator
- Supabase account
- API keys (see Environment Variables below)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (see Environment Variables section)

5. Run the server:
```bash
python main.py
```

Backend will run at `http://localhost:8000`

### Mobile Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (see Environment Variables section)

4. Start Expo:
```bash
npm start
```

5. Run on device:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Environment Variables

### Backend (`/backend/.env`)

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key
GEMINI_API_KEY=your_gemini_api_key  # Optional

# Data APIs
RAPID_API_KEY=your_rapid_api_key
FANTASY_PROS_API_KEY=your_fantasypros_api_key

# NFL Season/Week Test Mode (Optional)
# Uncomment to use hardcoded values instead of live Sleeper API
# TEST_SEASON=2025
# TEST_WEEK=17
```

### Mobile (`/mobile/.env`)

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API
EXPO_PUBLIC_API_URL=http://192.168.1.113:8000  # Replace with your IP

# NFL Season/Week Test Mode (Optional)
# Uncomment to use hardcoded values instead of calling backend
# EXPO_PUBLIC_TEST_SEASON=2025
# EXPO_PUBLIC_TEST_WEEK=17
```

**Note**: For mobile development, replace `192.168.1.113` with your computer's local IP address. Find it with:
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` (look for IPv4 Address)

## Database Setup

The app uses Supabase with three main tables:

### `users` table
```sql
- id (uuid, FK to auth.users.id)
- sleeper_username (text)
- sleeper_user_id (text)
```

### `leagues` table
```sql
- id (uuid, PK)
- user_id (uuid, FK to users.id)
- league_id (text) - Sleeper league ID
- league_name (text)
- season (int4)
- sleeper_roster_id (int4)
- is_active (bool) - Currently selected league
- num_qbs, num_wrs, num_rbs, num_tes, num_flex, num_bench (int4)
- num_teams (int4)
- scoring_format (text) - "1", "0.5", or "0"
```

### `saved_recommendations` table
```sql
- id (uuid, PK)
- user_id (uuid, FK to users.id)
- league_id (text)
- week (int4)
- season (int4)
- type (text)
- players_considered (jsonb)
- recommendation (jsonb)
```

## Season/Week Configuration

The app automatically fetches the current NFL week and season from Sleeper's API.

### Test Mode

For development and testing, you can override the live data with hardcoded values:

1. **Edit `.env` files** to uncomment test mode variables
2. **Restart both servers** (backend and mobile)
3. **Verify in logs**:
   - Backend: Mock data returned from `/nfl/state`
   - Mobile: Console shows "Using test mode - 2025 week 17"

### Season Types

The app handles three NFL season phases:

- **Preseason** (`season_type: "pre"`) - Shows "Season has not started yet"
- **Regular Season** (`season_type: "regular"`) - Uses current week
- **Postseason** (`season_type: "post"`) - Uses week 17 of previous season

### Live Mode

To use live NFL data:

1. Comment out or remove `TEST_*` variables from both `.env` files
2. Restart servers
3. App will call Sleeper API for current season state

## API Keys

You'll need to obtain API keys from:

1. **Supabase** - https://supabase.com
   - Create a project
   - Get URL and anon key from project settings

2. **Anthropic** - https://console.anthropic.com
   - Create an account
   - Generate an API key for Claude

3. **FantasyPros** - https://www.fantasypros.com/api
   - Sign up for API access
   - Premium tier required for projections

4. **RapidAPI** - https://rapidapi.com
   - Sign up and subscribe to Tank01 NFL API (optional)

## User Flow

### New User
1. Sign up with email/password (Supabase Auth)
2. Enter Sleeper username → validate
3. Select fantasy league from list
4. App fetches roster and displays home screen

### Returning User
1. Login with email/password
2. Automatically directed to roster screen
3. Can switch leagues via profile dropdown

## Authentication

All AI endpoints (trade analysis, start/sit, waiver evaluation) require authentication:

- Mobile app stores JWT token in Supabase session
- Token sent in `Authorization: Bearer {token}` header
- Backend validates token and checks league ownership
- Unauthorized requests return 401/403 errors

## Development Notes

### Mobile Hot Reload
- Code changes reload automatically in Expo
- If changes don't appear, shake device → "Reload"
- For new dependencies, restart Expo server

### Backend Hot Reload
- Uvicorn watches for file changes
- Automatically reloads on save
- For new dependencies, restart `python main.py`

### Common Issues

**"No active session" error**
- User not logged in
- Token expired (refresh by restarting app)

**"Failed to fetch leagues"**
- Check backend is running
- Verify API_URL in mobile `.env` matches your local IP
- Ensure both devices on same network

**Projections not loading**
- Set `PROJECTIONS_ENABLED = false` in `mobile/lib/api.js` to disable
- Check FantasyPros API quota

## Testing

No automated test suite is currently configured. Manual testing recommended:

1. **Test onboarding flow** - Create new account, link Sleeper, select league
2. **Test roster screen** - Verify data loads, week display correct
3. **Test AI features** - Start/sit, trade analysis, waiver pickup
4. **Test league switching** - Navigate to profile → switch league
5. **Test season states** - Use test mode to simulate preseason/postseason

## Contributing

This is a personal learning project. Features are added as needed for my own fantasy football leagues.

## License

Private project - not licensed for public use.
