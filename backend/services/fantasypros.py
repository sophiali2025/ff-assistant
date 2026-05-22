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