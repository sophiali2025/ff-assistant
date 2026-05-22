import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TANK01_URL = "https://tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com"

# Headers that RapidAPI requires on every request.
# The API key comes from your .env file — never hardcode secrets.
TANK01_HEADERS = {
    "Content-Type": "application/json",
    "x-rapidapi-host": "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com",
    "x-rapidapi-key": os.environ.get("RAPID_API_KEY"),
}

def get_player_projection_t1(player_id: str):
    response = httpx.get(
        f"{TANK01_URL}/getNFLProjections?playerID={player_id}&itemFormat=list&twoPointConversions=2&passYards=.04&passTD=4&passInterceptions=-1&pointsPerReception=1&rushYards=.1&rushTD=6&fumbles=-2&receivingYards=.1&receivingTD=6&fgMade=3&fgMissed=-1&xpMade=1&xpMissed=-1",
        headers=TANK01_HEADERS,
    )
    response.raise_for_status()

    return response.json()

def get_team_projection_t1(team_id: str):
    response = httpx.get(
        f"{TANK01_URL}/getNFLProjections?teamID={team_id}&itemFormat=list&twoPointConversions=2&passYards=.04&passTD=4&passInterceptions=-1&pointsPerReception=1&rushYards=.1&rushTD=6&fumbles=-2&receivingYards=.1&receivingTD=6&fgMade=3&fgMissed=-1&xpMade=1&xpMissed=-1",
        headers=TANK01_HEADERS,
    )
    response.raise_for_status()

    return response.json()
