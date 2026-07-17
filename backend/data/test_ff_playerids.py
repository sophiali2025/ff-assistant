"""
Test script to explore nflreadpy.load_ff_playerids data
Shows player ID mappings across different fantasy platforms
"""
import nflreadpy as nfl

# Load player ID mappings
print("Loading FF player IDs...")
df = nfl.load_ff_playerids()

# Show basic info
print(f"\nShape: {df.shape[0]} rows x {df.shape[1]} columns")
print(f"\nColumn names:")
print(df.columns)

print(f"\nFirst 10 rows:")
print(df.head(10))

print(f"\nData types:")
print(df.dtypes)

# Look for a specific player to show how mappings work
print("\n" + "="*60)
print("Example: Finding player IDs for a specific player")
print("="*60)

# Try to find a well-known player
sample_df = df.filter(df["name"].str.contains("Ja'Marr Chase"))
if sample_df.height > 0:
    print("\nJa'Marr Chase player IDs across platforms:")
    print(sample_df.select(["name", "position", "team", "sleeper_id", "espn_id", "yahoo_id", "fantasypros_id"]))

# Save to CSV for inspection
output_file = "ff_playerids_mappings.csv"
df.write_csv(output_file)
print(f"\n✓ Saved full dataset to {output_file}")

# Also save a summary
with open("ff_playerids_summary.txt", "w") as f:
    f.write("FF PLAYER IDS SUMMARY\n")
    f.write("=" * 50 + "\n\n")
    f.write(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns\n\n")
    f.write("Columns:\n")
    for col in df.columns:
        f.write(f"  - {col}\n")
    f.write(f"\nSample data (first 20 rows):\n")
    f.write(str(df.head(20)))

print("✓ Saved summary to ff_playerids_summary.txt")
