import os
import httpx
from dotenv import load_dotenv
import nflreadpy as nfl

load_dotenv()

SEASON = "2025"

FANTASY_PROS_URL = "https://api.fantasypros.com/public/v2/json"

FANTASY_PROS_HEADERS = {
    "x-api-key": os.environ.get("FANTASY_PROS_API_KEY"),
}

def get_player_projection(week: int, player_id: str):
    response = httpx.get(
        f"{FANTASY_PROS_URL}/nfl/{SEASON}/projections?week={week}&players={player_id}&position=ALL",
        headers=FANTASY_PROS_HEADERS,
    )
    response.raise_for_status()

    return response.json()

def get_batch_projections(week: int, player_ids: list[str]):
    """Fetch projections for multiple players in a single API call.
    player_ids is a list of FantasyPros IDs."""
    ids_str = ":".join(player_ids)
    response = httpx.get(
        f"{FANTASY_PROS_URL}/nfl/{SEASON}/projections?week={week}&players={ids_str}&position=ALL",
        headers=FANTASY_PROS_HEADERS,
    )
    response.raise_for_status()

    return response.json()

def get_player_news(player_id: str):
    response = httpx.get(
        f"{FANTASY_PROS_URL}/nfl/news?fpid={player_id}",
        headers=FANTASY_PROS_HEADERS,
    )
    response.raise_for_status()

    return response.json()

def get_player_rankings(player_id: str, week: int):
    response = httpx.get(
        f"{FANTASY_PROS_URL}/nfl/{SEASON}/rankings?player={player_id}&week={week}",
        headers=FANTASY_PROS_HEADERS,
        timeout=30.0,
    )
    response.raise_for_status()

    return response.json()

def get_player_points():
    response = httpx.get(
        f"{FANTASY_PROS_URL}/nfl/{SEASON}/player-points?position=ALL&scoring=PPR",
        headers=FANTASY_PROS_HEADERS,
    )
    response.raise_for_status()

    return response.json()

def get_exp_point_nflreadpy(full_name: str, week: int, player_id: str = None):
    """Get a player's expected fantasy points from nflreadpy FF opportunity data,
    or FantasyPros for kickers and defense.

    Args:
        full_name: Player's full name (e.g., "Ja'Marr Chase")
        week: Week number
        player_id: Sleeper player ID (optional, needed for K/DEF routing)

    Returns:
        float: Expected fantasy points or None if not found
    """
    from app.data import sleeper_all_players, sleeper_fp_map

    # Check if this is a kicker or defense - route to FantasyPros
    if player_id:
        player_info = sleeper_all_players.get(player_id)
        if player_info:
            position = player_info.get("position")
            if position in ["K", "PK", "DEF"]:
                # Use FantasyPros for kickers and defense
                fp_id = sleeper_fp_map.get(player_id)
                if fp_id:
                    try:
                        data = get_player_projection(week, fp_id)
                        # Parse FantasyPros response to extract projected points
                        # Response structure: {"players": [{"stats": {"points": 5.49}}]}
                        if "players" in data and len(data["players"]) > 0:
                            player = data["players"][0]
                            if "stats" in player and "points" in player["stats"]:
                                return float(player["stats"]["points"])
                    except Exception:
                        return None
                return None

    # Use nflreadpy for all other positions
    # Load FF opportunity data for the current season
    df = nfl.load_ff_opportunity(seasons=int(SEASON), stat_type="weekly")

    # Filter by week first to reduce dataset size
    week_data = df.filter(df["week"] == float(week))

    # Try exact match first
    player_data = week_data.filter(week_data["full_name"] == full_name)

    # If no exact match, try matching with suffixes (Jr., Sr., III, etc.)
    if player_data.height == 0:
        # Try adding common suffixes
        for suffix in [" Jr.", " Sr.", " II", " III", " IV", " V"]:
            player_data = week_data.filter(week_data["full_name"] == full_name + suffix)
            if player_data.height > 0:
                break

    # Return expected points if found
    if player_data.height > 0:
        return player_data["total_fantasy_points_exp"][0]

    return None