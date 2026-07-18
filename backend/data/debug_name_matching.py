"""
Debug name matching for specific players
"""
import nflreadpy as nfl
from app.data import sleeper_all_players

# Players that should have projections but show 0
test_cases = [
    ("Deebo Samuel", 7.37),
    ("Kenneth Walker", 11.58),
]

week = 17

# Load nflreadpy data once
print("Loading nflreadpy data...")
df = nfl.load_ff_opportunity(seasons=2025, stat_type="weekly")
week_17_data = df.filter(df["week"] == float(week))

print(f"\nTotal players in week {week}: {week_17_data.height}\n")

# Find Sleeper IDs for these players
for expected_name, expected_pts in test_cases:
    print(f"="*60)
    print(f"Searching for: {expected_name} (expected: {expected_pts} pts)")
    print(f"="*60)

    # Find in Sleeper data
    sleeper_match = None
    for player_id, player_info in sleeper_all_players.items():
        if player_info.get("full_name", "").lower() == expected_name.lower():
            sleeper_match = (player_id, player_info)
            break

    if sleeper_match:
        player_id, player_info = sleeper_match
        sleeper_name = player_info.get("full_name")
        print(f"\nSleeper ID: {player_id}")
        print(f"Sleeper name: '{sleeper_name}'")
    else:
        print(f"\nNot found in Sleeper data, searching variations...")
        # Try partial match
        for player_id, player_info in sleeper_all_players.items():
            full_name = player_info.get("full_name", "")
            if expected_name.split()[1].lower() in full_name.lower():
                print(f"  Possible match: '{full_name}' (ID: {player_id})")
                sleeper_name = full_name
                break

    # Search in nflreadpy
    print(f"\nSearching in nflreadpy for '{expected_name}'...")

    # Exact match
    exact = week_17_data.filter(week_17_data["full_name"] == expected_name)
    print(f"  Exact match: {exact.height} rows")
    if exact.height > 0:
        print(f"    Expected points: {exact['total_fantasy_points_exp'][0]}")

    # Try variations
    last_name = expected_name.split()[-1]
    last_name_matches = week_17_data.filter(
        week_17_data["full_name"].str.contains(last_name)
    )
    print(f"\n  Last name matches ({last_name}): {last_name_matches.height} rows")
    if last_name_matches.height > 0:
        for name in last_name_matches["full_name"].unique():
            match_data = week_17_data.filter(week_17_data["full_name"] == name)
            exp_pts = match_data["total_fantasy_points_exp"][0]
            print(f"    - '{name}': {exp_pts} pts")

    print()
