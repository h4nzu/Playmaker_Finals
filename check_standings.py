from nba_api.stats.endpoints import leaguestandings

standings_data = leaguestandings.LeagueStandings(season='2025').get_data_frames()
df = standings_data[0]

# Sort by conference and wins
east = df[df['Conference'] == 'East'].sort_values('WINS', ascending=False)
west = df[df['Conference'] == 'West'].sort_values('WINS', ascending=False)

print('EAST (sorted by wins):')
for i, (_, row) in enumerate(east.iterrows(), 1):
    print(f'{i:2}. {row["TeamName"]:15} {int(row["WINS"])}-{int(row["LOSSES"])}  PlayoffRank={int(row["PlayoffRank"]):2}  DivRank={int(row["DivisionRank"])}')

print('\nWEST (sorted by wins):')
for i, (_, row) in enumerate(west.iterrows(), 1):
    print(f'{i:2}. {row["TeamName"]:15} {int(row["WINS"])}-{int(row["LOSSES"])}  PlayoffRank={int(row["PlayoffRank"]):2}  DivRank={int(row["DivisionRank"])}')
