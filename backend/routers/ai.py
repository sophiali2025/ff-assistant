import json

from fastapi import APIRouter
from services.claude import ask_claude
from services.gemini import ask_gemini
from routers.startsit import fetch_batch_player_info_basic
from routers.sleeper import fetch_league_type
from routers.trades import get_trade_players, get_roster_info
from routers.sleeper import fetch_roster
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
TRADE_SYSTEM_PROMPT = """You are a fantasy football trade analyst.
Evaluate whether the user should accept, counter, or decline this trade.
Consider: trade value fairness, positional need, roster depth, rest-of-season outlook, and player trends.

IMPORTANT: Never mention the numeric "value" from fantasyCalc stats directly.
Use relative language instead (e.g. "worth more than double", "significantly more valuable").
All other stats (rankings, positions, trends, etc.) can be cited numerically.

Respond with ONLY valid JSON in this exact structure, no other text:
{
  "verdict": "accept",
  "summary": "2-3 sentence explanation of your verdict",
  "players": [{"player": "name", "side": "give", "analysis": "1 sentence on this player's value in the trade"}]
}
verdict must be exactly one of: accept, counter, decline.
side must be exactly one of: give, get.
Include every player involved in the trade."""

def parse_trade_response(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
        text = text.strip()
    return json.loads(text)

@router.post("/ai/evaluate_trade/claude", response_model=TradeResponse)
async def evaluate_trade_claude(request: TradeRequest):
    trade_players = get_trade_players(request.give, request.get, request.current_week)
    league_type = fetch_league_type(request.league_id)["league type"]

    roster = fetch_roster(request.league_id, request.user_id)
    roster_players = get_roster_info(roster["players"], request.current_week)

    give_players = [p for p in trade_players if p.side == "give"]
    get_players = [p for p in trade_players if p.side == "get"]

    prompt = f"""Evaluate this trade for week {request.current_week} of the {request.season} season. League format: {league_type}.

    GIVING: {give_players}
    GETTING: {get_players}

    MY CURRENT ROSTER: {roster_players}

    Should I accept, counter, or decline? Consider:
    - Are the values fair based on rankings and trade values?
    - Does this improve my roster's weaknesses or create new holes?
    - Are any players trending up/down significantly?"""

    result = await ask_claude(prompt, 800, system=TRADE_SYSTEM_PROMPT)
    parsed = parse_trade_response(result)

    return TradeResponse(
        verdict=parsed["verdict"],
        summary=parsed["summary"],
        players=trade_players,
        roster=roster_players,
    )
