from fastapi import APIRouter
from app.data import sleeper_fp_map, sleeper_all_players, fantasycalc_players
from app.schemas import TradePlayer, RosterPlayer
from services.fantasypros import get_player_rankings


router = APIRouter()

# player ros rankings
@router.get("/player_rankings/ros/{player_id}/{current_week}")
def fetch_ros_player_ranking(player_id: str, week: int):
    # player_id is a Sleeper ID — look up the FantasyPros ID from the mapping.
    fp_id = sleeper_fp_map.get(player_id)
    if fp_id is None:
        return {"error": f"No FantasyPros mapping for {player_id}"}

    all_rankings = get_player_rankings(fp_id, week)
    ecr = all_rankings["players"][0]["rank"].get("ECR", {})
    return ecr.get("ROS-PPR") or ecr.get("DYN") or {"error": f"No rankings found for {player_id}"}

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
        "info": {
            "position": entry["player"]["position"],
            "team": entry["player"]["maybeTeam"],
            "age": entry["player"]["maybeAge"],
            "years_of_experience": entry["player"]["maybeYoe"],
        },
        "fantasyCalc": {
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
        },
    }

# all player info
@router.get("/players_trade_list/{week}")
def get_trade_players(give_player_ids: str, get_player_ids: str, week: int) -> list[TradePlayer]:
    players = []
    for side, ids in [("give", give_player_ids.split(":")), ("get", get_player_ids.split(":"))]:
        for player_id in ids:
            filtered = fetch_player_filtered_stats(player_id)
            if "error" in filtered:
                continue

            ros = fetch_ros_player_ranking(player_id, week)
            if isinstance(ros, dict) and "error" in ros:
                ros = None

            players.append(TradePlayer(
                name=filtered["name"],
                side=side,
                info=filtered["info"],
                ros_ranking=ros,
                fantasy_calc_stats=filtered["fantasyCalc"],
            ))
    return players

@router.get("/players_roster_list/{week}")
def get_roster_players(player_ids: str, week: int) -> list[RosterPlayer]:
    players = []
    for player_id in player_ids.split(":"):
        filtered = fetch_player_filtered_stats(player_id)
        if "error" in filtered:
            continue

        ros = fetch_ros_player_ranking(player_id, week)
        if isinstance(ros, dict) and "error" in ros:
            ros = None

        players.append(RosterPlayer(
            name=filtered["name"],
            info=filtered["info"],
            ros_ranking=ros,
            fantasy_calc_stats=filtered["fantasyCalc"],
        ))
    return players

