from fastapi import APIRouter
from app.data import sleeper_fp_map, sleeper_all_players, fantasycalc_players
from services.fantasypros import get_player_rankings


router = APIRouter()

# player ros rankings
@router.get("/player_ros_rankings/weekly/{player_id}/{week}")
def fetch_ros_player_ranking(player_id: str, week: int):
    # player_id is a Sleeper ID — look up the FantasyPros ID from the mapping.
    fp_id = sleeper_fp_map.get(player_id)
    if fp_id is None:
        return {"error": f"No FantasyPros mapping for {player_id}"}

    all_rankings = get_player_rankings(fp_id, week)
    return all_rankings["players"][0]["rank"]["ECR"]["ROS-PPR"]

# fantasy calc stats
@router.get("/player_fantasycalc_stats/{player_id}")
def fetch_player_fantasyCalc_stats(player_id: str):
    entry = fantasycalc_players.get(player_id)
    if entry is None:
        return {"error": f"No FantasyCalc data for {player_id}"}
    return entry


@router.get("/player_filtered_stats/{player_id}")
def fetch_player_filtered_stats(player_id: str):
    entry = fantasycalc_players.get(player_id)
    if entry is None:
        return {"error": f"No FantasyCalc data for {player_id}"}
    return {
        "name": entry["player"]["name"],
        "position": entry["player"]["position"],
        "team": entry["player"]["maybeTeam"],
        "age": entry["player"]["maybeAge"],
        "years_of_experience": entry["player"]["maybeYoe"],
        "value": entry["value"],
        "overallRank": entry["overallRank"],
        "positionRank": entry["positionRank"],
        "trend30Day": entry["trend30Day"],
        "redraftDynastyValueDifference": entry["redraftDynastyValueDifference"],
        "redraftValue": entry["redraftValue"],
        "maybeMovingStandardDeviation": entry["maybeMovingStandardDeviation"],
        "tier": entry["maybeTier"],
        "adp": entry["maybeAdp"],
        "tradeFrequency": entry["maybeTradeFrequency"],
    }