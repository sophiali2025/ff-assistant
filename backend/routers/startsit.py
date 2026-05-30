from fastapi import APIRouter
from services.fantasypros import get_player_rankings
from services.espn import get_schedule
from routers.projections import fetch_projection, fetch_most_recent_player_news
from app.data import sleeper_fp_map, sleeper_all_players

router = APIRouter()

@router.get("/")
def startsit_placeholder():
    return {"status": "startsit router ok"}

# player rankings
@router.get("/player_rankings/weekly/{player_id}/{week}")
def fetch_weekly_player_ranking(player_id: str, week: int):
    # player_id is a Sleeper ID — look up the FantasyPros ID from the mapping.
    fp_id = sleeper_fp_map.get(player_id)
    if fp_id is None:
        return {"error": f"No FantasyPros mapping for {player_id}"}

    all_rankings = get_player_rankings(fp_id, week)
    return all_rankings["players"][0]["rank"]["ECR"]["PPR"]

@router.get("/player_rankings/batch/{week}")
def fetch_batch_player_rankings(week: int, sleeper_ids: str):
    """Fetch weekly rankings for multiple players.
    sleeper_ids is a colon-separated string of Sleeper player IDs."""
    id_list = sleeper_ids.split(":")
    rankings = {}
    for player_id in id_list:
        try:
            result = fetch_weekly_player_ranking(player_id, week)
            if isinstance(result, dict) and "error" in result:
                rankings[player_id] = None
            else:
                rankings[player_id] = result
        except Exception:
            rankings[player_id] = None
    return {"rankings": rankings}

# schedule
@router.get("/schedules")
def fetch_schedule(week: int):
    return get_schedule(week)

# players matchup info
@router.get("/matchup_context/batch/{week}")
def fetch_batch_matchup_context(week: int, sleeper_ids: str):
    """Fetch matchup context for multiple players.
    sleeper_ids is a colon-separated string of Sleeper player IDs."""
    id_list = sleeper_ids.split(":")
    contexts = {}
    for player_id in id_list:
        result = fetch_matchup_context(player_id, week)
        if isinstance(result, dict) and "error" in result:
            contexts[player_id] = None
        else:
            contexts[player_id] = result
    return {"matchup_contexts": contexts}

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

    # 3. Figure out the opponent and home/away status.
    is_home = game["home_team"] == team
    opponent = game["away_team"] if is_home else game["home_team"]

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
        "is_home": is_home,
        "week": week,
        "opponent_def_rank": def_ranking,
    }

# player info
@router.get("/player_info/batch/{week}")
def fetch_batch_player_info_basic(week: int, sleeper_ids: str):
    """Fetch matchup context for multiple players.
    sleeper_ids is a colon-separated string of Sleeper player IDs."""
    id_list = sleeper_ids.split(":")
    contexts = {}
    for player_id in id_list:
        result = fetch_player_info_basic(player_id, week)
        if isinstance(result, dict) and "error" in result:
            contexts[player_id] = None
        else:
            contexts[player_id] = result
    return {"matchup_contexts": contexts}

@router.get("/player_info/{player_id}/{week}")
def fetch_player_info_basic(player_id: str, week: int):
    player = sleeper_all_players.get(player_id)
    if player is None:
        return {"error": f"Player {player_id} not found"}

    name = f"{player.get('first_name')} {player.get('last_name')}"
    position = player.get("position")

    # 1. Player ranking
    try:
        ranking = fetch_weekly_player_ranking(player_id, week)
        if isinstance(ranking, dict) and "error" in ranking:
            ranking = None
    except Exception:
        ranking = None

    # 2. Matchup context (opponent + opponent def ranking)
    matchup = fetch_matchup_context(player_id, week)
    if isinstance(matchup, dict) and "error" in matchup:
        matchup = None

    # 3. Projection
    projection = fetch_projection(player_id, week)

    # 4. Recent news
    news = fetch_most_recent_player_news(player_id)

    return {
        "player": name,
        "fpid": sleeper_fp_map.get(player_id),
        "position": position,
        "week": week,
        "ranking": ranking,
        "projected_points": projection.get("projected_points", 0),
        "opponent_def_rank": matchup.get("opponent_def_rank") if matchup else None,
        "news": news.get("news impact", "no news"),
    }

