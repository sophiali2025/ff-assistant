import json

from fastapi import APIRouter
from services.claude import ask_claude
from routers.startsit import fetch_batch_player_info_basic

SEASON = 2025

COMPARE_SYSTEM_PROMPT = """You are a fantasy football analyst.
Respond with ONLY a valid JSON array, no other text.
Use this exact structure for each player:
[{"player": "name", "rank": 1, "verdict": "start", "projection": 19.3, "def_rank": "28th", "reasoning": "2-3 sentences"}]
verdict must be exactly one of: start, ok, sit.
Rank players from 1 (best) to N (worst)."""

router = APIRouter()

@router.post("/ai/test")
async def test_claude():
    message = await ask_claude("Say good morning in one sentence.", 100)
    return {"message": message}

@router.post("/ai/compare")
async def compare_players(players: str, week: int):
    player_info = fetch_batch_player_info_basic(week, players)

    prompt = f"""Compare these fantasy football players for week {week} of the {SEASON} season.
    Player Info: {player_info}

    Rank them from best to worst start option."""

    result = await ask_claude(prompt, 500, system=COMPARE_SYSTEM_PROMPT)

    # Strip markdown code blocks if Claude wraps the JSON
    text = result.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]  # remove ```json line
        text = text.rsplit("```", 1)[0]  # remove closing ```
        text = text.strip()

    return {"result": json.loads(text)}
