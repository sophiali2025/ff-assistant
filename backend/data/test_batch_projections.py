"""
Test script to check what the batch projections endpoint returns
"""
import httpx

API_URL = "http://192.168.1.113:8000"

# Test with a few known player IDs (these are common players)
# You can replace these with actual player IDs from your roster
test_player_ids = "4046:4034:4039"  # Example Sleeper IDs
week = 17

print(f"Testing batch projections for week {week}...")
print(f"Player IDs: {test_player_ids}\n")

try:
    response = httpx.get(
        f"{API_URL}/projection/batch/{week}?sleeper_ids={test_player_ids}",
        timeout=30.0
    )

    print(f"Status Code: {response.status_code}")
    print(f"\nResponse JSON:")
    data = response.json()

    import json
    print(json.dumps(data, indent=2))

    # Check if projections exist and have values
    if "projections" in data:
        print(f"\nProjections found: {len(data['projections'])} players")
        for player_id, points in data["projections"].items():
            print(f"  Player {player_id}: {points} points")
    else:
        print("\nNo projections key in response!")

    if "error" in data:
        print(f"\nError in response: {data['error']}")

except Exception as e:
    print(f"Error calling endpoint: {e}")
