---
name: add-simple-endpoint
description: Create a simple FastAPI endpoint that aggregates data from existing services
user_invocable: true
---

# Add Simple FastAPI Endpoint

Create a simple data-fetching endpoint that aggregates data from existing services/routers and returns it in a schema.

## Pattern

1. **Define the endpoint** in the appropriate router file with:
   - Route decorator: `@router.get()` or `@router.post()`
   - Response model: `response_model=YourSchema`
   - Parameters: player_id, league_id, user_id, week, etc.

2. **Find which functions to call** by searching existing files:
   - `routers/waivers.py` - Waiver-specific stats (recent adds, last 3 games, snap share)
   - `routers/trades.py` - Player stats (FantasyCalc, ROS rankings, roster info)
   - `routers/sleeper.py` - Sleeper API (roster, league type, matchups)
   - `services/fantasypros.py` - FantasyPros data
   - `services/sleeper.py` - Sleeper service functions

3. **Aggregate the data** by calling multiple functions and combining results

4. **Return the schema** - Create a Pydantic model instance with the aggregated data

## Example Pattern

```python
@router.get("/player_stats/{player_id}/{week}", response_model=PlayerStats)
def get_player_stats(player_id: str, week: int):
    # Call existing functions
    base_stats = fetch_player_filtered_stats(player_id)
    ros_ranking = fetch_ros_player_ranking(player_id, week)
    recent_adds = fetch_player_recent_adds(player_id)

    # Aggregate into schema
    return PlayerStats(
        name=base_stats["name"],
        position=base_stats["info"]["position"],
        ros_ranking=ros_ranking,
        recent_adds=recent_adds,
    )
```

## Key Steps

1. Search for existing functions that provide the data you need (use Grep/Glob tools)
2. Check what each function returns (use Read tool)
3. Call them in sequence and combine results
4. Return properly typed schema

## DON'T Use This For

- Endpoints that call Claude/Gemini AI (use different pattern)
- Complex multi-step logic (needs more planning)
- New service integrations (need to create service functions first)

## DO Use This For

- Aggregating player stats from multiple sources
- Combining roster + league data
- Simple lookups that return formatted data

## Project-Specific Functions Available

### Waiver Stats (routers/waivers.py)
- `fetch_player_recent_adds(player_id)` → int | None
- `fetch_player_last_3_games(player_id)` → float | None (avg PPR points last 3 weeks)
- `fetch_player_snap_share(player_id)` → float | None (avg snap % last 3 games)
- `fetch_player_owned_avg(player_id)` → float | None (ownership percentage)
- `fetch_waiver_stats(player_id)` → WaiverExtraStats (aggregates all above)

### Trade/Player Stats (routers/trades.py)
- `fetch_player_filtered_stats(player_id)` → dict with name, info, fantasyCalc
- `fetch_ros_player_ranking(player_id, week)` → dict | None
- `get_roster_info(player_ids: list[str], week)` → list[RosterPlayer]

### Sleeper Data (routers/sleeper.py)
- `fetch_roster(league_id, user_id)` → dict with players list
- `fetch_league_type(league_id)` → dict with league type

### NFLReadPy Data (import nflreadpy as nfl)
Load data directly from nflreadpy for custom analysis. All functions return Polars DataFrames.

**`nfl.load_snap_counts(seasons=2025)`**
- Columns: player, week, offense_pct, defense_pct, special_teams_pct, etc.
- Use case: Calculate snap share trends, usage patterns
- Example: `snaps.filter(snaps["player"] == "Justin Jefferson").sort("week", descending=True).head(3)`

**`nfl.load_ff_rankings()`**
- Columns: player, pos, team, ecr (overall ranking), player_owned_avg, player_owned_espn, player_owned_yahoo, bye, etc.
- Use case: Get current rankings and ownership data
- Note: Snapshot data (no weekly history), no `seasons` parameter
- Example: `rankings.filter(rankings["player"] == "CeeDee Lamb")["ecr"][0]`

**`nfl.load_ff_opportunity()`**
- 159 columns including: player_id, full_name, position, week, season, game_id
- Attempts: pass_attempt, rec_attempt, rush_attempt
- Stats: pass_yards_gained, rec_yards_gained, rush_yards_gained, receptions, touchdowns
- Expected stats: *_exp versions of all stats (e.g., receptions_exp, rec_yards_gained_exp)
- Fantasy points: pass_fantasy_points, rec_fantasy_points, rush_fantasy_points, total_fantasy_points
- Team stats: All stats also available with _team suffix
- Use case: Analyze opportunity trends, target share, expected vs actual performance
- Example: `opp.filter(opp["full_name"] == "Tyreek Hill").sort("week", descending=True).head(3)`

### FantasyPros Service (services/fantasypros.py)
- `get_player_projection(week, fp_id)` → dict with player projection data
- `get_player_rankings(fp_id, week)` → dict with player rankings
- Note: Requires FantasyPros ID (fp_id), not Sleeper ID. Use `sleeper_fp_map.get(player_id)` to convert

## Example: WaiverExtraStats Endpoint

```python
@router.get("/player_waiver_stats/{player_id}", response_model=WaiverExtraStats)
def get_player_waiver_stats(player_id: str):
    recent_adds = fetch_player_recent_adds(player_id)
    last_3_avg = fetch_player_last_3_games(player_id)
    snap_share = fetch_player_snap_share(player_id)

    return WaiverExtraStats(
        recent_adds=recent_adds,
        last_3_avg=last_3_avg,
        snap_share=snap_share,
    )
```
