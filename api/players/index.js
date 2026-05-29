const mockTeams = [
  { id: 1, abbreviation: 'ATL', full_name: 'Atlanta Hawks' },
  { id: 8, abbreviation: 'DEN', full_name: 'Denver Nuggets' },
  { id: 10, abbreviation: 'GSW', full_name: 'Golden State Warriors' },
  { id: 14, abbreviation: 'LAL', full_name: 'Los Angeles Lakers' },
];

const mockPlayers = [
  { id: '203999', first_name: 'Nikola', last_name: 'Jokic', position: 'C', team: mockTeams[1] },
  { id: '2544', first_name: 'LeBron', last_name: 'James', position: 'F', team: mockTeams[3] },
  { id: '201950', first_name: 'Stephen', last_name: 'Curry', position: 'G', team: mockTeams[2] },
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

  const { search } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 24, 100);
  const page = parseInt(req.query.page) || 0;

  let results = mockPlayers;

  if (search) {
    const query = search.toLowerCase();
    results = results.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(query)
    );
  }

  const start = page * limit;
  const paginated = results.slice(start, start + limit);

  res.status(200).json({
    data: paginated,
    total: results.length,
    next_cursor: (start + limit < results.length) ? (page + 1).toString() : null
  });
}
