from fastapi import APIRouter
from services.claude import ask_claude
from routers.startsit import fetch_batch_matchup_context

SEASON = 2025

router = APIRouter()

@router.post("/ai/test")
async def test_claude():
    message = await ask_claude("Say good morning in one sentence.", 100)
    return {"message": message}

@router.post("/ai/compare")
async def compare_players(players: str, week: int):
    player_info = fetch_batch_matchup_context(week, players)

    prompt = f"""
    Compare these fantasy football players for week {week} of the {SEASON} season.
    Player Info: {player_info}
    
    Rank them from best to worst start option and explain why in 1-2 sentences each.
    """

    result = await ask_claude(prompt, 500)
    return {"result" : result}