"""
Refresh data/sleeper_all_players.txt from Sleeper's live player database.

This file is loaded once at server startup (see app/data.py) and never
updated automatically, so it slowly goes stale as players get traded,
signed, or released — that's what caused missing matchup data for players
whose team changed since the last refresh (e.g. Deebo Samuel).

Run this manually whenever data looks stale. Sleeper's docs ask that this
endpoint be called at most once per day.

Usage (from backend/): python data/refresh_sleeper_players.py
"""
import json
import httpx

SLEEPER_PLAYERS_URL = "https://api.sleeper.app/v1/players/nfl"
OUTPUT_PATH = "data/sleeper_all_players.txt"

print("Fetching latest player data from Sleeper...")
response = httpx.get(SLEEPER_PLAYERS_URL, timeout=30.0)
response.raise_for_status()
players = response.json()

with open(OUTPUT_PATH, "w") as f:
    json.dump(players, f, indent=4)

print(f"Wrote {len(players)} players to {OUTPUT_PATH}")
