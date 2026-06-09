import json

# Load the player database once at startup. This file is a JSON
# dictionary keyed by player_id, so looking up a player is just
# sleeper_all_players[player_id] — no looping or searching needed.
with open("data/sleeper_all_players.txt", "r") as f:
    sleeper_all_players = json.load(f)

# Load the sleeper_id -> tank01_id mapping so we can accept Sleeper
# player IDs in our routes and translate them for Tank01 calls.
sleepr_tank01_map = {}
with open("data/sleeper_tank01_mappings.txt", "r") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        sleeper_id, tank01_id = line.split(":")
        sleepr_tank01_map[sleeper_id] = tank01_id

# Load the sleeper_id -> fantasypros_id mapping.
sleeper_fp_map = {}
with open("data/sleeper_fp_mappings.txt", "r") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        sleeper_id, fp_id = line.split(":")
        sleeper_fp_map[sleeper_id] = fp_id

# Load FantasyCalc trade values, keyed by Sleeper ID for instant lookup.
fantasycalc_players = {}
with open("data/fantasycalc_player.txt", "r") as f:
    for entry in json.load(f):
        sleeper_id = entry["player"].get("sleeperId")
        if sleeper_id:
            fantasycalc_players[sleeper_id] = entry
