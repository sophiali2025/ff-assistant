from fastapi import APIRouter
from services.fantasypros import get_player_rankings
from services.espn import get_schedule
from app.data import sleeper_fp_map, sleeper_all_players

router = APIRouter()

@router.get("/")
def startsit_placeholder():
    return {"status": "startsit router ok"}

@router.get("/player_rankings/weekly/{player_id}/{week}")
def fetch_weekly_player_ranking(player_id: str, week: int):
    # player_id is a Sleeper ID — look up the FantasyPros ID from the mapping.
    fp_id = sleeper_fp_map.get(player_id)
    if fp_id is None:
        return {"error": f"No FantasyPros mapping for {player_id}"}

    all_rankings = get_player_rankings(fp_id, week)
    return all_rankings["players"][0]["rank"]["ECR"]["PPR"]

@router.get("/schedules")
def fetch_schedule(week: int):
    return get_schedule(week)

@router.get("/matchup_context/{player_id}/{week}")
def fetch_matchup_context(player_id: str, week: int):
    # 1. Get the player's team from the Sleeper player database.
    player = sleeper_all_players.get(player_id)
    if player is None:
        return {"error": f"Player {player_id} not found"}

    team = player.get("team")
    if team is None:
        return {"error": f"Player {player_id} has no team"}

    # 2. Get this week's schedule and find the player's game.
    schedule = get_schedule(week)
    game = next(
        (g for g in schedule if g["home_team"] == team or g["away_team"] == team),
        None,
    )
    if game is None:
        return {"error": f"No game found for {team} in week {week}"}

    # 3. Figure out the opponent.
    opponent = game["away_team"] if game["home_team"] == team else game["home_team"]

    # 4. Get the opponent defense's weekly ranking.
    #    In Sleeper, team defense IDs are the team abbreviation (e.g. "SEA").
    try:
        def_ranking = fetch_weekly_player_ranking(opponent, week)
        def_ranking = def_ranking["DST"]
    except Exception as e:
        def_ranking = {"error": str(e)}

    return {
        "player": f"{player.get('first_name')} {player.get('last_name')}",
        "team": team,
        "opponent": opponent,
        "week": week,
        "opponent_def_rank": def_ranking,
    }