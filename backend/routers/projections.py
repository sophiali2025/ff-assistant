from fastapi import APIRouter
from services.sleeper import get_rosters
from services.fantasypros import get_player_projection, get_batch_projections, get_player_news
from services.tank01 import get_player_projection_t1, get_team_projection_t1
from app.data import sleeper_fp_map, sleepr_tank01_map, sleeper_all_players

router = APIRouter()

# --- Fantasy Pros API routes ---

# Batch route must come before the single-player route, because
# /projection/{player_id}/{week} would match "batch" as a player_id.
@router.get("/projection/batch/{week}")
def fetch_batch_projections(week: int, sleeper_ids: str):
    """Fetch projections for multiple players in one API call.
    sleeper_ids is a colon-separated string of Sleeper player IDs."""
    id_list = sleeper_ids.split(":")

    # Convert Sleeper IDs to FantasyPros IDs, skipping any without a mapping.
    fp_ids = []
    sleeper_to_fp = {}
    for sid in id_list:
        fp_id = sleeper_fp_map.get(sid)
        if fp_id:
            fp_ids.append(fp_id)
            sleeper_to_fp[fp_id] = sid

    if not fp_ids:
        return {"projections": {sid: 0 for sid in id_list}}

    try:
        data = get_batch_projections(week, fp_ids)
        # Build a lookup from fp_id -> projected points
        result = {}
        for player in data.get("players", []):
            fp_id = str(player["fpid"])
            pts = player.get("stats", {}).get("points_ppr", 0)
            sid = sleeper_to_fp.get(fp_id)
            if sid:
                result[sid] = pts

        # Fill in 0 for any player we couldn't get projections for
        for sid in id_list:
            if sid not in result:
                result[sid] = 0

        return {"projections": result}
    except Exception as e:
        return {"projections": {sid: 0 for sid in id_list}, "error": str(e)}

@router.get("/projection/roster/{league_id}/{roster_id}/{week}")
def fetch_all_starters_projection(league_id: str, roster_id: int, week: int):
    rosters = get_rosters(league_id)
    roster = next((r for r in rosters if r["roster_id"] == roster_id), None)
    if roster is None:
        return {"projected_points": 0, "error": f"No roster found for roster_id {roster_id}"}

    # Batch all starters into one FantasyPros call
    sleeper_ids = ":".join(roster["starters"])
    batch = fetch_batch_projections(week, sleeper_ids)
    total_projected = sum(batch["projections"].values())

    return {
        "roster_id": roster_id,
        "week": week,
        "projected_points": round(total_projected, 2),
    }

@router.get("/projection/{player_id}/{week}")
def fetch_projection(player_id: str, week: int):
    # player_id is a Sleeper ID — look up the FantasyPros ID from the mapping.
    fp_id = sleeper_fp_map.get(player_id)
    if fp_id is None:
        return {"projected_points": 0, "error": f"No FantasyPros mapping for {player_id}"}

    try:
        data = get_player_projection(week, fp_id)
        player = data["players"][0]
        return {
            "projected_points": player["stats"]["points_ppr"],
        }
    except Exception as e:
        return {"projected_points": 0, "error": str(e)}

@router.get("/news/{player_id}")
def fetch_most_recent_player_news(player_id: str):
    fp_id = sleeper_fp_map.get(player_id)
    if fp_id is None:
        return {"recent news": "no news", "error": f"No FantasyPros mapping for {player_id}"}

    try:
        data = get_player_news(fp_id)
        recent_news = data["items"][0]
        return {
            "news impact": recent_news["impact"],
        }
    except Exception as e:
        return {"recent news": "no news", "error": str(e)}


# --- Tank01 API routes ---

# League scoring settings (hardcoded for now).
# These come from the Sleeper league settings screenshots.
SCORING = {
    "pass_yds":  0.04,   # +0.04 per yard (25 yards = 1 point)
    "pass_td":   4,
    "pass_int":  -1,
    "rush_yds":  0.1,    # +0.1 per yard (10 yards = 1 point)
    "rush_td":   6,
    "rec":       1,      # PPR: 1 point per reception
    "rec_yds":   0.1,    # +0.1 per yard (10 yards = 1 point)
    "rec_td":    6,
    "two_pt":    2,
    "fum_lost":  -2,
    "fg_made":   3,
    "fg_missed": -1,
    "xp_made":   1,
    "xp_missed": -1,
}

# Defense/Special Teams scoring settings (from league settings).
DEF_SCORING = {
    "def_td":       6,   # defensive touchdown (pick-6, fumble return TD, etc.)
    "return_td":    6,   # kick/punt return touchdown
    "sack":         1,
    "interception": 2,
    "fum_rec":      2,   # fumble recovery
    "safety":       2,
    "forced_fum":   1,
    "block_kick":   2,
}

# Points-allowed brackets — the fantasy points you get based on how
# many real points the opposing offense scored against your defense.
# Example: if ptsAgainst is 12, that falls in the 7–13 bracket → 4 pts.
POINTS_ALLOWED_BRACKETS = [
    (0,  0,  10),   # shut-out
    (1,  6,   7),
    (7,  13,  4),
    (14, 20,  1),
    (21, 27,  0),
    (28, 34, -1),
    (35, 999, -4),  # 35+
]

def _pts_allowed_score(pts_against: float) -> float:
    """Return fantasy points for the points-allowed bracket."""
    pts = int(pts_against)
    for low, high, score in POINTS_ALLOWED_BRACKETS:
        if low <= pts <= high:
            return score
    return -4  # fallback: treat as 35+

@router.get("/projection_t1/{player_id}/{week}")
def fetch_projection_t1(player_id: str, week: int):
    # player_id is a Sleeper ID — look up the Tank01 ID from the mapping.
    tank01_id = sleepr_tank01_map.get(player_id)
    if tank01_id is None:
        return {"error": f"No Tank01 mapping found for Sleeper player_id {player_id}"}

    data = get_player_projection_t1(tank01_id)

    # The response has body.projections — an array of weekly stats.
    # Each entry has a "week" field like "Week_17". We find the one
    # matching the requested week number.
    projections = data["body"]["projections"]
    week_key = f"Week_{week}"
    week_data = next((p for p in projections if p["week"] == week_key), None)

    if week_data is None:
        return {"error": f"No projection found for week {week}"}

    # if kicker
    pos = data["body"]["pos"]
    if pos == "PK":
        kicking = week_data["Kicking"]
        projected_points = (
            float(kicking["fgMade"]) * SCORING["fg_made"]
            + float(kicking["fgMissed"]) * SCORING["fg_missed"]
            + float(kicking["xpMade"]) * SCORING["xp_made"]
            + float(kicking["xpMissed"]) * SCORING["xp_missed"]
        )
        return {
            "player": data["body"]["longName"],
            "team": data["body"]["team"],
            "position": pos,
            "week": week,
            "projected_points": round(projected_points, 1),
            "kicking": kicking,
        }

    # All values from Tank01 are strings, so we convert to float.
    passing = week_data["Passing"]
    rushing = week_data["Rushing"]
    receiving = week_data["Receiving"]

    projected_points = (
        # Passing
        float(passing["passYds"]) * SCORING["pass_yds"]
        + float(passing["passTD"]) * SCORING["pass_td"]
        + float(passing["int"]) * SCORING["pass_int"]
        # Rushing
        + float(rushing["rushYds"]) * SCORING["rush_yds"]
        + float(rushing["rushTD"]) * SCORING["rush_td"]
        # Receiving
        + float(receiving["receptions"]) * SCORING["rec"]
        + float(receiving["recYds"]) * SCORING["rec_yds"]
        + float(receiving["recTD"]) * SCORING["rec_td"]
        # Misc
        + float(week_data.get("twoPointConversion", "0")) * SCORING["two_pt"]
        + float(week_data.get("fumblesLost", "0")) * SCORING["fum_lost"]
    )

    return {
        "player": data["body"]["longName"],
        "team": data["body"]["team"],
        "position": pos,
        "week": week,
        "projected_points": round(projected_points, 1),
        "rushing": rushing,
        "passing": passing,
        "receiving": receiving,
    }

@router.get("/projection_t1/team/{team_id}/{week}")
def fetch_team_projection_t1(team_id: str, week: int):
    # team_id is a Sleeper team abbreviation — look up the Tank01 team ID.
    tank01_team_id = sleepr_tank01_map.get(team_id)
    if tank01_team_id is None:
        return {"error": f"No Tank01 mapping found for team {team_id}"}

    data = get_team_projection_t1(tank01_team_id)

    # The team response is similar to the player response — it has
    # body.projections with weekly entries keyed like "Week_17".
    projections = data["body"]["projections"]
    week_key = f"Week_{week}"
    week_data = next((p for p in projections if p["week"] == week_key), None)

    if week_data is None:
        return {"error": f"No projection found for week {week}"}

    # All values come back as strings, so convert to float.
    def_td      = float(week_data.get("defTD", "0"))        # if stat is missing, return 0
    return_td   = float(week_data.get("returnTD", "0"))
    sacks       = float(week_data.get("sacks", "0"))
    ints        = float(week_data.get("interceptions", "0"))
    fum_rec     = float(week_data.get("fumbleRecoveries", "0"))
    safeties    = float(week_data.get("safeties", "0"))
    block_kick  = float(week_data.get("blockKick", "0"))
    pts_against = float(week_data.get("ptsAgainst", "0"))

    projected_points = (
        def_td     * DEF_SCORING["def_td"]
        + return_td  * DEF_SCORING["return_td"]
        + sacks      * DEF_SCORING["sack"]
        + ints       * DEF_SCORING["interception"]
        + fum_rec    * DEF_SCORING["fum_rec"]
        + safeties   * DEF_SCORING["safety"]
        + block_kick * DEF_SCORING["block_kick"]
        + _pts_allowed_score(pts_against)
    )

    return {
        "team": team_id,
        "week": week,
        "projected_points": round(projected_points, 1),
        "defTD": def_td,
        "returnTD": return_td,
        "sacks": sacks,
        "interceptions": ints,
        "fumbleRecoveries": fum_rec,
        "safeties": safeties,
        "blockKick": block_kick,
        "ptsAgainst": pts_against,
    }

@router.get("/projection_t1/roster/{league_id}/{roster_id}/{week}")
def fetch_entire_roster_projection_t1(league_id: str, roster_id: int, week: int):
    rosters = get_rosters(league_id)
    roster = next((r for r in rosters if r["roster_id"] == roster_id), None)
    if roster is None:
        return {"error": f"No roster found for roster_id {roster_id}"}

    total_projected = 0.0

    for player_id in roster["starters"]:
        player = sleeper_all_players.get(player_id)
        if player is None:
            continue

        if player.get("position") == "DEF":
            result = fetch_team_projection_t1(player.get("team"), week)
        else:
            result = fetch_projection_t1(player_id, week)

        if "projected_points" in result:
            total_projected += result["projected_points"]

    return {
        "roster_id": roster_id,
        "week": week,
        "projected_points": round(total_projected, 2),
    }
