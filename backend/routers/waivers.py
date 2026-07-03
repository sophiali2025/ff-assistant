from fastapi import APIRouter, Query, HTTPException
import nflreadpy as nfl
from services.sleeper import get_recent_adds_week
from services.fantasypros import get_player_points, get_player_projection
from app.data import sleeper_fp_map, sleeper_all_players, fantasycalc_players, searchable_players
from app.schemas import TradeWaiverPlayer, WaiverExtraStats, PlayerInfo, RosterPlayer
from routers.trades import fetch_player_filtered_stats, fetch_ros_player_ranking

router = APIRouter()


@router.get("/player_recent_adds/{player_id}")
def fetch_player_recent_adds(player_id: str):
    adds = get_recent_adds_week()
    for entry in adds:
        if entry["player_id"] == player_id:
            return entry["count"]
    return None

@router.get("/player_last_3_games/{player_id}")
def fetch_player_last_3_games(player_id: str):
    # player_id is a Sleeper ID — look up the FantasyPros ID from the mapping.
    fp_id = sleeper_fp_map.get(player_id)
    if fp_id is None:
        return {"error": f"No FantasyPros mapping for {player_id}"}
    
    data = get_player_points()
    players = data.get("players", [])
    for entry in players:
        if str(entry["player_id"]) == str(fp_id):
            weeks = entry["weeks"]
            # Get the last 3 weeks by sorting keys as ints and taking the last 3.
            sorted_weeks = sorted(weeks.keys(), key=int)
            last_3 = sorted_weeks[-3:]
            avg = round(sum(weeks[w] for w in last_3) / len(last_3), 1)
            return avg
    return None

# get players snap share based on last 3 games
@router.get("/player_snap_share/{player_id}")
def fetch_player_snap_share(player_id: str):
    # Look up the player's full name from Sleeper data.
    player_info = sleeper_all_players.get(player_id)
    if player_info is None:
        return None
    full_name = player_info.get("full_name")
    if full_name is None:
        return None

    # Load snap counts and filter to this player.
    snaps = nfl.load_snap_counts(seasons=2025)
    player_snaps = snaps.filter(snaps["player"] == full_name)

    if player_snaps.is_empty():
        return None

    # Get the last 3 games by week number.
    player_snaps = player_snaps.sort("week", descending=True).head(3)
    avg_pct = round(player_snaps["offense_pct"].mean() * 100, 1)

    return avg_pct


@router.get("/player_owned_avg/{player_id}")
def fetch_player_owned_avg(player_id: str):
    # Look up the player's full name from Sleeper data.
    player_info = sleeper_all_players.get(player_id)
    if player_info is None:
        return None
    full_name = player_info.get("full_name")
    if full_name is None:
        return None

    # Load fantasy football rankings and filter to this player.
    rankings = nfl.load_ff_rankings()
    player_rankings = rankings.filter(rankings["player"] == full_name)

    if player_rankings.is_empty():
        return None

    # Get the player_owned_avg
    player_owned_avg = player_rankings["player_owned_avg"][0]

    return player_owned_avg


@router.get("/waiver_stats/{player_id}", response_model=WaiverExtraStats)
def fetch_waiver_stats(player_id: str):
    """Get all waiver-related stats for a player."""
    recent_adds = fetch_player_recent_adds(player_id)
    last_3_avg = fetch_player_last_3_games(player_id)
    snap_share = fetch_player_snap_share(player_id)
    player_owned_avg = fetch_player_owned_avg(player_id)

    return WaiverExtraStats(
        recent_adds=recent_adds,
        last_3_avg=last_3_avg,
        snap_share=snap_share,
        player_owned_avg=player_owned_avg
    )


@router.get("/waiver/{player_id}/{week}", response_model=TradeWaiverPlayer)
def fetch_waiver_player(player_id: str, week: int, side: str = "get"):
    """Get complete TradeWaiverPlayer data for a player."""
    filtered = fetch_player_filtered_stats(player_id)

    # If no FantasyCalc data, get basic info from Sleeper
    if "error" in filtered:
        player_info = sleeper_all_players.get(player_id)
        if player_info is None:
            raise HTTPException(status_code=404, detail=f"Player {player_id} not found")

        name = player_info.get("full_name", "Unknown")
        info = PlayerInfo(
            position=player_info.get("position", "Unknown"),
            team=player_info.get("team"),
            age=player_info.get("age"),
            years_of_experience=player_info.get("years_exp"),
        )
        fantasy_calc_stats = None
    else:
        name = filtered["name"]
        info = filtered["info"]
        fantasy_calc_stats = filtered["fantasyCalc"]

    ros = fetch_ros_player_ranking(player_id, week)
    if isinstance(ros, dict) and "error" in ros:
        ros = None

    waiver_stats = fetch_waiver_stats(player_id)

    return TradeWaiverPlayer(
        player_id=player_id,
        name=name,
        side=side,
        info=info,
        ros_ranking=ros,
        fantasy_calc_stats=fantasy_calc_stats,
        waiver_stats=waiver_stats,
    )


@router.get("/roster_players/{week}")
def fetch_roster_players(player_ids: str, week: int) -> list[RosterPlayer]:
    """Get roster player data with waiver stats for multiple players."""
    players = []
    for player_id in player_ids.split(":"):
        filtered = fetch_player_filtered_stats(player_id)

        # If no FantasyCalc data, get basic info from Sleeper
        if "error" in filtered:
            player_info = sleeper_all_players.get(player_id)
            if player_info is None:
                continue

            name = player_info.get("full_name", "Unknown")
            info = PlayerInfo(
                position=player_info.get("position", "Unknown"),
                team=player_info.get("team"),
                age=player_info.get("age"),
                years_of_experience=player_info.get("years_exp"),
            )
            fantasy_calc_stats = None
        else:
            name = filtered["name"]
            info = filtered["info"]
            fantasy_calc_stats = filtered["fantasyCalc"]

        ros = fetch_ros_player_ranking(player_id, week)
        if isinstance(ros, dict) and "error" in ros:
            ros = None

        waiver_stats = fetch_waiver_stats(player_id)

        players.append(RosterPlayer(
            player_id=player_id,
            name=name,
            info=info,
            ros_ranking=ros,
            fantasy_calc_stats=fantasy_calc_stats,
            waiver_stats=waiver_stats,
        ))
    return players


@router.get("/display/{player_id}/{week}")
def fetch_display_info(player_id: str, week: int):
    """Get display player info after search."""
    # Get player info from Sleeper
    player_info = sleeper_all_players.get(player_id)
    if player_info is None:
        raise HTTPException(status_code=404, detail=f"Player {player_id} not found")

    # Get projected points from FantasyPros
    fp_id = sleeper_fp_map.get(player_id)
    projected_points = 0.0
    if fp_id is not None:
        try:
            data = get_player_projection(week, fp_id)
            player = data["players"][0]
            projected_points = player["stats"]["points_ppr"]
        except Exception:
            projected_points = 0.0

    # Get waiver stats
    waiver_stats = fetch_waiver_stats(player_id)

    return {
        "player_id": player_id,
        "name": player_info.get("full_name", "Unknown"),
        "position": player_info.get("position", "Unknown"),
        "team": player_info.get("team"),
        "age": player_info.get("age"),
        "projected_points": projected_points,
        "waiver_stats": waiver_stats,
    }

