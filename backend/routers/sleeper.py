from fastapi import APIRouter
from services.sleeper import get_user, get_rosters, get_matchups, get_users_in_league, get_league
from app.data import sleeper_all_players

router = APIRouter()

@router.get("/player/{player_id}")
def get_player(player_id: str):
    return sleeper_all_players.get(player_id)

# user info
@router.get("/user/{username}")
def fetch_user(username: str):
    return get_user(username)

@router.get("/user/{username}/id")
def get_user_id(username: str):
    user = get_user(username)
    return {"user_id": user["user_id"]}

# league info
@router.get("/league/scoring_settings/{league_id}")
def fetch_scoring_settings(league_id: str):
    league = get_league(league_id)
    return {"scoring_settings": league["scoring_settings"]}

@router.get("/league/{league_id}")
def fetch_league(league_id: str):
    return get_league(league_id)

# matchup info
@router.get("/matchup/{league_id}/{week}/{roster_id}")
def fetch_my_matchup(league_id: str, week: int, roster_id: int):
    matchups = get_matchups(league_id, week)
    my_matchup = next((m for m in matchups if m["roster_id"] == roster_id), None)
    return my_matchup

@router.get("/matchup/{league_id}/{week}/{roster_id}/{matchup_id}")
def fetch_opp_matchup(league_id: str, week: int, roster_id: int, matchup_id: int):
    matchups = get_matchups(league_id, week)
    opp_matchup = next((m for m in matchups if m["matchup_id"] == matchup_id
        and m["roster_id"] != roster_id), None)
    return opp_matchup

# team info
@router.get("/team/{league_id}/{user_id}")
def fetch_my_team(league_id: str, user_id: str):
    users = get_users_in_league(league_id)
    user = next((u for u in users if u["user_id"] == user_id), None)
    return {"team_name": user["metadata"]["team_name"]}

@router.get("/team/{league_id}/roster/{roster_id}")
def fetch_team_by_roster(league_id: str, roster_id: int):
    rosters = get_rosters(league_id)
    roster = next(r for r in rosters if r["roster_id"] == roster_id)
    owner_id = roster["owner_id"]

    users = get_users_in_league(league_id)
    user = next(u for u in users if u["user_id"] == owner_id)
    return {"team_name": user["metadata"]["team_name"]}

# roster info
@router.get("/roster/{league_id}/{user_id}")
def fetch_roster(league_id: str, user_id: str):
    rosters = get_rosters(league_id)
    my_roster = next(r for r in rosters if r["owner_id"] == user_id)
    return my_roster
