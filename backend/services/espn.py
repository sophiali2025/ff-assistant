import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SEASON = "2025"
SEASONTYPE = 2

ESPN_BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"

# cache at the module level — persists for the life of the server process
schedule_cache = {}

def parse_schedule(data: dict) -> list:
    games = []
    for event in data.get("events", []):
        competitors = event["competitions"][0]["competitors"]
        home = next(c for c in competitors if c["homeAway"] == "home")
        away = next(c for c in competitors if c["homeAway"] == "away")
        games.append({
            "home_team": home["team"]["abbreviation"],
            "away_team": away["team"]["abbreviation"],
            "game_id": event["id"],
            "date": event["date"]
        })
    return games

def get_schedule(week: int):
    cache_key = f"{SEASON}_{week}"

    if cache_key in schedule_cache:
        return schedule_cache[cache_key]

    res = httpx.get(
        f"{ESPN_BASE_URL}/scoreboard",
        params={"seasontype": 2, "season": SEASON, "week": week}
    )
    res.raise_for_status()

    data = parse_schedule(res.json())
    schedule_cache[cache_key] = data
    return data