import os
import httpx
from dotenv import load_dotenv

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