"""
Test script to explore nflreadpy.load_ff_opportunity data
Saves results to a CSV file for inspection
"""
import nflreadpy as nfl

# Load fantasy football opportunity data
print("Loading FF opportunity data...")
df = nfl.load_ff_opportunity(seasons=2025, stat_type="weekly")

# Show basic info
print(f"\nShape: {df.shape[0]} rows x {df.shape[1]} columns")
print(f"\nColumn names:")
print(df.columns)

print(f"\nFirst few rows:")
print(df.head())

print(f"\nData types:")
print(df.dtypes)

# Save to CSV for inspection
output_file = "ff_opportunity_sample.csv"
df.write_csv(output_file)
print(f"\n✓ Saved full dataset to {output_file}")

# Also save a summary
with open("ff_opportunity_summary.txt", "w") as f:
    f.write("FF OPPORTUNITY DATA SUMMARY\n")
    f.write("=" * 50 + "\n\n")
    f.write(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns\n\n")
    f.write("Columns:\n")
    for col in df.columns:
        f.write(f"  - {col}\n")
    f.write(f"\nSample data (first 10 rows):\n")
    f.write(str(df.head(10)))

print("✓ Saved summary to ff_opportunity_summary.txt")
