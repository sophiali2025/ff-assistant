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

def get_exp_point_nflreadpy(full_name: str, week: int):
    """Get a player's expected fantasy points from nflreadpy FF opportunity data.

    Args:
        full_name: Player's full name (e.g., "Ja'Marr Chase")
        week: Week number

    Returns:
        float: Expected fantasy points (total_fantasy_points_exp) or None if not found
    """
    # Load FF opportunity data for the current season
    df = nfl.load_ff_opportunity(seasons=int(SEASON), stat_type="weekly")

    # Filter by player name and week
    player_data = df.filter(
        (df["full_name"] == full_name) & (df["week"] == float(week))
    )

    # Return expected points if found
    if player_data.height > 0:
        return player_data["total_fantasy_points_exp"][0]

    return None