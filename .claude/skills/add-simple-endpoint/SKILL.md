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
- `fetch_player_last_3_games(player_id)` → float | None
- `fetch_player_snap_share(player_id)` → float | None

### Trade/Player Stats (routers/trades.py)
- `fetch_player_filtered_stats(player_id)` → dict with name, info, fantasyCalc
- `fetch_ros_player_ranking(player_id, week)` → dict | None
- `get_roster_info(player_ids: list[str], week)` → list[RosterPlayer]

### Sleeper Data (routers/sleeper.py)
- `fetch_roster(league_id, user_id)` → dict with players list
- `fetch_league_type(league_id)` → dict with league type

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
