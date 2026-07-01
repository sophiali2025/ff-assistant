from fastapi import APIRouter
from services.sleeper import get_recent_adds_week
from services.fantasypros import get_player_points
from app.data import sleeper_fp_map, sleeper_all_players, fantasycalc_players, searchable_players

router = APIRouter()


@router.get("/player_recent_adds/{player_id}")
def fetch_player_recent_adds(player_id: str):
    adds = get_recent_adds_week()
    for entry in adds:
        if entry["player_id"] == player_id:
            return entry["count"]
    return None

@router.get("/player_last_3_games/{player_id}")
def fetch_player_last_3_games(player_id: str):
    # player_id is a Sleeper ID — look up the FantasyPros ID from the mapping.
    fp_id = sleeper_fp_map.get(player_id)
    if fp_id is None:
        return {"error": f"No FantasyPros mapping for {player_id}"}
    
    data = get_player_points()
    players = data.get("players", [])
    for entry in players:
        if str(entry["player_id"]) == str(fp_id):
            weeks = entry["weeks"]
            # Get the last 3 weeks by sorting keys as ints and taking the last 3.
            sorted_weeks = sorted(weeks.keys(), key=int)
            last_3 = sorted_weeks[-3:]
            avg = round(sum(weeks[w] for w in last_3) / len(last_3), 1)
            return avg
    return None
