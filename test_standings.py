from nba_api.stats.endpoints import leaguestandings

# Fetch standings
standings_data = leaguestandings.LeagueStandings(season='2025').get_data_frames()
df = standings_data[0]

# Print available columns
print("Available columns in LeagueStandings:")
for col in df.columns:
    print(f"  {col}")

print("\n\nFirst few rows:")
print(df[["TeamName", "Conference", "Division", "WINS", "LOSSES"]].head(20))

# Check for rank fields
print("\n\nChecking for rank fields:")
rank_cols = [col for col in df.columns if 'rank' in col.lower()]
print(f"Found: {rank_cols}")
