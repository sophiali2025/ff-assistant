from fastapi import FastAPI
from .mock_data import MOCK_ROSTER, MOCK_MATCHUP
from main import app
from services.sleeper import get_user, get_rosters, get_matchups

@app.get("/roster/{league_id}")
def get_roster(league_id: str):
    return MOCK_ROSTER.get(league_id)

@app.get("/player/{league_id}/{player_id}")
def get_player(league_id: str, player_id: str):
    roster = MOCK_ROSTER.get(league_id, [])
    roster_by_id = {p["player_id"]: p for p in roster}
    return roster_by_id.get(player_id)


# --- Sleeper API routes ---
# These routes call the real Sleeper API (not mock data).
# Your backend acts as a "proxy" — the mobile app calls your backend,
# and your backend calls Sleeper. This keeps all API logic server-side.

@app.get("/user/{username}")
def fetch_user(username: str):
    return get_user(username)

@app.get("/user/{username}/id")
def get_user_id(username: str):
    user = get_user(username)
    return {"user_id": user["user_id"]}

# @app.get("/roster/{league_id}/{user_id}")
# def fetch_roster(league_id: str, user_id: str):
#     rosters = get_rosters(league_id)
#     my_roster = next(r for r in rosters if r["owner_id"] == user_id)
#     return my_roster

@app.get("/matchup/{league_id}/{week}/{roster_id}")
def fetch_my_matchup(league_id: str, week: int, roster_id: int):
    matchups = get_matchups(league_id, week)
    my_matchup = next((m for m in matchups if m["roster_id"] == roster_id), None)
    return my_matchup

@app.get("/matchup/{league_id}/{week}/{roster_id}/{matchup_id}")
def fetch_opp_matchup(league_id: str, week: int, roster_id: int, matchup_id: int):
    matchups = get_matchups(league_id, week)
    opp_matchup = next((m for m in matchups if m["matchup_id"] == matchup_id
        and m["roster_id"] != roster_id), None)
    return opp_matchup