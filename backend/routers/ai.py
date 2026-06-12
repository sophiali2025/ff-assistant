import json

from fastapi import APIRouter
from services.claude import ask_claude
from services.gemini import ask_gemini
from routers.startsit import fetch_batch_player_info_basic
from routers.sleeper import fetch_league_type
from routers.trades import get_trade_players, get_roster_players
from app.schemas import CompareRequest, CompareResponse, ComparePlayer, TradePlayer, TradeRequest, TradeResponse

COMPARE_SYSTEM_PROMPT = """You are a fantasy football analyst.
Respond with ONLY a valid JSON array, no other text.
Use this exact structure for each player:
[{"player": "name", "rank": 1, "verdict": "start", "projection": 19.3, "ranking": "RB12", "def_rank": "28th", "reasoning": "2-3 sentences"}]
verdict must be exactly one of: start, ok, sit.
Rank players from 1 (best) to N (worst)."""

router = APIRouter()

@router.post("/ai/test/claude")
async def test_claude():
    message = await ask_claude("Say good morning in one sentence.", 100)
    return {"message": message}

@router.post("/ai/test/gemini")
async def test_gemini():
    message = await ask_gemini("Say good morning in one sentence.")
    return {"message": message}

# start sit
def parse_rankings(players: list[ComparePlayer]) -> str:
    """Turn ranked players into 'Tracy > Walker > Shakir' format.
    Players are already sorted by rank from Claude's response."""
    last_names = [" ".join(p.player.split()[1:]) for p in players]
    return " > ".join(last_names)

def parse_compare_response(raw: str) -> list[ComparePlayer]:
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
        text = text.strip()

    data = json.loads(text)
    return [ComparePlayer(**p) for p in data]

@router.post("/ai/compare/claude", response_model=CompareResponse)
async def compare_players_claude(request: CompareRequest):
    player_info = fetch_batch_player_info_basic(request.week, request.players)
    league_type = fetch_league_type(request.league_id)["league type"]

    prompt = f"""Compare these fantasy football players for week {request.week} of the {request.season} season.
    League format: {league_type}
    Player Info: {player_info}

    Rank them from best to worst start option."""

    result = await ask_claude(prompt, 600, system=COMPARE_SYSTEM_PROMPT)
    players = parse_compare_response(result)

    return CompareResponse(
        players=players,
        rankings=parse_rankings(players),
        starting_player=players[0].player,
        summary=f"Start {players[0].player}. {players[0].reasoning}"
    )

@router.post("/ai/compare/gemini", response_model=CompareResponse)
async def compare_players_gemini(request: CompareRequest):
    player_info = fetch_batch_player_info_basic(request.week, request.players)
    league_type = fetch_league_type(request.league_id)["league type"]

    prompt = f"""Compare these fantasy football players for week {request.week} of the {request.season} season.
    League format: {league_type}
    Player Info: {player_info}

    Rank them from best to worst start option."""

    result = await ask_gemini(prompt, system=COMPARE_SYSTEM_PROMPT)
    players = parse_compare_response(result)

    return CompareResponse(
        players=players,
        rankings=parse_rankings(players),
        starting_player=players[0].player,
        summary=f"Start {players[0].player}. {players[0].reasoning}"
    )

# trade eval
@router.post("/ai/evaluate_trade/claude", response_model=TradeResponse)
async def evalute_players_claude(request: TradeRequest):
    player_info = get_trade_players(request.give, request.get, request.current_week)
    league_type = fetch_league_type(request.league_id)["league type"]
    # add roster

    # change prompt
    prompt = f"""Compare these fantasy football players for week {request.week} of the {request.season} season.
    League format: {league_type}
    Player Info: {player_info}

    Provide a verdict: accept, counter, or decline and provde reasoning why in 2-3 sentences."""

    # make still compare stuff below here
    result = await ask_claude(prompt, 600, system=COMPARE_SYSTEM_PROMPT)
    players = parse_compare_response(result)

    return CompareResponse(
        players=players,
        rankings=parse_rankings(players),
        starting_player=players[0].player,
        summary=f"Start {players[0].player}. {players[0].reasoning}"
    )
