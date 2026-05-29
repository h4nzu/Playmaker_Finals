const mockTeams = [
  { id: 1, abbreviation: 'ATL', full_name: 'Atlanta Hawks', city: 'Atlanta', conference: 'East', division: 'Southeast' },
  { id: 2, abbreviation: 'BOS', full_name: 'Boston Celtics', city: 'Boston', conference: 'East', division: 'Atlantic' },
  { id: 3, abbreviation: 'BKN', full_name: 'Brooklyn Nets', city: 'Brooklyn', conference: 'East', division: 'Atlantic' },
  { id: 8, abbreviation: 'DEN', full_name: 'Denver Nuggets', city: 'Denver', conference: 'West', division: 'Northwest' },
  { id: 10, abbreviation: 'GSW', full_name: 'Golden State Warriors', city: 'Golden State', conference: 'West', division: 'Pacific' },
  { id: 14, abbreviation: 'LAL', full_name: 'Los Angeles Lakers', city: 'Los Angeles', conference: 'West', division: 'Pacific' },
];

const mockGames = [
  {
    id: '1',
    date: new Date().toISOString(),
    status: 'Final',
    home_team: mockTeams[0],
    visitor_team: mockTeams[1],
    home_team_score: 115,
    visitor_team_score: 110
  },
  {
    id: '2',
    date: new Date().toISOString(),
    status: 'Final',
    home_team: mockTeams[3],
    visitor_team: mockTeams[4],
    home_team_score: 120,
    visitor_team_score: 105
  }
];

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

export default function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { start_date, end_date } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 40, 100);
  const games = mockGames.slice(0, limit);

  res.status(200).json({
    data: games,
    total: games.length
  });
}
