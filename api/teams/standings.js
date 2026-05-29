function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

const mockStandings = [
  { team_id: 1, team_name: 'Atlanta Hawks', team_abbreviation: 'ATL', conference: 'East', division: 'Southeast', wins: 28, losses: 44, pct: 0.389, ppg: 115.2, opp_ppg: 117.3, diff: -2.1 },
  { team_id: 2, team_name: 'Boston Celtics', team_abbreviation: 'BOS', conference: 'East', division: 'Atlantic', wins: 48, losses: 24, pct: 0.667, ppg: 118.5, opp_ppg: 113.2, diff: 5.3 },
];

export default function handler(req, res) {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    data: mockStandings,
    total: mockStandings.length
  });
}
