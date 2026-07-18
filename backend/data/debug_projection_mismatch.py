"""
Debug script to find why some projections are 0
Compares Sleeper player names with nflreadpy data
"""
import nflreadpy as nfl
from app.data import sleeper_all_players

# Test with the player that showed 0 (player_id 4046)
test_player_id = "4046"
week = 17

# Get player info from Sleeper
player_info = sleeper_all_players.get(test_player_id)
if player_info:
    sleeper_name = player_info.get("full_name")
    print(f"Sleeper player ID: {test_player_id}")
    print(f"Sleeper full_name: '{sleeper_name}'")
    print(f"Position: {player_info.get('position')}")
    print(f"Team: {player_info.get('team')}\n")
else:
    print(f"Player {test_player_id} not found in Sleeper data")
    exit()

# Load nflreadpy data
print("Loading nflreadpy FF opportunity data...")
df = nfl.load_ff_opportunity(seasons=2025, stat_type="weekly")

# Try exact match
print(f"\n1. Trying exact match for '{sleeper_name}'...")
exact_match = df.filter(
    (df["full_name"] == sleeper_name) & (df["week"] == float(week))
)
print(f"   Found {exact_match.height} rows")
if exact_match.height > 0:
    print(f"   Expected points: {exact_match['total_fantasy_points_exp'][0]}")

# Try partial match (contains)
print(f"\n2. Trying partial match (contains)...")
partial_match = df.filter(df["full_name"].str.contains(sleeper_name[:10]))
print(f"   Found {partial_match.height} rows")
if partial_match.height > 0:
    print("   Matching names:")
    for name in partial_match["full_name"].unique():
        print(f"     - '{name}'")

# Try by last name
last_name = sleeper_name.split()[-1]
print(f"\n3. Trying last name match ('{last_name}')...")
last_name_match = df.filter(df["full_name"].str.contains(last_name))
print(f"   Found {last_name_match.height} rows")
if last_name_match.height > 0:
    print("   Matching names:")
    for name in last_name_match["full_name"].unique().head(10):
        print(f"     - '{name}'")

# Check if player exists at all (any week)
print(f"\n4. Checking if player exists in any week...")
any_week = df.filter(df["full_name"] == sleeper_name)
print(f"   Found {any_week.height} rows across all weeks")
if any_week.height > 0:
    weeks = any_week["week"].unique().sort()
    print(f"   Available weeks: {weeks.to_list()}")
