"""Test the new get_exp_point_nflreadpy function"""
from services.fantasypros import get_exp_point_nflreadpy

# Test with a known player
player_name = "Ja'Marr Chase"
week = 1

print(f"Getting expected points for {player_name} in Week {week}...")
exp_points = get_exp_point_nflreadpy(player_name, week)

if exp_points is not None:
    print(f"✓ {player_name} - Week {week} expected points: {exp_points:.2f}")
else:
    print(f"✗ Player not found: {player_name}")

# Test with another player
player_name2 = "Christian McCaffrey"
week2 = 1

print(f"\nGetting expected points for {player_name2} in Week {week2}...")
exp_points2 = get_exp_point_nflreadpy(player_name2, week2)

if exp_points2 is not None:
    print(f"✓ {player_name2} - Week {week2} expected points: {exp_points2:.2f}")
else:
    print(f"✗ Player not found: {player_name2}")
