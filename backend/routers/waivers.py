from fastapi import APIRouter
import nflreadpy as nfl
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

# get players snap share based on last 3 games
@router.get("/player_snap_share/{player_id}")
def fetch_player_snap_share(player_id: str):
    # Look up the player's full name from Sleeper data.
    player_info = sleeper_all_players.get(player_id)
    if player_info is None:
        return {"error": f"No Sleeper player found for {player_id}"}
    full_name = player_info.get("full_name")

    # Load snap counts and filter to this player.
    snaps = nfl.load_snap_counts(seasons=2024)
    player_snaps = snaps.filter(snaps["player"] == full_name)

    if player_snaps.is_empty():
        return None

    # Get the last 3 games by week number.
    player_snaps = player_snaps.sort("week", descending=True).head(3)
    avg_pct = round(player_snaps["offense_pct"].mean() * 100, 1)

    return avg_pct
